import { Footer } from "@/components/news";
import React from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const url = new URL(
    `/api/newslab-posts/${id}`,
    process.env.PUBLIC_NEWSLAB_URL
  );

  const res = await fetch(url);

  const text = await res.text();

  return (
    <div className="pt-[96px] bg-[#0C0C0C] h-screen overflow-auto">
      <p className="text-white">Hello from news page</p>
      <Footer />
    </div>
  );
}
