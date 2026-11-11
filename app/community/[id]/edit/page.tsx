import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CommunityForm from "@/components/CommunityForm";
import { updatePost } from "../../actions";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/community/${id}/edit`);

  const { data: post } = await supabase
    .from("community_posts")
    .select("id, author_id, topic, title, content, region")
    .eq("id", id)
    .maybeSingle();
  if (!post) notFound();
  if (post.author_id !== user.id) redirect(`/community/${id}`); // 남의 글은 수정 불가

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">동네생활 글 수정</h1>
      <CommunityForm action={updatePost.bind(null, id)} initial={post} submitLabel="수정 완료" />
    </div>
  );
}
