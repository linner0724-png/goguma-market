// 브라우저에서 사진을 줄여서(긴 변 1280px, JPEG) 용량을 줄이는 함수
// 휴대폰 사진은 5~10MB가 흔해서, 그대로 올리면 느리고 저장 공간도 많이 차지함

const MAX_SIDE = 1280;

export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; // 투명 PNG는 흰 배경으로
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("변환 실패"))), "image/jpeg", 0.85)
  );
}
