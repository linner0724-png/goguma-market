"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "@/app/auth/actions";

const inputCls =
  "h-12 w-full rounded-lg border border-gray-200 px-4 text-[15px] outline-none placeholder:text-gray-400 focus:border-brand";

export default function AuthForm({
  mode,
  initialError,
  next,
}: {
  mode: "login" | "signup";
  initialError?: string;
  next?: string; // 로그인 후 돌아갈 주소
}) {
  const isLogin = mode === "login";
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    isLogin ? login : signup,
    { error: initialError }
  );

  if (state.message) {
    return (
      <div className="rounded-xl bg-brand-light p-6 text-center">
        <p className="text-4xl">📮</p>
        <p className="mt-3 font-semibold">{state.message}</p>
        <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-brand">
          로그인하러 가기 →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {isLogin && next && <input type="hidden" name="next" value={next} />}
      {!isLogin && (
        <input name="nickname" placeholder="닉네임 (2~12자)" className={inputCls} required />
      )}
      <input name="email" type="email" placeholder="이메일" className={inputCls} required />
      <input
        name="password"
        type="password"
        placeholder={isLogin ? "비밀번호" : "비밀번호 (6자 이상)"}
        className={inputCls}
        required
      />
      {!isLogin && (
        <input
          name="passwordConfirm"
          type="password"
          placeholder="비밀번호 확인"
          className={inputCls}
          required
        />
      )}

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <button
        disabled={pending}
        className="mt-2 h-12 rounded-lg bg-brand text-[15px] font-bold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "잠시만요..." : isLogin ? "로그인" : "가입하기"}
      </button>

      <p className="mt-4 text-center text-sm text-gray-500">
        {isLogin ? "아직 회원이 아니신가요? " : "이미 계정이 있나요? "}
        <Link href={isLogin ? "/signup" : "/login"} className="font-semibold text-brand">
          {isLogin ? "회원가입" : "로그인"}
        </Link>
      </p>
    </form>
  );
}
