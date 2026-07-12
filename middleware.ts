/**
 * Middleware raiz: roda antes de toda requisição.
 * 1) Atualiza a sessão do Supabase (refresh token).
 * 2) Bloqueia acesso a rotas do dashboard sem login.
 * 3) Restringe rotas administrativas (/usuarios) ao perfil "administrador".
 *
 * Isso é a PRIMEIRA camada de proteção. A segunda camada (definitiva) é o RLS
 * no PostgreSQL — mesmo que este middleware seja contornado, o banco recusa
 * operações não autorizadas.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

const ROTAS_PUBLICAS = ['/login', '/recuperar-senha'];
const PREFIXO_ROTA_ADMIN = '/usuarios';

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Página pública de produto via QR Code sempre acessível
  if (pathname.startsWith('/produto/')) {
    return response;
  }

  const ehRotaPublica = ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota));

  if (!user && !ehRotaPublica) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && ehRotaPublica) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Restrição adicional: apenas administradores acessam /usuarios
  if (user && pathname.startsWith(PREFIXO_ROTA_ADMIN)) {
    const perfil = user.user_metadata?.perfil ?? user.app_metadata?.perfil;
    if (perfil !== 'administrador') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
