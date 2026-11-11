"use client";
// 동네생활 글 등록/수정 공용 폼

import { useActionState } from "react";
import type { PostFormState } from "@/app/community/actions";
import { TOPICS } from "@/lib/community";

const inputCls =
  "h-12 w-full rounded-lg border border-gray-200 px-4 text-[15px] outline-none placeholder:text-gray-400 focus:border-brand";

type Initial = { topic: string; title: string; content: string; region: string };

export default function CommunityForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: PostFormState, formData: FormData) => Promise<PostFormState>;
  initial?: Initial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* 주제: 라디오 버튼을 칩 모양으로 */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-semibold">주제</legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <label key={t.value} className="cursor-pointer">
              <input
                type="radio"
                name="topic"
                value={t.value}
                defaultChecked={initial ? initial.topic === t.value : t.value === "question"}
                className="peer sr-only"
              />
              <span className="flex h-9 items-center rounded-full border border-gray-200 px-4 text-sm font-semibold text-gray-700 peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40">
                {t.emoji} {t.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-2">
        <span className="font-semibold">제목</span>
        <input name="title" defaultValue={initial?.title} placeholder="제목 (2~60자)" maxLength={60} className={inputCls} required />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-semibold">내용</span>
        <textarea
          name="content"
          defaultValue={initial?.content}
          placeholder="우리 동네 이웃과 이야기를 나눠보세요."
          maxLength={3000}
          rows={10}
          required
          className="w-full resize-none rounded-lg border border-gray-200 p-4 text-[15px] outline-none placeholder:text-gray-400 focus:border-brand"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-semibold">동네</span>
        <input name="region" defaultValue={initial?.region} placeholder="예: 역삼동" maxLength={20} className={inputCls} required />
      </label>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <button
        disabled={pending}
        className="h-12 rounded-lg bg-brand text-[15px] font-bold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "잠시만요..." : submitLabel}
      </button>
    </form>
  );
}
