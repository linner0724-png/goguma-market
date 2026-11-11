import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, timeAgo } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import AdPopup from "@/components/AdPopup";

export default async function Home() {
  // 최신 판매글 목록
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, title, price, region, images, created_at")
    .order("created_at", { ascending: false })
    .limit(40);

  return (
    <>
      <AdPopup />

      {/* 히어로 */}
      <section className="bg-brand-light">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-20 md:flex-row md:py-28">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              믿을만한
              <br />
              이웃 간 중고거래
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-700">
              동네 주민들과 가깝고 따뜻한 거래를
              <br />
              지금 경험해보세요.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex h-12 items-center rounded-lg bg-brand px-6 font-bold text-white hover:bg-brand-dark"
            >
              지금 시작하기
            </Link>
          </div>
          <div className="flex flex-1 justify-center text-[160px] leading-none md:text-[220px]">
            🍠
          </div>
        </div>
      </section>

      {/* 판매글 목록 */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">중고거래 최신매물</h2>
          <Link
            href="/products/new"
            className="flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            + 판매하기
          </Link>
        </div>

        {!products?.length ? (
          <p className="py-20 text-center text-gray-500">
            아직 등록된 판매글이 없어요. 첫 판매글을 올려보세요!
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {products.map((item) => (
              <Link key={item.id} href={`/products/${item.id}`} className="group">
                {/* 대표 사진(첫 번째). 사진이 없으면 고구마 그림 */}
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gray-100 text-6xl transition group-hover:brightness-95">
                  {item.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl(item.images[0])} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    "🍠"
                  )}
                </div>
                <h3 className="mt-3 truncate text-[15px] group-hover:underline">{item.title}</h3>
                <p className="mt-1 font-bold">{formatPrice(item.price)}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {item.region} · {timeAgo(item.created_at)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
