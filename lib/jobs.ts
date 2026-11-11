// 알바 급여 종류
// ⚠️ 값을 바꾸면 DB의 job_posts.wage_type check 제약도 함께 바꿔야 함

export const WAGE_TYPES = [
  { value: "hourly", label: "시급" },
  { value: "daily", label: "일급" },
  { value: "monthly", label: "월급" },
  { value: "case", label: "건당" },
] as const;

export type WageType = (typeof WAGE_TYPES)[number]["value"];

export function isWageType(value: unknown): value is WageType {
  return WAGE_TYPES.some((w) => w.value === value);
}

// "시급 12,000원"
export function formatWage(wageType: string, wage: number) {
  const label = WAGE_TYPES.find((w) => w.value === wageType)?.label ?? "";
  return `${label} ${wage.toLocaleString("ko-KR")}원`;
}
