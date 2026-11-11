"use client";
// 헤더 메뉴 (중고거래 / 동네생활 / 알바)
// usePathname: 지금 주소를 읽어서 현재 탭을 진하게 표시 (브라우저에서만 쓸 수 있어 클라이언트 컴포넌트)

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "중고거래", match: (p: string) => p === "/" || p.startsWith("/products") },
  { href: "/community", label: "동네생활", match: (p: string) => p.startsWith("/community") },
  { href: "/jobs", label: "알바", match: (p: string) => p.startsWith("/jobs") },
];

export default function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav className={className}>
      {TABS.map((t) => {
        const active = t.match(pathname);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={active ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
