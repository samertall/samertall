import { NextResponse, type NextRequest } from "next/server";

function hasSession(request: NextRequest) {
  return request.cookies.getAll().some((cookie) => cookie.name.endsWith("session_token") && cookie.value);
}

export function proxy(request: NextRequest) {
  if (hasSession(request)) return NextResponse.next();
  const url = request.nextUrl.clone();
  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.pathname = "/sign-in";
  url.search = "";
  url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/drop", "/me"],
};
