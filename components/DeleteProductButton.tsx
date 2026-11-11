"use client";
// 삭제 전 확인창을 띄우는 버튼

import { deleteProduct } from "@/app/products/actions";

export default function DeleteProductButton({ id }: { id: number }) {
  return (
    <form
      action={deleteProduct.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm("판매글을 삭제할까요? 삭제하면 되돌릴 수 없어요.")) e.preventDefault();
      }}
    >
      <button className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-red-500 hover:bg-red-50">
        삭제
      </button>
    </form>
  );
}
