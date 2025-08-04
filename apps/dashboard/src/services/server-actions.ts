import { cache } from "react";
import { extract as extractArticle } from "@extractus/article-extractor";
import { createSupabaseServerWithAnonKey } from "@/lib/utils/supabase/server-client";
import { notFound } from "next/navigation";

export const fetchPostContent = cache(async (id: string) => {
  const url = new URL(
    `/api/newslab-posts/${id}`,
    process.env.PUBLIC_NEWSLAB_URL,
  );

  const res = await fetch(url);

  const text = await res.text();
  return text;
});

export const fetchArticleContent = cache(async (id: string) => {
  const supabase = await createSupabaseServerWithAnonKey();
  // const { data, error } = await supabase.from("news").select("*").eq("id", id).single();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .or(`id.eq.${id},slug.eq.${id}`)
    .single();

  if (error) {
    notFound();
  }

  if (!data.original_url) {
    notFound();
  }

  const article = await extractArticle(data.original_url, {
    wordsPerMinute: 250,
  });

  if (!article) {
    notFound();
  }

  return { ...data, extractedArticle: article };
});

export type FetchArticleContentType = Awaited<
  ReturnType<typeof fetchArticleContent>
>;
