import { redirect } from "next/navigation";

export default async function Home() {

  if (false) {
    redirect("/login")
  } else {
    redirect("/dashboard")
  }

  return null
}
