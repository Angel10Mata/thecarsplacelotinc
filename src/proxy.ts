import { type NextRequest, NextResponse } from "next/server";
import { APP_BASE_PATH } from "@/lib/app-config";
import { isAdminRole, resolveUserRole } from "@/lib/user-role";
import { createClient } from "@/utils/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { supabase, response } = createClient(request);
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error("Supabase auth error in proxy:", error);
  }
  const pathname = request.nextUrl.pathname;
  const adminPrefix = `${APP_BASE_PATH}/admin`;

  if (!user && pathname.startsWith(APP_BASE_PATH)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: settings } = await supabase
      .from("app_settings")
      .select("require_device_authorization")
      .limit(1)
      .maybeSingle();

    const requireAuth = settings?.require_device_authorization ?? false;
    let cachedRole: string | undefined;
    const getRealRole = async () => {
      if (cachedRole === undefined) {
        cachedRole = await resolveUserRole(supabase, user);
      }
      return cachedRole;
    };

    if (pathname === "/esperando-acceso") {
      if (!requireAuth) {
        const url = request.nextUrl.clone();
        url.pathname = APP_BASE_PATH;
        return NextResponse.redirect(url);
      }

      const realRole = await getRealRole();

      if (isAdminRole(realRole)) {
        const url = request.nextUrl.clone();
        url.pathname = APP_BASE_PATH;
        return NextResponse.redirect(url);
      }

      const userAgent = request.headers.get("user-agent") || "Desconocido";

      const { data: device } = await supabase
        .from("authorized_devices")
        .select("is_authorized")
        .eq("user_id", user.id)
        .eq("browser_fingerprint", userAgent)
        .single();

      if (device && device.is_authorized) {
        const url = request.nextUrl.clone();
        url.pathname = APP_BASE_PATH;
        return NextResponse.redirect(url);
      }
    }

    if (pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = APP_BASE_PATH;
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith(APP_BASE_PATH)) {
      const realRole = await getRealRole();

      if (pathname.startsWith(adminPrefix) && !isAdminRole(realRole)) {
        const url = request.nextUrl.clone();
        url.pathname = "/sin-acceso";
        return NextResponse.redirect(url);
      }

      if (requireAuth && !isAdminRole(realRole)) {
        const userAgent = request.headers.get("user-agent") || "Desconocido";

        const { data: device } = await supabase
          .from("authorized_devices")
          .select("is_authorized")
          .eq("user_id", user.id)
          .eq("browser_fingerprint", userAgent)
          .single();

        if (!device || !device.is_authorized) {
          const url = request.nextUrl.clone();
          url.pathname = "/esperando-acceso";
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logout|.*\\.(?:svg|png|jpg|jpeg|gif|webp|csv|xlsx|woff|woff2|tff|otf|js|css)$).*)",
  ],
};
