import { redirect } from "next/navigation";

/** Legacy route — tab shell lives on `/` with `?tab=quests`. */
export default function QuestsPage() {
  redirect("/?tab=quests");
}
