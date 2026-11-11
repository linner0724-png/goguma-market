// 동네생활 주제 목록
// ⚠️ 값을 바꾸면 DB의 community_posts.topic check 제약도 함께 바꿔야 함

export const TOPICS = [
  { value: "question", label: "동네질문", emoji: "🙋" },
  { value: "food", label: "동네맛집", emoji: "🍜" },
  { value: "news", label: "동네소식", emoji: "📢" },
  { value: "lost", label: "분실/실종", emoji: "🔍" },
  { value: "daily", label: "일상", emoji: "☕" },
] as const;

export type Topic = (typeof TOPICS)[number]["value"];

export function isTopic(value: unknown): value is Topic {
  return TOPICS.some((t) => t.value === value);
}

export function topicOf(value: string) {
  return TOPICS.find((t) => t.value === value) ?? TOPICS[4];
}
