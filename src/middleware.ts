import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/produits/:path*",
    "/stock/:path*",
    "/ventes/:path*",
    "/fournisseurs/:path*",
    "/clients/:path*",
    "/rapports/:path*",
    "/utilisateurs/:path*",
    "/parametres/:path*",
  ],
};