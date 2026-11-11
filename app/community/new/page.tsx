import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CommunityForm from "@/components/CommunityForm";
import { createPost } from "../actions";

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/community/new");

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">동네생활 글쓰기</h1>
      <CommunityForm action={createPost} submitLabel="작성 완료" />
    </div>
  );
}
