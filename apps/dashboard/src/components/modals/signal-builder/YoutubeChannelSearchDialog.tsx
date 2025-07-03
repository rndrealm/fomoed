"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import clsx from "clsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { RenderIf } from "@/components/shared/render-if";
import { YouTubeIcon } from "@/components/icons/YouTube";
import { useEffect, useState } from "react";
import { ChannelsSearchResult } from "@/lib/types/models/signals-api.types";

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_BACKEND_BASE || "https://api.fomoed.io";

function YoutubeChannelSearchResultCard({
  result,
  selected,
  onSelect,
}: {
  result: ChannelsSearchResult;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      onClick={onSelect}
      className={clsx(
        "flex flex-col items-start cursor-pointer p-4 transition-colors border bg-[#212121] text-white gap-3",
        {
          "border-fomoed-red": selected,
          "border-transparent hover:border-white/20": !selected,
        },
      )}
    >
      <Avatar className="w-12 h-12 bg-transparent border border-white/10">
        <AvatarImage src={result.thumbnail} alt={result.title} />
        <AvatarFallback className="flex items-center justify-center w-full h-full bg-transparent">
          <User className="w-6 h-6 text-white/60" />
        </AvatarFallback>
      </Avatar>

      <CardContent className="p-0 flex flex-col">
        <div className="font-medium pb-0.5">{result.title}</div>
        <div className="text-xs text-muted-foreground">
          {result.description}
        </div>
      </CardContent>
    </Card>
  );
}

export function YoutubeChannelSearchDialog({
  onChannelIdPick,
}: {
  onChannelIdPick: (channelId: string | null) => void;
}) {
  const [pickedChannel, setPickedChannel] =
    useState<PickedYoutubeChannel | null>(null);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    if (!search) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      fetch(
        `${BACKEND_BASE}/api/v1/smart-signals/builder/yt/channels/search?s=${encodeURIComponent(
          search,
        )}`,
      )
        .then((res) => res.json())
        .then((data) => {
          setResults(Array.isArray(data) ? data : []);
        })
        .finally(() => setLoading(false));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (pickedChannel) {
      console.log("Picked channel:", pickedChannel);
      onChannelIdPick(pickedChannel.id);
    } else {
      onChannelIdPick(null);
    }
  }, [pickedChannel, onChannelIdPick]);

  function confirmSelectedChannel() {
    if (!selectedId) {
      console.error("No channel selected");
      return;
    }

    const selected = results.find((r) => (r.id || r.channelId) === selectedId);

    if (selected) {
      setPickedChannel({
        id: selectedId,
        name: selected.name || selected.title || "",
        avatarUrl: selected.avatar || selected.thumbnail || "",
      });

      onChannelIdPick(selectedId);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-white/20 bg-[#212121] text-white !py-5 h-12 group w-full text-left justify-start"
        >
          <Avatar className="border border-white/10 group-hover:border-black/50">
            <AvatarImage
              src={pickedChannel?.avatarUrl || ""}
              alt={pickedChannel?.name || "YouTube Channel"}
            />

            <AvatarFallback className="flex items-center justify-center w-full h-full bg-transparent">
              <div className="p-2">
                <YouTubeIcon />
              </div>
            </AvatarFallback>
          </Avatar>
          <span className="pl-1">
            {pickedChannel?.name ? pickedChannel.name : "Pick a Channel"}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="!w-[1000px] h-[600px] p-6 bg-[#080808] rounded-2xl text-white select-none flex flex-col">
        <DialogHeader>
          <DialogTitle>Search YouTube Channels</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search for a channel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-white/20 !placeholder-white/50 py-5"
          />
          <Search className="absolute left-9 text-muted-foreground pointer-events-none w-4 h-4" />
        </div>

        <div className="flex-1 overflow-y-scroll max-h-full pt-4">
          <div className="grid gap-3">
            <RenderIf condition={loading}>
              <div className="text-muted-foreground text-sm px-2 py-4 w-full text-center">
                Loading...
              </div>
            </RenderIf>

            <RenderIf condition={!loading && results.length === 0 && !!search}>
              <div className="text-muted-foreground text-sm px-2 py-4 w-full">
                No results found.
              </div>
            </RenderIf>

            <RenderIf condition={!loading && results.length > 0}>
              {results.map((result: any) => (
                <YoutubeChannelSearchResultCard
                  key={result.id || result.channelId}
                  result={result}
                  selected={selectedId === (result.id || result.channelId)}
                  onSelect={() => setSelectedId(result.id || result.channelId)}
                />
              ))}
            </RenderIf>
          </div>
        </div>

        <DialogFooter className="pt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setSelectedId(null);
            }}
            className="px-6 bg-[##121212] hover:bg-[#212121] hover:text-white"
          >
            Back
          </Button>

          <Button
            disabled={!selectedId}
            onClick={() => {
              setOpen(false);
              confirmSelectedChannel();
            }}
            className="px-6 bg-fomoed-red disabled:bg-transparent ring-fomoed-red disabled:ring"
          >
            Pick Channel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type PickedYoutubeChannel = {
  id: string;
  name: string;
  avatarUrl: string;
};

export default YoutubeChannelSearchDialog;
