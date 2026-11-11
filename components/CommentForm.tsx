"use client";
// 댓글 입력창 (중고거래, 동네생활에서 같이 사용)
// action: 글 id를 bind 해둔 "댓글 등록" 서버 액션

import { useActionState, useEffect, useRef } from "react";

export type CommentState = { error?: string; ok?: number };

export default function CommentForm({
  action,
}: {
  action: (prev: CommentState, formData: FormData) => Promise<CommentState>;
}) {
  const [state, formAction, pending] = useActionState<CommentState, FormData>(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  // 등록에 성공하면 입력칸 비우기
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="content"
          placeholder="댓글을 남겨보세요"
          maxLength={500}
          autoComplete="off"
          className="h-11 flex-1 rounded-lg border border-gray-200 px-4 text-[15px] outline-none placeholder:text-gray-400 focus:border-brand"
        />
        <button
          disabled={pending}
          className="h-11 shrink-0 rounded-lg bg-brand px-4 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {pending ? "등록 중" : "등록"}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
    </form>
  );
}
