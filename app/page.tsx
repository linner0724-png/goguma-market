import Link from "next/link";

const sampleItems = [
  { emoji: "🚲", title: "접이식 자전거 팝니다", region: "역삼동", price: "80,000원" },
  { emoji: "🪑", title: "원목 의자 2개 일괄", region: "서초동", price: "30,000원" },
  { emoji: "🎧", title: "무선 헤드폰 거의 새것", region: "논현동", price: "120,000원" },
  { emoji: "📚", title: "개발 서적 묶음 나눔", region: "삼성동", price: "나눔🧡" },
  { emoji: "🪴", title: "몬스테라 화분", region: "대치동", price: "15,000원" },
  { emoji: "🧸", title: "아기 장난감 세트", region: "도곡동", price: "10,000원" },
  { emoji: "💻", title: "노트북 거치대", region: "개포동", price: "12,000원" },
  { emoji: "🍳", title: "프라이팬 3종", region: "청담동", price: "20,000원" },
];

export default function Home() {
  return (
    <>
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

      {/* 인기 매물 (샘플 - 다음 단계에서 DB 연결 예정) */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">중고거래 인기매물</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {sampleItems.map((item) => (
            <article key={item.title}>
              <div className="flex aspect-square items-center justify-center rounded-xl bg-gray-100 text-6xl">
                {item.emoji}
              </div>
              <h3 className="mt-3 truncate text-[15px]">{item.title}</h3>
              <p className="mt-1 font-bold">{item.price}</p>
              <p className="mt-1 text-sm text-gray-500">{item.region}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
