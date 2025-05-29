"use client";

import ErrorComponent from "@/components/shared/error-component";

const content = {
  error: "500",
  message: "Something went wrong.",
  message2: "An unexpected error occurred on our end. Please try again later.",
  label: "Refresh the page",
};

export default function NotFound() {
  return <ErrorComponent content={content} />;
}
