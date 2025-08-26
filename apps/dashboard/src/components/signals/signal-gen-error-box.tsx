import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/utils/supabase/browser-client";
import { useMutation } from "@tanstack/react-query";
import { RenderIf } from "../shared";
import { Check } from "lucide-react";
import {
  getFeedbackContent,
  getUpdatedFeedbackContent,
  SignalFeedbackSubmissionOpts,
} from "@/lib/utils/feedback";
import { useSupabaseAuth } from "../providers";
import { Session } from "@supabase/supabase-js";

interface UpsertFeedbackReportOpts extends SignalFeedbackSubmissionOpts {
  feedbackId: number | null;
  session?: Session | null;
}

async function submitErrorReport({
  notes,
  prompt,
  errorReason,
  feedbackId,
  session,
}: UpsertFeedbackReportOpts) {
  const supabase = createSupabaseBrowserClient();

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  if (!session?.user) {
    throw new Error("User must be authenticated to submit feedback");
  }

  const user = session.user;

  let content: string;

  if (feedbackId) {
    content = getUpdatedFeedbackContent("", {
      notes,
      prompt,
      errorReason,
    });
  } else {
    content = getFeedbackContent({
      notes,
      prompt,
      errorReason,
    });
  }

  const upsertData = feedbackId
    ? { id: feedbackId, content, user_id: user.id }
    : { content, user_id: user.id };

  const { data, error } = await supabase
    .from("feedback")
    .upsert(upsertData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

interface SignalGenErrorBoxProps {
  latestPrompt: string;
  reason: string;
  feedbackId: number | null;
}

export function SignalGenErrorBox({
  reason,
  latestPrompt,
  feedbackId,
}: SignalGenErrorBoxProps) {
  const { session } = useSupabaseAuth();

  const [notes, setNotes] = useState("");

  const submitFeedbackMutation = useMutation({
    mutationFn: (notes: string) =>
      submitErrorReport({
        notes,
        prompt: latestPrompt,
        errorReason: reason,
        feedbackId,
        session,
      }),
  });

  const handleSubmit = () => {
    if (!notes.trim()) {
      throw new Error("No content!");
    }

    submitFeedbackMutation.mutate(notes);
  };

  return (
    <Card className="p-6 border bg-red-500/10 text-white">
      <div className="">
        {/* Title */}
        <h2 className="text-xl font-semibold">
          Sorry, failed to generate your signal.
        </h2>

        {/* Reason */}
        <p className="text-sm text-muted-foreground pt-4">
          An error occured while generating signal for the following reason:
          <br /> <strong>{reason}</strong> <br />
        </p>

        <p className="text-sm text-muted-foreground pt-4">
          This error has been automatically reported to our development team. If
          you’d like to provide more context, you can add additional details
          below to help us investigate further or describe why this signal is
          important to you.
        </p>

        {/* Notes input */}
        <div className="space-y-2 pt-4">
          <Label htmlFor="error-notes" className="text-sm font-medium">
            Additional notes (optional)
          </Label>

          <Textarea
            id="error-notes"
            placeholder="Please describe any additional context..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-20 bg-white"
            disabled={
              submitFeedbackMutation.isSuccess ||
              submitFeedbackMutation.isPending
            }
          />
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-3">
          <RenderIf condition={!submitFeedbackMutation.isSuccess}>
            <Button
              onClick={handleSubmit}
              className="bg-white text-black rounded-sm"
              disabled={!notes.trim() || submitFeedbackMutation.isPending}
            >
              {submitFeedbackMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </RenderIf>

          <RenderIf condition={submitFeedbackMutation.isSuccess}>
            <div className="italic flex">
              Thank you! <Check className="ml-2" />
            </div>
          </RenderIf>
        </div>
      </div>
    </Card>
  );
}
