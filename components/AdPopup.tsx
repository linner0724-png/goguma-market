"use client";
// 첫 화면 광고 팝업
// - "오늘 하루 보지 않기": 오늘 날짜를 localStorage(브라우저 저장소)에 기록 → 오늘은 다시 안 뜸
// - "닫기": 이번에만 닫음 (새로고침하면 다시 뜸)

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "goguma-ad-hidden-date";

function today() {
  return new Date().toLocaleDateString("ko-KR");
}

export default function AdPopup() {
  // 서버에서는 localStorage를 볼 수 없으므로, 처음엔 숨겨두고 브라우저에서 확인 후 띄움
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== today()) setOpen(true);
    } catch {
      setOpen(true); // 저장소를 못 쓰는 환경(시크릿 모드 등)에서는 그냥 띄움
    }
  }, []);

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  function hideToday() {
    try {
      localStorage.setItem(STORAGE_KEY, today());
    } catch {}
    setOpen(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={() => setOpen(false)} // 바깥(어두운 부분) 클릭 시 닫기
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="고구마마켓 이벤트"
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 광고 내용 */}
        <div className="bg-brand px-6 pb-8 pt-10 text-center text-white">
          <p className="text-sm font-semibold opacity-90">🎉 오픈 기념 이벤트</p>
          <p className="mt-2 text-2xl font-extrabold leading-snug">
            첫 판매글 올리면
            <br />
            군고구마 쿠폰을 드려요!
          </p>
          <p className="mt-4 text-7xl leading-none">🍠</p>
          <p className="mt-4 text-sm opacity-90">이웃과 첫 거래를 시작해보세요</p>
        </div>
        <div className="px-6 py-5">
          <Link
            href="/products/new"
            onClick={() => setOpen(false)}
            className="flex h-12 items-center justify-center rounded-lg bg-gray-900 font-bold text-white hover:bg-gray-700"
          >
            판매글 올리러 가기
          </Link>
        </div>

        {/* 하단 버튼 */}
        <div className="flex border-t border-gray-100 text-sm text-gray-600">
          <button type="button" onClick={hideToday} className="flex-1 py-3.5 hover:bg-gray-50">
            오늘 하루 보지 않기
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 border-l border-gray-100 py-3.5 font-semibold hover:bg-gray-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
