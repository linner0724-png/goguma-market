import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import JobForm from "@/components/JobForm";
import { createJob } from "../actions";

export default async function NewJobPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/jobs/new");

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">알바 구하기</h1>
      <JobForm action={createJob} submitLabel="작성 완료" />
    </div>
  );
}
