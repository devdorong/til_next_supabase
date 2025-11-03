// 아래는 주의사항 : client 말고 server 에서 불러오기
// 왜냐하면 서버에서 클라이언트로 접근해야함.
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
// 사용자가 로그인을 하고 난 다음에 돌아오는 처리
// 전달받은 url 의 ? 즉 쿼리스트링 다음에 내용을 파악해서 처리

// /auth/callback
export async function GET(request: NextRequest) {
  // 사용자가 들어온 주소를 파악함.
  const url = new URL(request.url);
  // 주소에서 code 라는 값을 뜯어냄
  // code 에 값은 supabase 에서 만들어줌
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/';
  if (!code) {
    return NextResponse.redirect(
      new URL('/signin?error=missing_code', request.url)
    );
  }
  // code 가 존재하면 Supabase 서버 연결 라이브러리로 생성함.
  const supabase = await createClient();
  // 코드가 존재하면 진짜 로그인 세션으로 바꿔달라는 요청을 Supabase 에 전달함
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL('/signin?error=exchange_failed', request.url)
    );
  }
  // 성공했다면 사용자가 가고싶은곳으로 간다.
  // next=/reset-password
  return NextResponse.redirect(new URL(next, request.url));
}
