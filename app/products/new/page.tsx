import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/ProductForm";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">내 물건 팔기</h1>
      <ProductForm action={createProduct} submitLabel="작성 완료" />
    </div>
  );
}
