import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { nicknameOf, timeAgo } from "@/lib/format";
import { TOPICS, isTopic, topicOf } from "@/lib/community";

export const metadata = { title: "동네생활 - 고구마마켓" };

function TopicChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition ${
        active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic: rawTopic } = await searchParams;
  const topic = isTopic(rawTopic) ? rawTopic : null;

  const supabase = await createClient();
  let query = supabase
    .from("community_posts")
    // 작성자 닉네임 + 댓글 수. 댓글 테이블 때문에 profiles 가는 길이 여러 개라 외래키 명시
    .select(
      "id, topic, title, content, region, created_at, profiles!community_posts_author_id_fkey(nickname), community_comments(count)"
    )
    .order("created_at", { ascending: false })
    .limit(50);
  if (topic) query = query.eq("topic", topic);
  const { data: posts } = await query;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">동네생활</h1>
        <Link
          href="/community/new"
          className="flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + 글쓰기
        </Link>
      </div>
      <p className="mb-6 text-sm text-gray-500">우리 동네 이웃들과 궁금한 것, 소식을 나눠요.</p>

      <nav className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1">
        <TopicChip href="/community" active={!topic}>
          전체
        </TopicChip>
        {TOPICS.map((t) => (
          <TopicChip key={t.value} href={`/community?topic=${t.value}`} active={topic === t.value}>
            {t.emoji} {t.label}
          </TopicChip>
        ))}
      </nav>

      {!posts?.length ? (
        <p className="py-20 text-center text-gray-500">
          {topic ? "이 주제에는 아직 글이 없어요." : "아직 글이 없어요. 첫 글을 남겨보세요!"}
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 border-y border-gray-100">
          {posts.map((post) => {
            const t = topicOf(post.topic);
            const commentCount = post.community_comments?.[0]?.count ?? 0;
            return (
              <li key={post.id}>
                <Link href={`/community/${post.id}`} className="block py-5 hover:bg-gray-50">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                    {t.emoji} {t.label}
                  </span>
                  <h2 className="mt-2 truncate text-[16px] font-semibold">{post.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{post.content}</p>
                  <p className="mt-2 flex gap-2 text-xs text-gray-400">
                    <span>
                      {nicknameOf(post.profiles)} · {post.region} · {timeAgo(post.created_at)}
                    </span>
                    {commentCount > 0 && <span>💬 {commentCount}</span>}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
