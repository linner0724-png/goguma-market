import AuthForm from "@/components/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-center text-2xl font-bold">로그인</h1>
      <p className="mb-8 mt-2 text-center text-sm text-gray-500">
        고구마마켓에 오신 걸 환영해요 🍠
      </p>
      <AuthForm mode="login" initialError={error ? "인증에 실패했어요. 다시 시도해주세요." : undefined} />
    </div>
  );
}
