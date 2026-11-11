"use client";
// 상세 페이지 사진 보기: 큰 사진 + 좌우 버튼 + 아래 점(인디케이터)

import { useState } from "react";
import { imageUrl } from "@/lib/images";

export default function ImageGallery({ paths, alt }: { paths: string[]; alt: string }) {
  const [index, setIndex] = useState(0);

  if (!paths.length) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-gray-100 text-8xl">
        🍠
      </div>
    );
  }

  const go = (d: number) => setIndex((i) => (i + d + paths.length) % paths.length);
  const arrowCls =
    "absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-xl shadow hover:bg-white";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl(paths[index])} alt={alt} className="aspect-[4/3] w-full object-cover" />

      {paths.length > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="이전 사진" className={`${arrowCls} left-3`}>
            ‹
          </button>
          <button type="button" onClick={() => go(1)} aria-label="다음 사진" className={`${arrowCls} right-3`}>
            ›
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {paths.map((p, i) => (
              <button
                key={p}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}번째 사진`}
                className={`h-2 w-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
