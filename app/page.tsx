import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, timeAgo } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import AdPopup from "@/components/AdPopup";
import SideBanners from "@/components/SideBanners";
import { CATEGORIES, categoryLabel, isCategory } from "@/lib/categories";

function CategoryChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition ${
        active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </Link>
  );
}

// 목록 카드 아래 좋아요/댓글 수 (0이면 숨김, 당근마켓처럼)
function SocialCounts({ likes, comments }: { likes: number; comments: number }) {
  if (!likes && !comments) return null;
  return (
    <p className="mt-1 flex gap-2 text-xs text-gray-500">
      {likes > 0 && <span>♡ {likes}</span>}
      {comments > 0 && <span>💬 {comments}</span>}
    </p>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  // 주소의 ?category=digital 값으로 필터 (없거나 이상한 값이면 전체)
  const { category: rawCategory } = await searchParams;
  const category = isCategory(rawCategory) ? rawCategory : null;

  // 최신 판매글 목록
  const supabase = await createClient();
  let query = supabase
    .from("products")
    // product_likes(count): 연결된 좋아요 행 개수를 함께 가져옴
    .select("id, title, price, region, images, created_at, product_likes(count), product_comments(count)")
    .order("created_at", { ascending: false })
    .limit(40);
  if (category) query = query.eq("category", category);
  const { data: products } = await query;

  return (
    <>
      <AdPopup />
      <SideBanners />

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
      <section id="list" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {category ? `${categoryLabel(category)} 매물` : "중고거래 최신매물"}
          </h2>
          <Link
            href="/products/new"
            className="flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            + 판매하기
          </Link>
        </div>

        {/* 카테고리 칩. 링크라서 새로고침/공유해도 같은 필터가 유지됨 (#list: 목록 위치로 스크롤) */}
        <nav className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1">
          <CategoryChip href="/#list" active={!category}>
            전체
          </CategoryChip>
          {CATEGORIES.map((c) => (
            <CategoryChip key={c.value} href={`/?category=${c.value}#list`} active={category === c.value}>
              {c.emoji} {c.label}
            </CategoryChip>
          ))}
        </nav>

        {!products?.length ? (
          <p className="py-20 text-center text-gray-500">
            {category
              ? "이 카테고리에는 아직 판매글이 없어요."
              : "아직 등록된 판매글이 없어요. 첫 판매글을 올려보세요!"}
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
                <SocialCounts
                  likes={item.product_likes?.[0]?.count ?? 0}
                  comments={item.product_comments?.[0]?.count ?? 0}
                />
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
