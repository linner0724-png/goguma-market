"use client";
// 알바 구인글 등록/수정 공용 폼

import { useActionState } from "react";
import type { JobFormState } from "@/app/jobs/actions";
import { WAGE_TYPES } from "@/lib/jobs";

const inputCls =
  "h-12 w-full rounded-lg border border-gray-200 px-4 text-[15px] outline-none placeholder:text-gray-400 focus:border-brand";

type Initial = {
  title: string;
  wage_type: string;
  wage: number;
  region: string;
  work_days: string;
  work_time: string;
  description: string;
};

export default function JobForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: JobFormState, formData: FormData) => Promise<JobFormState>;
  initial?: Initial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="font-semibold">제목</span>
        <input name="title" defaultValue={initial?.title} placeholder="예: 카페 주말 알바 구해요" maxLength={40} className={inputCls} required />
      </label>

      <div className="flex flex-col gap-2">
        <span className="font-semibold">급여</span>
        <div className="flex gap-2">
          <select name="wageType" defaultValue={initial?.wage_type ?? "hourly"} className={`${inputCls} w-28 shrink-0 bg-white`}>
            {WAGE_TYPES.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
          <input name="wage" inputMode="numeric" defaultValue={initial?.wage} placeholder="₩ 금액" className={inputCls} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-2">
          <span className="font-semibold">근무 요일</span>
          <input name="workDays" defaultValue={initial?.work_days} placeholder="예: 월~금, 주말" maxLength={30} className={inputCls} required />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-semibold">근무 시간</span>
          <input name="workTime" defaultValue={initial?.work_time} placeholder="예: 10:00~15:00" maxLength={30} className={inputCls} required />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="font-semibold">근무 동네</span>
        <input name="region" defaultValue={initial?.region} placeholder="예: 역삼동" maxLength={20} className={inputCls} required />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-semibold">상세 내용</span>
        <textarea
          name="description"
          defaultValue={initial?.description}
          placeholder="하는 일, 우대 사항, 연락 방법 등을 적어주세요."
          maxLength={2000}
          rows={8}
          className="w-full resize-none rounded-lg border border-gray-200 p-4 text-[15px] outline-none placeholder:text-gray-400 focus:border-brand"
        />
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
