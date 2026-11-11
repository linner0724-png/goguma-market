import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-center text-2xl font-bold">회원가입</h1>
      <p className="mb-8 mt-2 text-center text-sm text-gray-500">
        우리 동네 이웃과 따뜻한 거래를 시작해요
      </p>
      <AuthForm mode="signup" />
    </div>
  );
}
