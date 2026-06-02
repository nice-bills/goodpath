import { redirect } from "next/navigation";

/** Legacy route — tab shell lives on `/` with `?tab=celebrate`. */
export default function CelebratePage() {
  redirect("/?tab=celebrate");
}
