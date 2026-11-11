import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { nicknameOf, timeAgo } from "@/lib/format";
import { formatWage } from "@/lib/jobs";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import { deleteJob } from "../actions";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const supabase = await createClient();
  const [{ data: job }, { data: auth }] = await Promise.all([
    supabase
      .from("job_posts")
      .select(
        "id, author_id, title, wage_type, wage, region, work_days, work_time, description, created_at, profiles!job_posts_author_id_fkey(nickname)"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);
  if (!job) notFound();

  const isMine = auth.user?.id === job.author_id;

  const infoRows = [
    { label: "급여", value: formatWage(job.wage_type, job.wage) },
    { label: "근무 요일", value: job.work_days },
    { label: "근무 시간", value: job.work_time },
    { label: "근무 동네", value: job.region },
  ];

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/jobs" className="text-sm text-gray-500 hover:text-gray-800">
        ← 알바 목록
      </Link>

      <h1 className="mt-4 text-2xl font-bold">{job.title}</h1>
      <p className="mt-2 text-sm text-gray-500">
        {nicknameOf(job.profiles)} · {timeAgo(job.created_at)}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-gray-50 p-5 sm:grid-cols-4">
        {infoRows.map((r) => (
          <div key={r.label}>
            <dt className="text-xs text-gray-500">{r.label}</dt>
            <dd className="mt-1 font-semibold">{r.value}</dd>
          </div>
        ))}
      </dl>

      <section className="py-8">
        <h2 className="mb-3 font-bold">상세 내용</h2>
        <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
          {job.description || "상세 내용이 없어요."}
        </p>
      </section>

      {isMine && (
        <div className="flex gap-2 border-t border-gray-100 pt-6">
          <Link
            href={`/jobs/${job.id}/edit`}
            className="flex h-10 items-center rounded-lg border border-gray-200 px-4 text-sm font-semibold hover:bg-gray-50"
          >
            수정
          </Link>
          <ConfirmDeleteButton action={deleteJob.bind(null, job.id)} message="알바글을 삭제할까요? 삭제하면 되돌릴 수 없어요." />
        </div>
      )}
    </article>
  );
}
