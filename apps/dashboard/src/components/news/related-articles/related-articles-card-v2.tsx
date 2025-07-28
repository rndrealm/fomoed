import TokenPill from "../token-pill";
import { Bookmark } from "../../icons/icons";
import { NewsFeedItem, NullableNewsFeedItem } from "@/services/queries/news/types";
import { timeAgo, truncateText } from "@/lib/utils";
import RemoteImage from "../../widgets/shared/remote-image";
import BookmarkComp from "../shared/BookmarkComp";
import dashboard from "@/lib/assets/dashboard";
import Link from "next/link";
import { AppRoutes } from "@/lib/routes";
import { Fragment } from "react";

interface ICardProps {
  article: NullableNewsFeedItem;
}

export const RelatedArticleCardV2 = (props: ICardProps) => {
  const { article } = props;
  return (
    <div className="relative">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {article.symbols?.slice(0, 2).map((symbol, index) => (
            <TokenPill key={index} symbol={symbol} />
          ))}
        </div>
        <BookmarkComp newsId={article.id} />
      </div>
      <Link href={AppRoutes.news.newsPage.path(article.id)}>
        <div className="relative">
          <RemoteImage
            src={article.image_url}
            width={279}
            height={291}
            fallback={dashboard.fallback}
            alt="News mock"
            className="rounded-[16px] object-cover"
          />
        </div>
        <div className="pt-2">
          <h3 className="text-xs text-[#A4A4A4]">{article.source || "Fomoed news"}</h3>
          <h1 className="pb-2 text-base font-medium md:text-lg">{truncateText(article.title)}</h1>
          <p className="text-xs text-[#A4A4A4]">{timeAgo(article.published_at || "")}</p>
        </div>
      </Link>
    </div>
  );
};
