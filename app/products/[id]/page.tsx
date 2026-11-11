import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, timeAgo } from "@/lib/format";
import DeleteProductButton from "@/components/DeleteProductButton";
import ImageGallery from "@/components/ImageGallery";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const supabase = await createClient();
  const [{ data: product }, { data: auth }] = await Promise.all([
    supabase
      .from("products")
      // profiles(nickname): seller_id 외래키로 판매자 닉네임을 함께 가져옴
      .select("id, seller_id, title, price, region, description, images, created_at, profiles(nickname)")
      .eq("id", id)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);
  if (!product) notFound();

  const isMine = auth.user?.id === product.seller_id;
  // DB 타입을 생성하지 않아서 TS는 배열로 추론하지만, 실제로는 객체 1개가 옴
  const seller = Array.isArray(product.profiles) ? product.profiles[0] : product.profiles;
  const nickname: string = seller?.nickname ?? "알 수 없음";

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <ImageGallery paths={product.images ?? []} alt={product.title} />

      {/* 판매자 */}
      <div className="flex items-center gap-3 border-b border-gray-100 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-lg">
          🙂
        </div>
        <div>
          <p className="font-semibold">{nickname}</p>
          <p className="text-sm text-gray-500">{product.region}</p>
        </div>
        {isMine && (
          <div className="ml-auto flex gap-2">
            <Link
              href={`/products/${product.id}/edit`}
              className="flex h-10 items-center rounded-lg border border-gray-200 px-4 text-sm font-semibold hover:bg-gray-50"
            >
              수정
            </Link>
            <DeleteProductButton id={product.id} />
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="py-6">
        <h1 className="text-xl font-bold">{product.title}</h1>
        <p className="mt-1 text-sm text-gray-400">{timeAgo(product.created_at)}</p>
        <p className="mt-3 text-lg font-bold">{formatPrice(product.price)}</p>
        <p className="mt-5 whitespace-pre-wrap leading-relaxed text-gray-800">
          {product.description || "설명이 없어요."}
        </p>
      </div>
    </article>
  );
}
