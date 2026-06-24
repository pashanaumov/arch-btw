import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold">arch-btw</h1>
      <p className="text-muted-foreground">System design interview practice</p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/canvas">Start Designing</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/progress">View Progress</Link>
        </Button>
      </div>
    </main>
  );
}
