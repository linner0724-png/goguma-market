// 화면 표시용 포맷 함수

export function formatPrice(price: number) {
  return price === 0 ? "나눔🧡" : `${price.toLocaleString("ko-KR")}원`;
}

// "3분 전", "2일 전" 같은 상대 시간
export function timeAgo(iso: string) {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return "방금 전";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day < 30) return `${day}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR");
}
