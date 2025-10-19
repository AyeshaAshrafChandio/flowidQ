import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { queues } from "@/lib/data";

export function ActiveQueues() {
  const activeQueue = queues[0];
  const progress = (activeQueue.currentToken / activeQueue.yourToken) * 100;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Active Queues</CardTitle>
          <CardDescription>
            You are currently in {queues.length} queues.
          </CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/queues">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {queues.slice(0, 2).map((queue) => {
          const progressValue = (queue.currentToken / queue.yourToken) * 100;
          return (
            <div key={queue.id} className="grid gap-2">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-md">
                    <queue.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{queue.organization}</p>
                  <p className="text-sm text-muted-foreground">
                    Your token: {queue.yourToken}
                  </p>
                </div>
                <p className="text-sm font-semibold">{queue.estimatedWaitTime} min wait</p>
              </div>
              <Progress value={progressValue} aria-label={`${progressValue}% progress`} />
              <p className="text-xs text-muted-foreground text-center">Current token: {queue.currentToken}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
