"use client";

import React, { useState } from "react";
import { ExternalLink, ChevronLeft, ChevronRight, X } from "lucide-react";
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
  { id: 7, src: esportsAssets.photo24, alt: "Trading Esports" },
  { id: 8, src: esportsAssets.photo25, alt: "Trading Esports" },
  { id: 9, src: esportsAssets.photo26, alt: "Trading Esports" },
  { id: 10, src: esportsAssets.photo33, alt: "Trading Esports" },
];

const GOOGLE_DRIVE_LINK =
  "https://drive.google.com/drive/folders/15QSYVZkutqTXChnEVH0BPclkwHCex-Zl";

export default function EventPhotos() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const openLightbox = (photo: Photo) => setSelectedPhoto(photo);
  const closeLightbox = () => setSelectedPhoto(null);

  const goToNext = () => {
    if (!selectedPhoto) return;
    const currentIndex = eventPhotos.findIndex((p) => p.id === selectedPhoto.id);
    const nextIndex = (currentIndex + 1) % eventPhotos.length;
    setSelectedPhoto(eventPhotos[nextIndex]);
  };

  const goToPrev = () => {
    if (!selectedPhoto) return;
    const currentIndex = eventPhotos.findIndex((p) => p.id === selectedPhoto.id);
    const prevIndex = (currentIndex - 1 + eventPhotos.length) % eventPhotos.length;
    setSelectedPhoto(eventPhotos[prevIndex]);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-white mb-3">Trading Esport Competition</h1>
        <p className="text-gray-400 text-xl">
          Highlights from our latest competitive event
        </p>
      </div>

      {/* Layout */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 mb-12">
        {eventPhotos.map((photo) => (
          <div
            key={photo.id}
            className="break-inside-avoid mb-4 cursor-pointer group relative overflow-hidden rounded-lg"
            onClick={() => openLightbox(photo)}
          >
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
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">
                  View Full Size
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-center shadow-xl">
        <h2 className="text-3xl font-bold text-white mb-3">Want to see more?</h2>
        <p className="text-blue-100 mb-6 text-lg">
          View the complete photo collection on Google Drive
        </p>

        <a
          href={GOOGLE_DRIVE_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg"
        >
          <ExternalLink size={20} />
          Open Google Drive
        </a>
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X size={32} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Previous photo"
          >
            <ChevronLeft size={48} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Next photo"
          >
            <ChevronRight size={48} />
          </button>

          <div
            className="max-w-6xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[80vh] flex items-center justify-center">
              <Image
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                fill
                className="object-contain rounded-lg"
                sizes="100vw"
                placeholder="blur"
              />
            </div>
            <p className="text-white mt-4 text-center text-lg">
              {selectedPhoto.alt}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
