import { type NextRequest, NextResponse } from "next/server";
import {
  APP_AJUSTES_PATH,
  APP_BASE_PATH,
  LOGOUT_PATH,
  PUBLIC_CATALOG_PATH,
} from "@/lib/app-config";
import { isAdminRole, resolveUserRole } from "@/lib/user-role";
import { clearSupabaseAuthCookies, createClient } from "@/utils/supabase/proxy";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  ) {
    console.error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno.",
    );
    return NextResponse.json(
      { error: "Configuración del servidor incompleta." },
      { status: 500 },
    );
  }

  let supabase: ReturnType<typeof createClient>["supabase"];
  let getResponse: ReturnType<typeof createClient>["getResponse"];
  try {
    const client = createClient(request);
    supabase = client.supabase;
    getResponse = client.getResponse;
  } catch (error) {
    console.error("Error creando cliente Supabase en proxy:", error);
    return NextResponse.json({ error: "Error de autenticación." }, { status: 500 });
  }

  if (pathname === LOGOUT_PATH) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = PUBLIC_CATALOG_PATH;
    url.search = "";
    url.hash = "";
    const redirectResponse = NextResponse.redirect(url, { status: 303 });
    redirectResponse.headers.set("Cache-Control", "no-store");
    getResponse()
      .cookies.getAll()
      .forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });
    clearSupabaseAuthCookies(request, redirectResponse);
    return redirectResponse;
  }

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error("Supabase auth error in proxy:", error);
  }
  const adminPrefix = APP_AJUSTES_PATH;

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

  return getResponse();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|csv|xlsx|woff|woff2|tff|otf|js|css)$).*)",
  ],
};
