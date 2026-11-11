import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import JobForm from "@/components/JobForm";
import { updateJob } from "../../actions";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/jobs/${id}/edit`);

  const { data: job } = await supabase
    .from("job_posts")
    .select("id, author_id, title, wage_type, wage, region, work_days, work_time, description")
    .eq("id", id)
    .maybeSingle();
  if (!job) notFound();
  if (job.author_id !== user.id) redirect(`/jobs/${id}`); // 남의 글은 수정 불가

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">알바글 수정</h1>
      <JobForm action={updateJob.bind(null, id)} initial={job} submitLabel="수정 완료" />
    </div>
  );
}
