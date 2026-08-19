import { redirect } from "next/navigation";

export default function Home() {
  redirect("/klaim");
  return <div>Loading...</div>;
}
