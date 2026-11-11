"use server";
// 판매글 등록/수정/삭제 서버 액션
// 권한 체크는 DB의 RLS 정책이 최종적으로 막아줍니다(본인 글만 수정/삭제).
// 여기서는 로그인 여부와 입력값만 먼저 확인합니다.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProductFormState = { error?: string };

function readForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isFree = formData.get("isFree") === "on";
  const priceText = String(formData.get("price") ?? "").replace(/[^0-9]/g, "");
  const price = isFree ? 0 : Number(priceText);

  if (title.length < 2 || title.length > 40) return { error: "제목은 2~40자로 입력해주세요." };
  if (!region || region.length > 20) return { error: "거래 동네를 입력해주세요. (20자 이내)" };
  if (!isFree && (!priceText || price <= 0)) return { error: "가격을 입력하거나 '나눔'을 선택해주세요." };
  if (price > 100_000_000) return { error: "가격은 1억 원 이하로 입력해주세요." };
  if (description.length > 2000) return { error: "설명은 2000자 이내로 입력해주세요." };

  return { data: { title, region, description, price } };
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = readForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  // seller_id는 DB 기본값(auth.uid())으로 자동 입력
  const { data, error } = await supabase
    .from("products")
    .insert(parsed.data)
    .select("id")
    .single();
  if (error) return { error: "등록에 실패했어요. 잠시 후 다시 시도해주세요." };

  revalidatePath("/");
  redirect(`/products/${data.id}`);
}

export async function updateProduct(
  id: number,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = readForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  // RLS 때문에 남의 글이면 0건이 수정됨 → select로 결과 확인
  const { data, error } = await supabase
    .from("products")
    .update(parsed.data)
    .eq("id", id)
    .select("id");
  if (error) return { error: "수정에 실패했어요. 잠시 후 다시 시도해주세요." };
  if (!data?.length) return { error: "본인 글만 수정할 수 있어요." };

  revalidatePath("/");
  revalidatePath(`/products/${id}`);
  redirect(`/products/${id}`);
}

export async function deleteProduct(id: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("products").delete().eq("id", id);

  revalidatePath("/");
  redirect("/");
}
