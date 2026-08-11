import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { LocaleDocumentSync } from "@/components/locale-document-sync";
import { type Locale, routing } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  // Ne pas envoyer le catalogue admin (~50 % du JSON) au site public.
  const { admin: _admin, ...publicMessages } = messages as Record<
    string,
    unknown
  > & { admin?: unknown };

  return (
    <NextIntlClientProvider
      key={locale}
      locale={locale}
      messages={publicMessages}
    >
      <LocaleDocumentSync locale={locale as Locale} />
      {children}
    </NextIntlClientProvider>
  );
}
