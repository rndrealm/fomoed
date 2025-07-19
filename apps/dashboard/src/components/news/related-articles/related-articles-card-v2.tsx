import TokenPill from "../token-pill";
import { Bookmark } from "../../icons/icons";
import { NewsFeedItem } from "@/services/queries/news/types";
import { timeAgo, truncateText } from "@/lib/utils";
import RemoteImage from "../../widgets/shared/remote-image";
import BookmarkComp from "../shared/BookmarkComp";

interface ICardProps {
  article: NewsFeedItem;
}

export const RelatedArticleCardV2 = (props: ICardProps) => {
  const { article } = props;
  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {article.symbols?.slice(0, 2).map((symbol, index) => (
            <TokenPill key={index} symbol={symbol} />
          ))}
        </div>
        <BookmarkComp newsId={article.id} />
      </div>
      <div className="relative">
        <RemoteImage
          src={article.image_url}
          width={279}
          height={291}
          alt="News mock"
          className="rounded-[16px] object-cover"
        />
      </div>
      <div className="pt-2">
        <h3 className="text-xs text-[#A4A4A4]">{article.source}</h3>
        <h1 className="pb-2 text-lg font-medium">{truncateText(article.title)}</h1>
        <p className="text-xs text-[#A4A4A4]">{timeAgo(article.published_at)}</p>
      </div>
    </div>
  );
};
