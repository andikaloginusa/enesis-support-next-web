import { redirect } from "next/navigation";

export default function DashboardsHome() {
  redirect("/dashboards/crypto");
  return <>Loading...</>;
}
