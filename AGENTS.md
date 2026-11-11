# AGENTS.md — 고구마마켓 작업 가이드

AI 에이전트(Claude Code 등)가 이 프로젝트에서 작업할 때 꼭 지켜야 할 내용입니다.

## 프로젝트 성격

- **개발 공부용** 프로젝트입니다. 당근마켓 스타일 중고거래 사이트를 Next.js + Supabase로 만듭니다.
- 디자인은 당근마켓과 최대한 비슷하게 합니다. 메인 색은 `#ff6f0f`(`brand`)입니다.
- 사용자는 한국어로 소통합니다. 설명과 코드 주석은 한국어로 작성하세요.

## 진행 방식: 한 단계씩

- **요청받은 단계만 구현하세요.** 다음 단계 기능을 미리 만들지 마세요.
- 한 번에 너무 많은 파일을 바꾸지 말고, 무엇을 왜 바꿨는지 짧게 설명하세요.
- 새 개념(서버 액션, RLS, 미들웨어 등)이 처음 나오면 코드 주석이나 답변에서 간단히 설명하세요.
- 단계가 끝나면 README.md의 "개발 단계" 체크리스트를 업데이트하세요.

| 단계 | 내용 | 상태 |
|---|---|---|
| 1 | 회원가입 / 로그인 / 로그아웃 | 완료 |
| 2 | 판매글 CRUD (사진 제외) | 완료 |
| 3 | 판매글 사진 업로드 (최대 5장) | 완료 |
| 4 | 좋아요 / 댓글 | 완료 |
| 5 | 카테고리 (10종) + 목록 필터 | 완료 |

## ⚠️ Supabase는 가계부와 같은 DB를 함께 씁니다

- Supabase 프로젝트(`nyfubvtgczfuovemtfhe`)는 **기존 가계부 프로젝트(`가계부_SHH`)와 공유**하는 DB입니다.
- 가계부 테이블 **`public.transactions`는 절대 수정, 삭제하거나 구조를 바꾸지 마세요.**
- 고구마마켓 테이블:
  - `public.profiles`: 회원 닉네임. `auth.users`와 1:1 관계이고, 가입 시 `handle_new_user` 트리거가 자동으로 만듭니다.
  - `public.products`: 판매글. `seller_id` → `profiles.id`. 조회는 누구나, 등록/수정/삭제는 본인만(RLS). 가격 0 = 나눔.
    - `images text[]`: Storage 경로 배열(최대 5장, 첫 번째가 대표 사진).
    - `category text`: 카테고리 코드(10종, check 제약). 목록과 이름은 `lib/categories.ts`. 값을 바꾸면 DB 제약도 같이 바꾸세요.
  - `public.product_likes`: 좋아요. 기본키 `(product_id, user_id)`라 한 사람당 1번만. 본인 것만 추가/취소.
  - `public.product_comments`: 댓글(1~500자). 본인 댓글만 작성/삭제.
  - ⚠️ 위 두 테이블 때문에 `products`→`profiles` 경로가 여러 개라, 임베드할 때 `profiles!products_seller_id_fkey(nickname)`처럼 외래키를 꼭 명시하세요.
  - Storage 버킷 `product-images`(공개): 경로는 `{user id}/{uuid}.jpg`, 본인 폴더에만 업로드/삭제 가능(RLS). 브라우저에서 줄여서 직접 업로드하고, 서버 액션에는 경로만 보냅니다.
- 새 테이블을 만들 때:
  - 가계부 테이블과 이름이 겹치지 않게 하세요.
  - 만들기 전에 `list_tables`로 기존 테이블을 먼저 확인하세요.
  - **RLS를 반드시 켜고** 정책을 만드세요.
  - 테이블 삭제(`DROP`), `TRUNCATE`, 대량 `DELETE`, `auth` 스키마 변경은 실행 전에 사용자에게 확인받으세요.
- `auth.users`도 두 앱이 함께 씁니다. 회원 관련 트리거나 정책을 바꾸면 가계부에 영향이 없는지 확인하세요.
- Supabase Auth 설정: **이메일 인증(Confirm email)은 꺼져 있습니다.** 가입하면 바로 로그인됩니다.

## 환경변수와 비밀 정보

- `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`가 있습니다. 이 파일은 git에 올리지 않습니다.
- 브라우저에 노출해도 되는 키는 **publishable key뿐**입니다. `service_role`/secret 키는 절대 코드나 `NEXT_PUBLIC_` 변수에 넣지 마세요.
- `TEST_ACCOUNTS.md`(테스트 계정 비밀번호)는 `.gitignore`에 들어 있습니다. 저장소가 Public이므로 올리면 안 됩니다.

## 배포 (Vercel)

- 주소: https://goguma-market-amber-nine.vercel.app (Vercel 프로젝트 `linner1/goguma-market`)
- 가계부와 **별도의 링크**로 배포합니다.
- GitHub `linner0724-png/goguma-market`(Public)의 `main`에 push하면 자동으로 배포됩니다.
- 환경변수를 추가하거나 바꾸면 **반드시 다시 배포**해야 합니다. `NEXT_PUBLIC_*` 변수는 빌드할 때 코드에 들어가기 때문입니다.
  - 환경변수가 없으면 미들웨어가 `500 MIDDLEWARE_INVOCATION_FAILED`로 실패합니다.
- 새 환경변수가 생기면 `.env.local`, `.env.example`, Vercel(`vercel env add`)에 모두 추가하세요.

## 개발 환경 (Windows)

- Node.js는 `C:\Program Files\nodejs`에 설치되어 있습니다. 셸에서 `node`를 못 찾으면 PATH에 이 경로를 추가하세요.
- 개발 서버: `npm run dev` → http://localhost:3000
- 기술 스택:
  - Next.js 15 (App Router)
  - React 19
  - Tailwind CSS v4
  - `@supabase/ssr`
- 코드 구조:
  - `lib/supabase/`: 클라이언트 생성 코드
  - `app/auth/actions.ts`: 인증 서버 액션
  - `middleware.ts`: 요청마다 세션 갱신
- 큰 변경 후에는 `npx next build`로 타입과 빌드를 확인하세요.

## Git

- 커밋과 push는 사용자가 요청할 때만 하세요.
- 커밋 메시지는 한국어로 짧게 씁니다. 예: `고구마마켓 2단계: 상품 등록`
