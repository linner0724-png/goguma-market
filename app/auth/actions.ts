"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

// Supabase 영어 에러 메시지를 한국어로
function toKorean(msg: string) {
  if (msg.includes("Invalid login credentials")) return "이메일 또는 비밀번호가 올바르지 않아요.";
  if (msg.includes("Email not confirmed")) return "이메일 인증을 먼저 완료해주세요.";
  if (msg.includes("User already registered")) return "이미 가입된 이메일이에요.";
  if (msg.includes("Password should be")) return "비밀번호는 6자 이상이어야 해요.";
  if (msg.includes("rate limit")) return "요청이 너무 많아요. 잠시 후 다시 시도해주세요.";
  return msg;
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "이메일과 비밀번호를 입력해주세요." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: toKorean(error.message) };

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

// 로그인 후 돌아갈 주소. 우리 사이트 안의 경로("/..."로 시작)만 허용
// ("//evil.com" 같은 외부 주소로 보내는 공격을 막기 위해)
function safeNext(value: FormDataEntryValue | null) {
  const next = String(value ?? "");
  const isInternal = next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\");
  return isInternal ? next : "/";
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();

  if (nickname.length < 2 || nickname.length > 12)
    return { error: "닉네임은 2~12자로 입력해주세요." };
  if (password.length < 6) return { error: "비밀번호는 6자 이상이어야 해요." };
  if (password !== passwordConfirm) return { error: "비밀번호가 서로 달라요." };

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname }, // → DB 트리거가 profiles 테이블에 저장
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) return { error: toKorean(error.message) };

  // 이메일 인증이 꺼져 있으면 바로 세션이 생김
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  return { message: `${email} 로 인증 메일을 보냈어요. 메일의 링크를 눌러 가입을 완료해주세요.` };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
