// 홈 화면 양쪽 사이드 광고 배너 (160×600 세로형)
// - 본문(max-w-6xl = 1152px) 바깥 여백에 고정(fixed)으로 띄움 → 스크롤해도 따라옴
// - 여백이 충분한 넓은 화면(2xl, 1536px 이상)에서만 보이고, 좁은 화면에서는 숨김
//   (좁은 화면에서 띄우면 본문을 가리기 때문)

import Link from "next/link";

// 본문 가운데 기준으로 576px(본문 절반) + 24px(간격) + 160px(배너 폭) 만큼 바깥에 배치
const sideCls = "fixed top-28 z-0 hidden w-[160px] 2xl:block";

export default function SideBanners() {
  return (
    <>
      {/* 왼쪽 배너 */}
      <aside aria-label="광고" className={sideCls} style={{ left: "calc(50% - 576px - 24px - 160px)" }}>
        <Link
          href="/products/new"
          className="flex h-[600px] flex-col items-center justify-between overflow-hidden rounded-2xl bg-brand px-4 py-8 text-center text-white shadow-sm transition hover:brightness-105"
        >
          <span className="text-xs font-semibold opacity-90">AD · 고구마마켓</span>
          <div>
            <p className="text-6xl">📦</p>
            <p className="mt-5 text-xl font-extrabold leading-snug">
              안 쓰는 물건,
              <br />
              이웃에게
              <br />
              팔아보세요
            </p>
            <p className="mt-3 text-sm opacity-90">사진 5장까지 무료 등록</p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-brand">판매하기 →</span>
        </Link>
      </aside>

      {/* 오른쪽 배너 */}
      <aside aria-label="광고" className={sideCls} style={{ right: "calc(50% - 576px - 24px - 160px)" }}>
        <Link
          href="/?category=digital#list"
          className="flex h-[600px] flex-col items-center justify-between overflow-hidden rounded-2xl bg-gray-900 px-4 py-8 text-center text-white shadow-sm transition hover:bg-gray-800"
        >
          <span className="text-xs font-semibold text-gray-400">AD · 이번 주 특가</span>
          <div>
            <p className="text-6xl">💻</p>
            <p className="mt-5 text-xl font-extrabold leading-snug">
              중고 디지털기기
              <br />
              <span className="text-brand">동네 최저가</span>
              <br />
              모아보기
            </p>
            <p className="mt-3 text-sm text-gray-400">노트북 · 헤드폰 · 태블릿</p>
          </div>
          <span className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-white">보러가기 →</span>
        </Link>
      </aside>
    </>
  );
}
