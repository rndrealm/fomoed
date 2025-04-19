import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseReqResClient } from "@/lib/utils/supabase/server-client";

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

  // protects the "/account" route and its sub-routes
  // if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
