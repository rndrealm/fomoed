"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import esportsAssets from "@/lib/assets/esports";

type Photo = {
  id: number;
  src: StaticImageData;
  alt: string;
};

const eventPhotos: Photo[] = [
  { id: 1, src: esportsAssets.photo12, alt: "Trading Esports" },
  { id: 2, src: esportsAssets.photo13, alt: "Trading Esports" },
  { id: 3, src: esportsAssets.photo14, alt: "Trading Esports" },
  { id: 4, src: esportsAssets.photo21, alt: "Trading Esports" },
  { id: 5, src: esportsAssets.photo22, alt: "Trading Esports" },
  { id: 6, src: esportsAssets.photo23, alt: "Trading Esports" },

  // Featured
  { id: 7, src: esportsAssets.photo24, alt: "Trading Esports" },

  { id: 8, src: esportsAssets.photo25, alt: "Trading Esports" },
  { id: 9, src: esportsAssets.photo26, alt: "Trading Esports" },
  { id: 10, src: esportsAssets.photo33, alt: "Trading Esports" },
];

const GOOGLE_DRIVE_LINK = "https://drive.google.com/drive/folders/15QSYVZkutqTXChnEVH0BPclkwHCex-Zl";

export default function EventPhotos() {
  const featured = eventPhotos.find((p) => p.id === 7);
  const regularPhotos = eventPhotos.filter((p) => p.id !== 7);

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-white mb-3">Fomoed2 Trading Esport Competition</h1>
        <p className="text-gray-400 text-xl">Trading Garden, Estufa Fria Lisbon 2025</p>
      </div>

      {featured && (
        <div className="w-full flex justify-center mb-4">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-xl group">
            <Image
              src={featured.src}
              alt={featured.alt}
              width={featured.src.width}
              height={featured.src.height}
              className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
              sizes="100vw"
              placeholder="blur"
            />
          </div>
        </div>
      )}

      {/* Masonry Layout for the rest */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 mb-12">
        {regularPhotos.map((photo) => (
          <div key={photo.id} className="break-inside-avoid mb-4 group relative overflow-hidden rounded-lg">
            <div className="relative w-full">
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.src.width}
                height={photo.src.height}
                className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                placeholder="blur"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-8 text-center shadow-xl">
        <h2 className="text-3xl font-bold text-black mb-3">Want to see more?</h2>
        <p className="text-gray-700 mb-6 text-lg">View the complete photo collection on Google Drive</p>

        <a
          href={GOOGLE_DRIVE_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-neutral-800 transition-colors duration-200 shadow-lg"
        >
          <ExternalLink size={20} />
          Open Google Drive
        </a>
      </div>
    </div>
  );
}
