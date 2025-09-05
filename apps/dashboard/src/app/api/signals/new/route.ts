import { newInvalidRequestBodyError, newNotAuthenticatedError, newUserNotFoundError } from "@/lib/api/api.errors";
import { Database } from "@/lib/database/supabase";
import {
  asNextResponseData,
  asNextResponseError,
  ErrorOrData,
  ErrorWrapper,
  makeErrorWrapper,
} from "@/lib/utils/server.utils";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/utils/supabase/server-client";
import { NextRequest } from "next/server";
import { z } from "zod";

type DataSourcePrefix = string;

const EmailActionSchema = z.object({
  type: z.literal("email"),
  subject: z.string(),
  content: z.string(),
});

const NotificationActionSchema = z.object({
  type: z.literal("notification"),
  description: z.string(),
});

const NewSignalRequestBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  condition: z.string(),
  actions: z.array(z.union([EmailActionSchema, NotificationActionSchema])),
});

export type NewSignalRequestBody = z.infer<typeof NewSignalRequestBodySchema>;

// Not a complete data source structure, just an extract
interface DataSource {
  prefix: string;
  message_field: string;
  allowed_topics: string[];
}

async function fetchDataSources(): Promise<DataSource[]> {
  const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_SMART_SIGNALS_BASE + "/data-sources");

  const data = await res.json();
  const dataSources = data["data_sources"];

  return dataSources as DataSource[];
}

function extractTopics(jsonStr: string) {
  const re = /"topic"\s*:\s*"([^"]+)"/g;
  const topics: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = re.exec(jsonStr)) !== null) {
    topics.push(match[1]);
  }

  return topics;
}

function convertTopicsToArray(v: any, dataSourceToFieldNameMap: { [key: string]: string }) {
  if (typeof v === "object" && v !== null) {
    // Handle object (map equivalent)
    if (!Array.isArray(v)) {
      for (const [k, subVal] of Object.entries(v)) {
        if (k === "topic") {
          if (typeof subVal === "string") {
            const dataSourcePrefix = subVal.split("-")[0];
            const arr: any[] = [subVal];
            if (dataSourcePrefix in dataSourceToFieldNameMap) {
              arr.push(dataSourceToFieldNameMap[dataSourcePrefix]);
            } else {
              throw new Error(`data source mapping not found for topic: ${dataSourcePrefix}`);
            }
            v[k] = arr;
          }
        } else {
          convertTopicsToArray(subVal, dataSourceToFieldNameMap);
          v[k] = subVal;
        }
      }
    }
    // Handle array
    else {
      for (let i = 0; i < v.length; i++) {
        convertTopicsToArray(v[i], dataSourceToFieldNameMap);
        v[i] = v[i];
      }
    }
  }
  return null;
}

function convertConditionTopicsToArray(
  conditionStr: string,
  dataSourceToFieldName: Record<DataSourcePrefix, string>,
): ErrorOrData<string> {
  const condition = JSON.parse(conditionStr);

  try {
    convertTopicsToArray(condition, dataSourceToFieldName);
  } catch {
    return { error: makeErrorWrapper(`failed to convert topics to array`, 500) };
  }

  return { data: JSON.stringify(condition) };
}

function validateTopics(topics: string[], availableDataSources: DataSource[]): ErrorWrapper | null {
  for (const topic of topics) {
    // Split data source prefix and topic
    const parts = topic.split("-");

    if (parts.length < 2) {
      return makeErrorWrapper(`invalid topic format: ${topic}`, 400);
    }

    const prefix = parts[0];
    const subtopic = parts.slice(1).join("-"); // Rejoin in case topic contains dashes

    if (prefix === "" || subtopic === "") {
      return makeErrorWrapper(`data source prefix or topic cannot be empty in topic: ${topic}`, 400);
    }

    // Validate that this topic is available
    const isValidDataSource = availableDataSources.some((availableDataSource) => availableDataSource.prefix === prefix);

    if (!isValidDataSource) {
      return makeErrorWrapper(
        `invalid data source prefix '${prefix}' in topic '${topic}'. Only values of the 'prefix' field of available data sources can be used.`,
        400,
      );
    }

    // Validate that this subtopic is available
    const isValidSubtopic = availableDataSources.some((availableDataSource) =>
      availableDataSource.allowed_topics.includes(subtopic),
    );

    if (!isValidSubtopic) {
      return makeErrorWrapper(
        `invalid subtopic '${subtopic}' in topic '${topic}'. Only values of the 'allowed_topics' field of available data sources can be used.`,
        400,
      );
    }
  }

  return null;
}

