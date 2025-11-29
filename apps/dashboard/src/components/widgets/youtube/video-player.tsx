import React from "react";
import { ArrowLeft } from "lucide-react";

interface VideoPlayerProps {
  videoId: string;
  onBack?: () => void;
  backLabel?: string;
}

export function VideoPlayer({ videoId, onBack, backLabel = "Back to results" }: VideoPlayerProps) {
  return (
    <div className="w-full h-full flex flex-col">
      {onBack && (
        <div className="px-2 py-2 bg-black">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#272727] rounded-lg transition-colors text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{backLabel}</span>
          </button>
        </div>
      )}

      <div className="flex-1">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&fs=1&iv_load_policy=3&disablekb=0`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </div>
  );
}