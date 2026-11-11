"use client";
// 삭제 전 확인창을 띄우는 버튼 (알바, 동네생활에서 사용)
// action: 글 id를 bind 해둔 "삭제" 서버 액션

export default function ConfirmDeleteButton({
  action,
  message = "삭제할까요? 삭제하면 되돌릴 수 없어요.",
}: {
  action: () => Promise<void>;
  message?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <button className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-red-500 hover:bg-red-50">
        삭제
      </button>
    </form>
  );
}
