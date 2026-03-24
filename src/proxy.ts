import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// No Next 16, a função DEVE se chamar proxy ou ser o default export
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Tenta pegar o cookie da sessão
  const session = request.cookies.get('appid_session');

  // 2. Rotas públicas que não precisam de login (ignora arquivos do sistema)
  if (
    pathname.startsWith('/_next') || 
    pathname === '/login' || 
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 3. Se NÃO estiver logado (sem o crachá da Pimba Corp), redireciona
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Se estiver logado, segue o jogo
  return NextResponse.next();
}

// O Matcher continua igual, dizendo onde o proxy deve atuar
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};