"use server";
// 동네생활 글 등록/수정/삭제 + 댓글 서버 액션
// 본인 것만 수정/삭제할 수 있도록 DB의 RLS 정책이 최종적으로 막아줍니다.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isTopic } from "@/lib/community";
import type { CommentState } from "@/components/CommentForm";

export type PostFormState = { error?: string };

function readForm(formData: FormData) {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const topic = get("topic");
  const title = get("title");
  const content = get("content");
  const region = get("region");

  if (!isTopic(topic)) return { error: "주제를 선택해주세요." };
  if (title.length < 2 || title.length > 60) return { error: "제목은 2~60자로 입력해주세요." };
  if (!content) return { error: "내용을 입력해주세요." };
  if (content.length > 3000) return { error: "내용은 3000자 이내로 입력해주세요." };
  if (!region || region.length > 20) return { error: "동네를 입력해주세요. (20자 이내)" };

  return { data: { topic, title, content, region } };
}

// next: 로그인 안 했을 때 로그인 후 돌아올 주소
async function requireUser(next = "/community") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${next}`);
  return supabase;
}

export async function createPost(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  const supabase = await requireUser("/community/new");
  const parsed = readForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  // author_id는 DB 기본값(auth.uid())으로 자동 입력
  const { data, error } = await supabase.from("community_posts").insert(parsed.data).select("id").single();
  if (error) return { error: "등록에 실패했어요. 잠시 후 다시 시도해주세요." };

  revalidatePath("/community");
  redirect(`/community/${data.id}`);
}

export async function updatePost(id: number, _prev: PostFormState, formData: FormData): Promise<PostFormState> {
  const supabase = await requireUser(`/community/${id}/edit`);
  const parsed = readForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  // RLS 때문에 남의 글이면 0건이 수정됨 → select로 결과 확인
  const { data, error } = await supabase.from("community_posts").update(parsed.data).eq("id", id).select("id");
  if (error) return { error: "수정에 실패했어요. 잠시 후 다시 시도해주세요." };
  if (!data?.length) return { error: "본인 글만 수정할 수 있어요." };

  revalidatePath("/community");
  revalidatePath(`/community/${id}`);
  redirect(`/community/${id}`);
}

export async function deletePost(id: number) {
  const supabase = await requireUser();
  await supabase.from("community_posts").delete().eq("id", id); // 댓글은 DB에서 함께 삭제(cascade)

  revalidatePath("/community");
  redirect("/community");
}

export async function addPostComment(postId: number, _prev: CommentState, formData: FormData): Promise<CommentState> {
  const supabase = await requireUser(`/community/${postId}`);

  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { error: "댓글 내용을 입력해주세요." };
  if (content.length > 500) return { error: "댓글은 500자 이내로 입력해주세요." };

  const { error } = await supabase.from("community_comments").insert({ post_id: postId, content });
  if (error) return { error: "댓글 등록에 실패했어요. 잠시 후 다시 시도해주세요." };

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
  return { ok: Date.now() }; // 매번 다른 값 → 폼이 입력칸을 비우는 신호
}

export async function deletePostComment(commentId: number, postId: number) {
  const supabase = await requireUser(`/community/${postId}`);
  await supabase.from("community_comments").delete().eq("id", commentId); // 남의 댓글이면 RLS가 막음

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
}
