export interface SignalFeedbackSubmissionOpts {
  notes?: string;
  prompt?: string;
  errorReason?: string;
}

export function getUpdatedFeedbackContent(
  existingContent: string,
  { notes, prompt, errorReason }: SignalFeedbackSubmissionOpts,
): string {
  let content = existingContent;

  if (prompt) {
    content += `<prompt>${prompt}</prompt>`;
  }

  if (errorReason) {
    content += `<error>${errorReason}</error>`;
  }

  if (notes) {
    content += `<notes>${notes}</notes>`;
  }

  return content;
}

export function getFeedbackContent({
  notes,
  prompt,
  errorReason,
}: SignalFeedbackSubmissionOpts): string {
  return getUpdatedFeedbackContent("", {
    notes,
    prompt,
    errorReason,
  });
}
