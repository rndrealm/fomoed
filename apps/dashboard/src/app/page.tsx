import { AppRoutes } from "@/lib/routes";
import { redirect } from "next/navigation";

export default function Home() {
  return redirect(AppRoutes.dashboard.path);
}
