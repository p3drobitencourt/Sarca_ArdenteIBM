import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Tenta pegar o cookie da sessão
  const session = request.cookies.get('appid_session');

  // 1. Deixa passar arquivos do sistema e rotas de login
  if (
    pathname.startsWith('/_next') || 
    pathname === '/login' || 
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Se NÃO está logado, joga pro /login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};