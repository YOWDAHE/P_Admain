import { redirect } from "next/navigation";

export default async function Home() {
  let token, user;

  const isBrowser = () => typeof window !== "undefined";
  if (isBrowser()) {
			user = localStorage.getItem("user");
			token = localStorage.getItem("tokens");
		}

  if (!user || !token) {
    redirect("/login")
  } else {
    redirect("/dashboard")
  }

  return null
}
