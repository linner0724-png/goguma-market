"use client";
// 좋아요 버튼
// useOptimistic: 서버 응답을 기다리지 않고 화면을 먼저 바꿔서(낙관적 업데이트) 즉시 반응하는 것처럼 보이게 함

import { startTransition, useOptimistic } from "react";
import { toggleLike } from "@/app/products/[id]/actions";

export default function LikeButton({
  productId,
  liked,
  count,
}: {
  productId: number;
  liked: boolean;
  count: number;
}) {
  const [state, setOptimistic] = useOptimistic({ liked, count });

  function onClick() {
    startTransition(async () => {
      setOptimistic({ liked: !state.liked, count: state.count + (state.liked ? -1 : 1) });
      await toggleLike(productId); // 로그인 안 했으면 서버 액션이 로그인 페이지로 보냄
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={state.liked}
      aria-label={state.liked ? "좋아요 취소" : "좋아요"}
      className="flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-sm font-semibold hover:bg-gray-50"
    >
      <span className={`text-lg leading-none ${state.liked ? "text-brand" : "text-gray-400"}`}>
        {state.liked ? "♥" : "♡"}
      </span>
      <span>{state.count}</span>
    </button>
  );
}
