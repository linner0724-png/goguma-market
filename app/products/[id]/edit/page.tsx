import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/ProductForm";
import { updateProduct } from "../../actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: product } = await supabase
    .from("products")
    .select("id, seller_id, title, price, region, description")
    .eq("id", id)
    .maybeSingle();
  if (!product) notFound();
  if (product.seller_id !== user.id) redirect(`/products/${id}`); // 남의 글은 수정 불가

  // bind: 서버 액션에 id를 미리 넣어둔 새 함수를 만듦
  const action = updateProduct.bind(null, id);

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">판매글 수정</h1>
      <ProductForm action={action} initial={product} submitLabel="수정 완료" />
    </div>
  );
}
