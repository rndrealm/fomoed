import { NewsContent } from "@/components/news";

export default async function Page() {
  const text = "";

  return (
    <div className="pt-[96px] bg-[#0C0C0C] h-screen overflow-auto pt-10 pb-14 px-4">
      <NewsContent content={text} />
    </div>
  );
}
