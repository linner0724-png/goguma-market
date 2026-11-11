"use server";
// 알바 구인글 등록/수정/삭제 서버 액션
// 본인 글만 수정/삭제할 수 있도록 DB의 RLS 정책이 최종적으로 막아줍니다.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isWageType } from "@/lib/jobs";

export type JobFormState = { error?: string };

function readForm(formData: FormData) {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const title = get("title");
  const wageType = get("wageType");
  const wageText = get("wage").replace(/[^0-9]/g, "");
  const wage = Number(wageText);
  const region = get("region");
  const workDays = get("workDays");
  const workTime = get("workTime");
  const description = get("description");

  if (title.length < 2 || title.length > 40) return { error: "제목은 2~40자로 입력해주세요." };
  if (!isWageType(wageType)) return { error: "급여 종류를 선택해주세요." };
  if (!wageText || wage <= 0) return { error: "급여를 입력해주세요." };
  if (wage > 100_000_000) return { error: "급여는 1억 원 이하로 입력해주세요." };
  if (!region || region.length > 20) return { error: "근무 동네를 입력해주세요. (20자 이내)" };
  if (!workDays || workDays.length > 30) return { error: "근무 요일을 입력해주세요. (30자 이내)" };
  if (!workTime || workTime.length > 30) return { error: "근무 시간을 입력해주세요. (30자 이내)" };
  if (description.length > 2000) return { error: "상세 내용은 2000자 이내로 입력해주세요." };

  return {
    data: {
      title,
      wage_type: wageType,
      wage,
      region,
      work_days: workDays,
      work_time: workTime,
      description,
    },
  };
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return supabase;
}

export async function createJob(_prev: JobFormState, formData: FormData): Promise<JobFormState> {
  const supabase = await requireUser();
  const parsed = readForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  // author_id는 DB 기본값(auth.uid())으로 자동 입력
  const { data, error } = await supabase.from("job_posts").insert(parsed.data).select("id").single();
  if (error) return { error: "등록에 실패했어요. 잠시 후 다시 시도해주세요." };

  revalidatePath("/jobs");
  redirect(`/jobs/${data.id}`);
}

export async function updateJob(id: number, _prev: JobFormState, formData: FormData): Promise<JobFormState> {
  const supabase = await requireUser();
  const parsed = readForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  // RLS 때문에 남의 글이면 0건이 수정됨 → select로 결과 확인
  const { data, error } = await supabase.from("job_posts").update(parsed.data).eq("id", id).select("id");
  if (error) return { error: "수정에 실패했어요. 잠시 후 다시 시도해주세요." };
  if (!data?.length) return { error: "본인 글만 수정할 수 있어요." };

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
  redirect(`/jobs/${id}`);
}

export async function deleteJob(id: number) {
  const supabase = await requireUser();
  await supabase.from("job_posts").delete().eq("id", id);

  revalidatePath("/jobs");
  redirect("/jobs");
}
