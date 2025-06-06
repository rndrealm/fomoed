import { createSupabaseReqResClient } from "@/lib/utils/supabase/server-client";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = await createSupabaseReqResClient(request, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Authenticate API routes
  if (
    !user &&
    request.nextUrl.pathname.startsWith("/api") &&
    !request.nextUrl.pathname.includes("/newslab")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!user && request.nextUrl.pathname.startsWith("/signals")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/api/:path*",
    "/signals/:path*",
    "/signals",
  ],
};
