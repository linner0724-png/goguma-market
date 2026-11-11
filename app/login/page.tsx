import AuthForm from "@/components/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  // 판매글 쓰기/수정 페이지에서 튕겨져 온 경우
  const fromProducts = next?.startsWith("/products/");

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-center text-2xl font-bold">로그인</h1>
      <p className="mb-8 mt-2 text-center text-sm text-gray-500">
        고구마마켓에 오신 걸 환영해요 🍠
      </p>
      {fromProducts && (
        <p className="mb-4 rounded-lg bg-brand-light px-4 py-3 text-center text-sm font-semibold text-brand-dark">
          로그인 후 판매글을 올릴 수 있어요.
        </p>
      )}
      <AuthForm
        mode="login"
        next={next}
        initialError={error ? "인증에 실패했어요. 다시 시도해주세요." : undefined}
      />
    </div>
  );
}
