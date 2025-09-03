import { NextRequest } from "next/server";

type EmailAction = {
  type: "email";
  subject: string;
  content: string;
};

type NotificationAction = {
  type: "notification";
  description: string;
};

export interface NewSignalRequestBody {
  name: string;
  description: string;
  condition: string;
  actions: Array<EmailAction | NotificationAction>;
}

// Not a complete data source structure, just an extract
interface DataSource {
  prefix: string;
  message_field: string;
}

async function fetchDataSources(): Promise<DataSource[]> {
  const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_SMART_SIGNALS_BASE + "/data-sources");

  const data = await res.json();
  const dataSources = data["data_sources"];

  return dataSources as DataSource[];
}

export async function GET(request: NextRequest) {

}