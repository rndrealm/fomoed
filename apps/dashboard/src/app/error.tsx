"use client";

import ErrorComponent from "@/components/shared/error-component";

const content = {
  error: "500",
  message: "Something went wrong.",
  message2:
    "It looks like the dashboard ran into a glitch. Don’t worry a quick refresh should fix it.",
  label: "Reload Dashboard",
};

export default function NotFound() {
  return <ErrorComponent content={content} />;
}