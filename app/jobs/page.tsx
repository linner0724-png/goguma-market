import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/format";
import { formatWage } from "@/lib/jobs";

export const metadata = { title: "알바 - 고구마마켓" };

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("job_posts")
    .select("id, title, wage_type, wage, region, work_days, work_time, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">동네 알바</h1>
        <Link
          href="/jobs/new"
          className="flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + 알바 구하기
        </Link>
      </div>
      <p className="mb-8 text-sm text-gray-500">걸어서 갈 수 있는 우리 동네 일자리를 찾아보세요.</p>

      {!jobs?.length ? (
        <p className="py-20 text-center text-gray-500">아직 등록된 알바가 없어요.</p>
      ) : (
        <ul className="divide-y divide-gray-100 border-y border-gray-100">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link href={`/jobs/${job.id}`} className="flex gap-4 py-5 hover:bg-gray-50">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand-light text-3xl">
                  💼
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[16px] font-semibold">{job.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {job.region} · {timeAgo(job.created_at)}
                  </p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <b className="text-brand">{formatWage(job.wage_type, job.wage)}</b>
                    <span className="text-gray-600">
                      {job.work_days} · {job.work_time}
                    </span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
