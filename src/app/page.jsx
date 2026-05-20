import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboards/crypto");
  return <div>Loading...</div>;
}
