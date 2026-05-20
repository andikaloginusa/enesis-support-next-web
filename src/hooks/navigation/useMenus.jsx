import { useTranslation } from "@/hooks";
import Link from "next/link";
import { BiBitcoin } from "react-icons/bi";
import { RiDashboard2Fill } from "react-icons/ri";

export function useMenus() {
  const t = useTranslation();
  return [
    {
      label: t("sidebar.menuGroup.main"),
      key: "main",
      type: "group",
      children: [
        {
          label: t("sidebar.menu.dashboards"),
          key: "dashboards",
          icon: <RiDashboard2Fill />,
          children: [
            {
              label: (
                <Link href="/dashboards/crypto">
                  {t("sidebar.menuItem.crypto")}
                </Link>
              ),
              key: "crypto",
              icon: <BiBitcoin />,
            },
          ],
        },
      ],
    },
  ];
}
