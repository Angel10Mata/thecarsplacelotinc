import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PUBLIC_CATALOG_PATH } from "@/lib/app-config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const destination = request.nextUrl.clone();
  destination.pathname = PUBLIC_CATALOG_PATH;
  destination.search = "";
  destination.hash = "";

  const redirectResponse = NextResponse.redirect(destination, { status: 303 });
  redirectResponse.headers.set("Cache-Control", "no-store");

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.signOut();
  return redirectResponse;
}