async function triggerSignalEvaluation(
  signal: Database["public"]["Tables"]["smart_signals"]["Row"],
): Promise<ErrorOrData<void>> {
  try {
    fetch(process.env.NEXT_PUBLIC_BACKEND_SMART_SIGNALS_BASE + "/evaluate-signal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ signal }),
    });
  } catch (e) {
    return { error: makeErrorWrapper(`failed to trigger signal evaluation: ${e}`, 500) };
  }

  return { data: undefined };
}

export async function POST(request: NextRequest) {
  const supabaseUserClient = await createSupabaseServerClient();
  const supabaseServiceClient = await createSupabaseServiceClient();

  const { data: userData, error: userError } = await supabaseUserClient.auth.getUser();

  if (!userData.user) {
    return newNotAuthenticatedError();
  }

  const { data: usersTableUserData, error: usersTableUserError } = await supabaseServiceClient
    .from("users")
    .select("id")
    .eq("user_id", userData.user.id)
    .single();

  if (usersTableUserError) {
    console.error(usersTableUserError);

    return newUserNotFoundError();
  }

  // The integer user ID is being interpreted by the smart signal processor at this moment
  const userIdForSmartSignal = usersTableUserData.id;

  // Get signal from request body
  const { success, data: ssDto, error } = NewSignalRequestBodySchema.safeParse(await request.json());

  if (!success) {
    return newInvalidRequestBodyError(error);
  }

  // Automatically populate topics
  const topics = extractTopics(ssDto.condition);

  // Fetch available data sources for validation
  const availableDataSources = await fetchDataSources();

  // Validate all mentioned data sources exist
  const validationErrorW = validateTopics(topics, availableDataSources);

  if (validationErrorW) {
    return asNextResponseError(validationErrorW);
  }

  // Get data source to field name mapping
  const dataSourceToFieldNameMap: Record<DataSourcePrefix, string> = {};
  for (const ds of availableDataSources) {
    dataSourceToFieldNameMap[ds.prefix] = ds.message_field;
  }

  // Convert for example {"topic": "CFGI-BTC"} to {"topic": ["CFGI-BTC", "cfgi"]}, where "cfgi"
  // is the field name in the kafka message that should be taken as the value during evaluation
  // This is a hotfix to make the API compatible with the existing system, but the existing sys
  // tem should be refactored in the future.
  const { error: conditionManipulationError, data: manipulatedCondition } = convertConditionTopicsToArray(
    ssDto.condition,
    dataSourceToFieldNameMap,
  );

  if (conditionManipulationError) {
    return asNextResponseError(conditionManipulationError);
  }

  const ssToInsert: Database["public"]["Tables"]["smart_signals"]["Insert"] = {
    ...ssDto,
    condition: manipulatedCondition,
    topics,
    user_id: userIdForSmartSignal,
  };

  const { error: ssInsertErr, data: ssInsertData } = await supabaseServiceClient
    .from("smart_signals")
    .insert(ssToInsert)
    .select()
    .single();

  if (ssInsertErr) {
    return asNextResponseError({ message: "Failed to insert smart signal", status: 500, detail: ssInsertErr });
  }

  const { error: evaluationError } = await triggerSignalEvaluation(ssInsertData);

  if (evaluationError) {
    return asNextResponseError(evaluationError);
  }

  return asNextResponseData({ signal: ssInsertData });
}
