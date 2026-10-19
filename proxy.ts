
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

const SESSION_COOKIE = "afriwave_session";

const protectedRoutes = [
  "/dashboard",
  "/admin",
  "/settings",
  "/radio-request",
];

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`),
  );
}

export default function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);

  // Conserver les redirections de locale de next-intl.
  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  const pathname = request.nextUrl.pathname;

  const locale = routing.locales.find(
    (item) =>
      pathname === `/${item}` ||
      pathname.startsWith(`/${item}/`),
  );

  if (!locale) {
    return response;
  }

  const pathnameWithoutLocale =
    pathname.slice(locale.length + 1) || "/";

  const hasSessionCookie = request.cookies.has(SESSION_COOKIE);

  if (
    matchesRoute(pathnameWithoutLocale, protectedRoutes) &&
    !hasSessionCookie
  ) {
    const loginUrl = new URL(`/${locale}/login`, request.url);

    loginUrl.searchParams.set(
      "callbackUrl",
      pathname + request.nextUrl.search,
    );

    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
