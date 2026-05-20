import { AppProvider } from "@/components/layout/AppProvider";
import { ASSET_IMAGES } from "@/utils/paths";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App } from "antd";
import "antd/dist/reset.css";
import { getDictionary } from "./dictionaries";
import "./globals.css";
import { QueryProvider } from "@providers";
import { cookies, headers } from "next/headers";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

const locales = ["en-US", "ar-SA", "es-ES", "fr-FR", "it-IT", "zh-CN"];

async function getActiveLocale() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Fallback to Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  if (acceptLanguage) {
    try {
      const languages = new Negotiator({
        headers: { "accept-language": acceptLanguage },
      }).languages();
      return match(languages, locales, "en-US");
    } catch (e) {
      // Ignore negotiator parsing error
    }
  }

  return "en-US";
}

export const metadata = {
  title: "Wieldy - Admin Dashboard",
  icons: `${ASSET_IMAGES}/favicon.ico`,
};

export default async function RootLayout(props) {
  const {
    children
  } = props;

  const locale = await getActiveLocale();
  const translation = await getDictionary(locale);

  return (
    <html lang={locale}>
      <body>
        <AntdRegistry>
          <AppProvider translation={translation} locale={locale}>
            <QueryProvider>
              <App>{children}</App>
            </QueryProvider>
          </AppProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
