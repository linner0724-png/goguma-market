"use server";
// 판매글 상세의 좋아요/댓글 서버 액션
// 본인 것만 추가/삭제할 수 있도록 DB RLS 정책이 한 번 더 막아줍니다.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser(productId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // 로그인 후 이 판매글로 다시 돌아오게
  if (!user) redirect(`/login?next=/products/${productId}`);
  return { supabase, user };
}

// 좋아요 누르기/취소 (토글)
export async function toggleLike(productId: number) {
  const { supabase, user } = await requireUser(productId);

  const { data: liked } = await supabase
    .from("product_likes")
    .select("product_id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (liked) {
    await supabase.from("product_likes").delete().eq("product_id", productId).eq("user_id", user.id);
  } else {
    // user_id는 DB 기본값(auth.uid())으로 자동 입력
    await supabase.from("product_likes").insert({ product_id: productId });
  }

  revalidatePath("/");
  revalidatePath(`/products/${productId}`);
}

type CommentState = { error?: string; ok?: number };

export async function addComment(
  productId: number,
  _prev: CommentState,
  formData: FormData
): Promise<CommentState> {
  const { supabase } = await requireUser(productId);

  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { error: "댓글 내용을 입력해주세요." };
  if (content.length > 500) return { error: "댓글은 500자 이내로 입력해주세요." };

  const { error } = await supabase.from("product_comments").insert({ product_id: productId, content });
  if (error) return { error: "댓글 등록에 실패했어요. 잠시 후 다시 시도해주세요." };

  revalidatePath("/");
  revalidatePath(`/products/${productId}`);
  return { ok: Date.now() }; // 매번 다른 값 → 폼이 입력칸을 비우는 신호로 사용
}

export async function deleteComment(commentId: number, productId: number) {
  const { supabase } = await requireUser(productId);
  await supabase.from("product_comments").delete().eq("id", commentId); // 남의 댓글이면 RLS가 막음

  revalidatePath("/");
  revalidatePath(`/products/${productId}`);
}
