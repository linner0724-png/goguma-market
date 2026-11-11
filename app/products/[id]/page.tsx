import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, timeAgo } from "@/lib/format";
import DeleteProductButton from "@/components/DeleteProductButton";
import ImageGallery from "@/components/ImageGallery";
import LikeButton from "@/components/LikeButton";
import CommentForm from "@/components/CommentForm";
import { deleteComment } from "./actions";

// 조인 결과가 객체 또는 배열로 올 수 있어서 닉네임 꺼내는 함수
// (DB 타입을 생성하지 않아서 TS는 배열로 추론하지만, 실제로는 객체 1개가 옴)
function nicknameOf(profiles: unknown) {
  const p = (Array.isArray(profiles) ? profiles[0] : profiles) as { nickname?: string } | null;
  return p?.nickname ?? "알 수 없음";
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const supabase = await createClient();
  const [{ data: product }, { data: auth }, { data: comments }, { count: likeCount }] =
    await Promise.all([
      supabase
        .from("products")
        // profiles!products_seller_id_fkey(nickname): seller_id 외래키로 판매자 닉네임을 함께 가져옴
        // (좋아요/댓글 테이블을 거쳐 profiles로 가는 길도 생겨서, 어느 외래키인지 꼭 적어줘야 함)
        .select(
          "id, seller_id, title, price, region, description, images, created_at, profiles!products_seller_id_fkey(nickname)"
        )
        .eq("id", id)
        .maybeSingle(),
      supabase.auth.getUser(),
      supabase
        .from("product_comments")
        .select("id, user_id, content, created_at, profiles!product_comments_user_id_fkey(nickname)")
        .eq("product_id", id)
        .order("created_at", { ascending: true }),
      // head: true → 행은 안 가져오고 개수만 셈
      supabase.from("product_likes").select("*", { count: "exact", head: true }).eq("product_id", id),
    ]);
  if (!product) notFound();

  const userId = auth.user?.id;
  const isMine = userId === product.seller_id;

  // 내가 좋아요 눌렀는지
  let liked = false;
  if (userId) {
    const { data } = await supabase
      .from("product_likes")
      .select("product_id")
      .eq("product_id", id)
      .eq("user_id", userId)
      .maybeSingle();
    liked = !!data;
  }

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <ImageGallery paths={product.images ?? []} alt={product.title} />

      {/* 판매자 */}
      <div className="flex items-center gap-3 border-b border-gray-100 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-lg">
          🙂
        </div>
        <div>
          <p className="font-semibold">{nicknameOf(product.profiles)}</p>
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
      <div className="border-b border-gray-100 py-6">
        <h1 className="text-xl font-bold">{product.title}</h1>
        <p className="mt-1 text-sm text-gray-400">{timeAgo(product.created_at)}</p>
        <p className="mt-3 text-lg font-bold">{formatPrice(product.price)}</p>
        <p className="mt-5 whitespace-pre-wrap leading-relaxed text-gray-800">
          {product.description || "설명이 없어요."}
        </p>
        <div className="mt-6">
          <LikeButton productId={product.id} liked={liked} count={likeCount ?? 0} />
        </div>
      </div>

      {/* 댓글 */}
      <section className="py-6">
        <h2 className="mb-4 font-bold">
          댓글 <span className="text-brand">{comments?.length ?? 0}</span>
        </h2>

        <ul className="mb-5 flex flex-col gap-4">
          {comments?.map((c) => (
            <li key={c.id} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm">
                🙂
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <b>{nicknameOf(c.profiles)}</b>
                  {c.user_id === product.seller_id && (
                    <span className="ml-1.5 rounded bg-brand-light px-1.5 py-0.5 text-[11px] font-semibold text-brand">
                      판매자
                    </span>
                  )}
                  <span className="ml-2 text-gray-400">{timeAgo(c.created_at)}</span>
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-[15px] text-gray-800">{c.content}</p>
              </div>
              {c.user_id === userId && (
                <form action={deleteComment.bind(null, c.id, product.id)}>
                  <button className="text-xs text-gray-400 hover:text-red-500">삭제</button>
                </form>
              )}
            </li>
          ))}
          {!comments?.length && <li className="text-sm text-gray-400">첫 댓글을 남겨보세요.</li>}
        </ul>

        {userId ? (
          <CommentForm productId={product.id} />
        ) : (
          <Link
            href={`/login?next=/products/${product.id}`}
            className="flex h-11 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600 hover:bg-gray-200"
          >
            로그인하고 댓글 남기기
          </Link>
        )}
      </section>
    </article>
  );
}
