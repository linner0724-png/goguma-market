"use client";
// 판매글 등록/수정 공용 폼

import { useActionState, useState } from "react";
import type { ProductFormState } from "@/app/products/actions";
import ImageUploader from "./ImageUploader";
import { CATEGORIES } from "@/lib/categories";

const inputCls =
  "h-12 w-full rounded-lg border border-gray-200 px-4 text-[15px] outline-none placeholder:text-gray-400 focus:border-brand";

type Initial = {
  title: string;
  price: number;
  region: string;
  description: string;
  images: string[];
  category: string;
};

export default function ProductForm({
  action,
  userId,
  initial,
  submitLabel,
}: {
  action: (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  userId: string;
  initial?: Initial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [isFree, setIsFree] = useState(initial?.price === 0);
  const [uploading, setUploading] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <ImageUploader
        userId={userId}
        initialPaths={initial?.images}
        onUploadingChange={setUploading}
      />

      <label className="flex flex-col gap-2">
        <span className="font-semibold">제목</span>
        <input name="title" defaultValue={initial?.title} placeholder="제목 (2~40자)" maxLength={40} className={inputCls} required />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-semibold">카테고리</span>
        <select
          name="category"
          defaultValue={initial?.category ?? ""}
          required
          className={`${inputCls} bg-white`}
        >
          <option value="" disabled>
            카테고리를 선택해주세요
          </option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2">
        <span className="font-semibold">가격</span>
        <div className="flex items-center gap-3">
          <input
            name="price"
            inputMode="numeric"
            defaultValue={initial && initial.price > 0 ? initial.price : ""}
            placeholder={isFree ? "나눔" : "₩ 가격을 입력해주세요"}
            disabled={isFree}
            className={`${inputCls} disabled:bg-gray-50`}
          />
          <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[15px]">
            <input
              type="checkbox"
              name="isFree"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="h-4 w-4 accent-brand"
            />
            나눔하기
          </label>
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="font-semibold">거래 희망 동네</span>
        <input name="region" defaultValue={initial?.region} placeholder="예: 역삼동" maxLength={20} className={inputCls} required />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-semibold">자세한 설명</span>
        <textarea
          name="description"
          defaultValue={initial?.description}
          placeholder="신뢰할 수 있는 거래를 위해 자세히 적어주세요."
          maxLength={2000}
          rows={8}
          className="w-full resize-none rounded-lg border border-gray-200 p-4 text-[15px] outline-none placeholder:text-gray-400 focus:border-brand"
        />
      </label>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <button
        disabled={pending || uploading}
        className="h-12 rounded-lg bg-brand text-[15px] font-bold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {uploading ? "사진 올리는 중..." : pending ? "잠시만요..." : submitLabel}
      </button>
    </form>
  );
}
