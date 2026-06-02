import { Suspense } from "react";
import { AppTabShell } from "@/components/app-tab-shell";
import { HomeSkeleton } from "@/components/ui/skeleton";

function TabShellFallback() {
  return (
    <div className="flex flex-1 flex-col">
      <HomeSkeleton />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<TabShellFallback />}>
      <AppTabShell />
    </Suspense>
  );
}
