import { Footer } from "@/components/news";
import React from "react";
import { cache } from "react";

export const getNews = cache(async (id: string) => {
  const url = new URL(
    `/api/newslab-posts/${id}`,
    process.env.PUBLIC_NEWSLAB_URL
  );

  const res = await fetch(url);

  const text = await res.text();
  return text;
});

export async function generateMetadata({ params }: { params: { id: string } }) {
  const url = new URL(
    `/api/newslab/single-post?id=${params.id}`,
    "https://localhost:3000"
  );

  const res = await fetch(url);
  const post = await res.json();

  return {
    title: post.title,
    description: post.description,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const news = await getNews(id);

  return (
    <div className="pt-[96px] bg-[#0C0C0C] h-screen overflow-auto">
      <p className="text-white">Hello from news page</p>
      <Footer />
    </div>
  );
}
