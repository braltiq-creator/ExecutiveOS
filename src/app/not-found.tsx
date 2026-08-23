import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-lg text-center">
        <EmptyState
          title="Page not found"
          description="The page you requested does not exist or has been moved."
          action={
            <Link href="/dashboard">
              <Button>Return to Intelligence Center</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
