import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { nicknameOf, timeAgo } from "@/lib/format";
import { topicOf } from "@/lib/community";
import CommentForm from "@/components/CommentForm";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import { addPostComment, deletePost, deletePostComment } from "../actions";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const supabase = await createClient();
  const [{ data: post }, { data: auth }, { data: comments }] = await Promise.all([
    supabase
      .from("community_posts")
      // 댓글 테이블 때문에 profiles 가는 길이 여러 개라 외래키 명시
      .select("id, author_id, topic, title, content, region, created_at, profiles!community_posts_author_id_fkey(nickname)")
      .eq("id", id)
      .maybeSingle(),
    supabase.auth.getUser(),
    supabase
      .from("community_comments")
      .select("id, author_id, content, created_at, profiles!community_comments_author_id_fkey(nickname)")
      .eq("post_id", id)
      .order("created_at", { ascending: true }),
  ]);
  if (!post) notFound();

  const userId = auth.user?.id;
  const isMine = userId === post.author_id;
  const t = topicOf(post.topic);

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/community" className="text-sm text-gray-500 hover:text-gray-800">
        ← 동네생활
      </Link>

      <div className="mt-4">
        <Link
          href={`/community?topic=${t.value}`}
          className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 hover:bg-gray-200"
        >
          {t.emoji} {t.label}
        </Link>
      </div>

      {/* 작성자 */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-lg">🙂</div>
        <div>
          <p className="font-semibold">{nicknameOf(post.profiles)}</p>
          <p className="text-sm text-gray-500">
            {post.region} · {timeAgo(post.created_at)}
          </p>
        </div>
        {isMine && (
          <div className="ml-auto flex gap-2">
            <Link
              href={`/community/${post.id}/edit`}
              className="flex h-10 items-center rounded-lg border border-gray-200 px-4 text-sm font-semibold hover:bg-gray-50"
            >
              수정
            </Link>
            <ConfirmDeleteButton action={deletePost.bind(null, post.id)} message="글을 삭제할까요? 댓글도 함께 삭제돼요." />
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="border-b border-gray-100 py-6">
        <h1 className="text-xl font-bold">{post.title}</h1>
        <p className="mt-4 whitespace-pre-wrap leading-relaxed text-gray-800">{post.content}</p>
      </div>

      {/* 댓글 */}
      <section className="py-6">
        <h2 className="mb-4 font-bold">
          댓글 <span className="text-brand">{comments?.length ?? 0}</span>
        </h2>

        <ul className="mb-5 flex flex-col gap-4">
          {comments?.map((c) => (
            <li key={c.id} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm">🙂</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <b>{nicknameOf(c.profiles)}</b>
                  {c.author_id === post.author_id && (
                    <span className="ml-1.5 rounded bg-brand-light px-1.5 py-0.5 text-[11px] font-semibold text-brand">
                      작성자
                    </span>
                  )}
                  <span className="ml-2 text-gray-400">{timeAgo(c.created_at)}</span>
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-[15px] text-gray-800">{c.content}</p>
              </div>
              {c.author_id === userId && (
                <form action={deletePostComment.bind(null, c.id, post.id)}>
                  <button className="text-xs text-gray-400 hover:text-red-500">삭제</button>
                </form>
              )}
            </li>
          ))}
          {!comments?.length && <li className="text-sm text-gray-400">첫 댓글을 남겨보세요.</li>}
        </ul>

        {userId ? (
          <CommentForm action={addPostComment.bind(null, post.id)} />
        ) : (
          <Link
            href={`/login?next=/community/${post.id}`}
            className="flex h-11 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600 hover:bg-gray-200"
          >
            로그인하고 댓글 남기기
          </Link>
        )}
      </section>
    </article>
  );
}
