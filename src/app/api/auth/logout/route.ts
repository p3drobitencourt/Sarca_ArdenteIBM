import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 1. Prepara o redirecionamento para o login
  const response = NextResponse.redirect(new URL('/login', request.url));

  // 2. Remove o cookie de sessão da Pimba Corp
  response.cookies.set('appid_session', '', { 
    maxAge: 0,
    path: '/' 
  });

  return response;
}