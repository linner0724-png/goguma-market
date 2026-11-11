"use client";
// 판매글 사진 업로드 (최대 5장)
// 1) 사진을 고르면 브라우저에서 줄인 뒤 Supabase Storage에 바로 업로드
// 2) 업로드된 경로를 숨은 input(name="images")으로 폼과 함께 서버 액션에 전달
//    → 서버로는 사진 파일이 아니라 "경로 글자"만 가므로 요청이 가벼움

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compressImage";
import { IMAGE_BUCKET, MAX_IMAGES, imageUrl } from "@/lib/images";

type Item = { key: string; path?: string; preview: string };

export default function ImageUploader({
  userId,
  initialPaths = [],
  onUploadingChange,
}: {
  userId: string;
  initialPaths?: string[];
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [items, setItems] = useState<Item[]>(
    initialPaths.map((path) => ({ key: path, path, preview: imageUrl(path) }))
  );
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    setError(undefined);
    const files = Array.from(fileList ?? []);
    if (inputRef.current) inputRef.current.value = ""; // 같은 파일 다시 고를 수 있게

    const room = MAX_IMAGES - items.length;
    if (files.length > room) setError(`사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.`);
    const picked = files.slice(0, Math.max(0, room));
    if (!picked.length) return;

    // 먼저 미리보기를 보여주고(업로드 중 표시), 업로드가 끝나면 path를 채움
    const pending = picked.map((file) => ({
      key: crypto.randomUUID(),
      preview: URL.createObjectURL(file),
      file,
    }));
    setItems((prev) => [...prev, ...pending.map(({ key, preview }) => ({ key, preview }))]);
    onUploadingChange?.(true);

    const supabase = createClient();
    await Promise.all(
      pending.map(async ({ key, file }) => {
        try {
          const blob = await compressImage(file);
          const path = `${userId}/${crypto.randomUUID()}.jpg`; // RLS: 본인 폴더에만 업로드 가능
          const { error } = await supabase.storage
            .from(IMAGE_BUCKET)
            .upload(path, blob, { contentType: "image/jpeg" });
          if (error) throw error;
          setItems((prev) => prev.map((it) => (it.key === key ? { ...it, path } : it)));
        } catch {
          setError("사진 업로드에 실패했어요. 다시 시도해주세요.");
          setItems((prev) => prev.filter((it) => it.key !== key));
        }
      })
    );
    onUploadingChange?.(false);
  }

  function remove(key: string) {
    const target = items.find((it) => it.key === key);
    setItems((prev) => prev.filter((it) => it.key !== key));
    setError(undefined);

    // 이번에 새로 올린 사진이면 Storage에서 바로 삭제 (안 지우면 쓰레기 파일로 남음)
    // 원래 글에 있던 사진은 "수정 완료"를 눌렀을 때 서버 액션이 지움 (취소할 수도 있으니까)
    if (target?.path && !initialPaths.includes(target.path)) {
      createClient().storage.from(IMAGE_BUCKET).remove([target.path]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold">
        사진 <span className="font-normal text-gray-400">({items.length}/{MAX_IMAGES})</span>
      </span>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50"
          >
            <span className="text-2xl">📷</span>
            <span className="text-xs">사진 추가</span>
          </button>
        )}

        {items.map((it, i) => (
          <div key={it.key} className="relative h-20 w-20 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.preview} alt="" className="h-full w-full rounded-lg border border-gray-100 object-cover" />
            {!it.path && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 text-xs font-semibold text-white">
                올리는 중
              </div>
            )}
            {i === 0 && it.path && (
              <span className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gray-900/80 py-0.5 text-center text-[11px] font-semibold text-white">
                대표 사진
              </span>
            )}
            {it.path && (
              <button
                type="button"
                onClick={() => remove(it.key)}
                aria-label="사진 삭제"
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs text-white"
              >
                ✕
              </button>
            )}
            {it.path && <input type="hidden" name="images" value={it.path} />}
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
