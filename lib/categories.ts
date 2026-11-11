// 판매글 카테고리 목록
// DB에는 영어 코드값(value)을 저장하고, 화면에는 한국어 이름(label)을 보여줌
// ⚠️ 여기 값을 추가/변경하면 DB의 products.category check 제약도 함께 바꿔야 함

export const CATEGORIES = [
  { value: "digital", label: "디지털기기", emoji: "💻" },
  { value: "appliance", label: "생활가전", emoji: "🔌" },
  { value: "furniture", label: "가구/인테리어", emoji: "🪑" },
  { value: "kitchen", label: "생활/주방", emoji: "🍳" },
  { value: "kids", label: "유아동", emoji: "🧸" },
  { value: "fashion", label: "의류/잡화", emoji: "👕" },
  { value: "sports", label: "스포츠/레저", emoji: "🚲" },
  { value: "hobby", label: "취미/게임", emoji: "🎮" },
  { value: "books", label: "도서", emoji: "📚" },
  { value: "etc", label: "기타", emoji: "📦" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export function isCategory(value: unknown): value is Category {
  return CATEGORIES.some((c) => c.value === value);
}

export function categoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? "기타";
}
