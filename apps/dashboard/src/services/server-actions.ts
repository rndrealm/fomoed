import { cache } from "react";
export const fetchPostContent = cache(async (id: string) => {
  const url = new URL(
    `/api/newslab-posts/${id}`,
    process.env.PUBLIC_NEWSLAB_URL
  );

  const res = await fetch(url);

  const text = await res.text();
  return text;
});
