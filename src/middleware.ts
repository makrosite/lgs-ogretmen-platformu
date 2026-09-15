import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/denemeler/:path*",
    "/yanlis-sorular/:path*",
    "/mufredat/:path*",
    "/tercih/:path*",
    "/ogrenciler/:path*",
    "/kaynak-takip/:path*",
    "/ayarlar/:path*",
  ],
};
