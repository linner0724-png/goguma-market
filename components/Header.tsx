import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nickname: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", user.id)
      .single();
    nickname = data?.nickname ?? null;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-1.5">
          <span className="text-2xl">🍠</span>
          <span className="text-xl font-extrabold tracking-tight text-brand">고구마마켓</span>
        </Link>

        <nav className="hidden gap-6 text-[15px] font-semibold text-gray-700 md:flex">
          <Link href="/" className="hover:text-gray-400">중고거래</Link>
          <span className="cursor-default text-gray-400">동네생활</span>
          <span className="cursor-default text-gray-400">알바</span>
        </nav>

        <div className="ml-auto hidden flex-1 md:block md:max-w-xs">
          <input
            type="search"
            placeholder="물품이나 동네를 검색해보세요"
            className="h-10 w-full rounded-lg bg-gray-100 px-4 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-brand/40"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {user ? (
            <>
              <span className="hidden text-sm text-gray-600 sm:inline">
                <b className="text-gray-900">{nickname ?? "이웃"}</b>님
              </span>
              <form action={logout}>
                <button className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold hover:bg-gray-50">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
