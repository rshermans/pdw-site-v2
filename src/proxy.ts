import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin auth gate ───────────────────────────────────────────────────────
  if (/^\/(pt|en)\/admin(\/|$)/.test(pathname)) {
    // Login page is always accessible
    if (/^\/(pt|en)\/admin\/login/.test(pathname)) {
      return NextResponse.next();
    }

    // Dev: bypass auth entirely (no ?admin_dev=1 needed)
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.next();
    }

    const cookie = request.cookies.get('pdw_admin')?.value;
    const expected = process.env.PDW_ADMIN_TOKEN;

    if (expected && cookie === expected) {
      return NextResponse.next();
    }

    const lang = pathname.split('/')[1] || 'pt';
    const url = request.nextUrl.clone();
    url.pathname = `/${lang}/admin/login`;
    url.search = '';
    return NextResponse.redirect(url);
  }

  // ── i18n locale redirect ──────────────────────────────────────────────────
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
