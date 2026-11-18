import { hasLocale } from "next-intl";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { localizedPath, routes } from "@/lib/routes";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return new Response(null, { status: 404 });

  redirect(`${localizedPath(routes.home, locale)}?openReview=1`);
}
