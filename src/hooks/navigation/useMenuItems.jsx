import { useTranslation } from "@/hooks";
import Link from "next/link";
import { FileText } from "lucide-react";
import { TableOutlined } from "@ant-design/icons";

export const useMenuItems = () => {
  const t = useTranslation();
  const subMenuTheme = "light";
  return [
    {
      label: t("sidebar.menuGroup.klaim"),
      key: "klaim",
      theme: subMenuTheme,
      children: [
        {
          label: <Link href="/klaim">Klaim Support</Link>,
          key: "list-klaim",
          icon: <FileText className="w-5 h-5" />,
        },
      ],
    },
    {
      label: t("sidebar.menuGroup.fkr") || "FKR Support",
      key: "fkr",
      theme: subMenuTheme,
      children: [
        {
          label: <Link href="/fkr">FKR Support</Link>,
          key: "list-fkr",
          icon: <FileText className="w-5 h-5 text-emerald-600" />,
        },
      ],
    },
    {
      label: "Proposal Support",
      key: "proposal",
      theme: subMenuTheme,
      children: [
        {
          label: <Link href="/proposal">Proposal Support</Link>,
          key: "list-proposal",
          icon: <FileText className="w-5 h-5 text-blue-600" />,
        },
      ],
    },
    {
      label: "CMO Support",
      key: "cmo",
      theme: subMenuTheme,
      children: [
        {
          label: <Link href="/cmo">CMO Support</Link>,
          key: "list-cmo",
          icon: <FileText className="w-5 h-5 text-amber-600" />,
        },
      ],
    },
    {
      label: "Budget Support",
      key: "budget",
      theme: subMenuTheme,
      children: [
        {
          label: <Link href="/budget/reversal">Reversal Budget</Link>,
          key: "reversal-budget",
          icon: <FileText className="w-5 h-5 text-indigo-600" />,
        },
        {
          label: <Link href="/budget/add-move">Add & Move Budget</Link>,
          key: "add-move-budget",
          icon: <FileText className="w-5 h-5 text-teal-600" />,
        },
      ],
    },
    {
      label: "Referensi",
      key: "referensi",
      theme: subMenuTheme,
      children: [
        {
          label: <Link href="/template-guide">Panduan Template Excel</Link>,
          key: "template-guide",
          icon: <TableOutlined className="text-slate-600" />,
        },
      ],
    },
  ];
};
