import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ["/", "/login", "/auth/callback", "/auth/confirm", "/pricing"];

// Rutas por rol
const ROLE_ROUTES: Record<string, string[]> = {
  paciente: ["/dashboard/paciente", "/pedir-turno", "/consulta"],
  medico:   ["/dashboard/medico"],
  admin:    ["/dashboard/admin"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabase, supabaseResponse } = createClient(request);

  // Refrescar sesión
  const { data: { user } } = await supabase.auth.getUser();

  // Rutas públicas — dejar pasar siempre
  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r));
  if (isPublic) return supabaseResponse;

  // Sin sesión → redirigir a login
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Obtener rol del usuario
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = userData?.role as keyof typeof ROLE_ROUTES | undefined;

  // Protección por rol
  if (role) {
    const otherRoles = Object.keys(ROLE_ROUTES).filter((r) => r !== role) as Array<keyof typeof ROLE_ROUTES>;
    const isTryingForeignRoute = otherRoles.some((r) =>
      ROLE_ROUTES[r].some((route) => pathname.startsWith(route))
    );
    if (isTryingForeignRoute) {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
