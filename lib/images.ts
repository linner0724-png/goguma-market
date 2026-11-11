// 판매글 사진 관련 공용 코드 (서버/브라우저 모두에서 사용)

export const IMAGE_BUCKET = "product-images";
export const MAX_IMAGES = 5;

// Storage 경로 → 누구나 볼 수 있는 공개 URL
export function imageUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}

// 경로 형식 검사: "{userId}/{파일명}.jpg" 처럼 본인 폴더 안의 파일인지
export function isOwnImagePath(path: string, userId: string) {
  return new RegExp(`^${userId}/[a-zA-Z0-9-]+\\.(jpg|png|webp)$`).test(path);
}
