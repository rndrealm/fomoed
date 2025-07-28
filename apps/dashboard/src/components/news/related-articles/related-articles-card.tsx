import TokenPill from "../token-pill";
import { NewsFeedItem } from "@/services/queries/news/types";
import { timeAgo, truncateText } from "@/lib/utils";
import RemoteImage from "../../widgets/shared/remote-image";
import BookmarkComp from "../shared/BookmarkComp";
import dashboard from "@/lib/assets/dashboard";
import Link from "next/link";
import { AppRoutes } from "@/lib/routes";


interface ICardProps {
  article: NewsFeedItem;
}

export const RelatedArticleCard = (props: ICardProps) => {
  const { article } = props;
  return (
    <div className="mb-3 border-b border-[#212121] pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {article.symbols?.slice(0, 2).map((symbol, index) => (
            <TokenPill key={index} symbol={symbol} />
          ))}
        </div>
        <BookmarkComp newsId={article.id} />
      </div>
      <Link href={AppRoutes.news.newsPage.path(article.id)}>
      <div className="flex items-center justify-between gap-6 pt-1 pb-4 md:gap-16">
        <div className="flex-1">
          <h3 className="text-xs text-[#A4A4A4]">{article.source}</h3>
          <h1 className="pt-1 pb-2 text-base leading-[1.625rem] font-medium md:text-lg">
            {truncateText(article.title)}
          </h1>
          <h3 className="text-xs text-[#A4A4A4]">{timeAgo(article.published_at)}</h3>
        </div>
        <div className="relative h-[5.6875rem] w-[5.6875rem]">
          <RemoteImage
            src={article.image_url}
            fallback={dashboard.fallback}
            width={91}
            height={91}
            alt="News mock"
            className="rounded-[10px] object-cover"
          />
        </div>
      </div>
      </Link>
    </div>
  );
};
