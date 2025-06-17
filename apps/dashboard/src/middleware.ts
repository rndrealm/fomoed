import { createSupabaseReqResClient } from "@/lib/utils/supabase/server-client";
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/utils/supabase/middleware";

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
  //TODO:  move this to indifidual API routes
  if (
    !user &&
    request.nextUrl.pathname.startsWith("/api") &&
    !request.nextUrl.pathname.includes("/news") &&
    !request.nextUrl.pathname.includes("/scrape-cfgi") &&
    !request.nextUrl.pathname.includes("/newslab")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return await updateSession(request);
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
