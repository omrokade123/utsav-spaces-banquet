import {
  createServerClient,
} from "@supabase/ssr";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

const DASHBOARD_PATH = "/dashboard";

export async function middleware(
  request: NextRequest
) {
  const { pathname } = request.nextUrl;

  const isDashboardRoute =
    pathname === DASHBOARD_PATH ||
    pathname.startsWith(`${DASHBOARD_PATH}/`);

  if (!isDashboardRoute) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const loginUrl = new URL(
      "/login",
      request.url
    );

    loginUrl.searchParams.set(
      "redirectedFrom",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

  if (
    profileError ||
    !profile ||
    !["owner", "admin"].includes(
      profile.role
    )
  ) {
    await supabase.auth.signOut();

    const loginUrl = new URL(
      "/login",
      request.url
    );

    loginUrl.searchParams.set(
      "error",
      "dashboard_access_denied"
    );

    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"],
};
