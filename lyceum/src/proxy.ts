import { NextResponse, type NextRequest } from "next/server";

const GUEST = /^guest:[a-f0-9]{32}$/;

function guestId() {
  return `guest:${crypto.randomUUID().replaceAll("-", "")}`;
}

export function proxy(request: NextRequest) {
  const existing = request.cookies.get("lyceum_learner")?.value ?? "";
  if (GUEST.test(existing)) return NextResponse.next();

  const id = guestId();
  const headers = new Headers(request.headers);
  const current = request.headers.get("cookie");
  headers.set("cookie", current ? `${current}; lyceum_learner=${id}` : `lyceum_learner=${id}`);
  const response = NextResponse.next({ request: { headers } });
  response.cookies.set("lyceum_learner", id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon).*)"],
};
