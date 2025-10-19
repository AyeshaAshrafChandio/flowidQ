import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { queues } from "@/lib/data";

export default function QueuesPage() {
  return (
    <>
      <PageHeader
        title="Queue Tracker"
        subtitle="Monitor your status in all active queues."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {queues.map((queue) => {
          const progressValue = (queue.currentToken / queue.yourToken) * 100;
          return (
            <Card key={queue.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-muted rounded-full">
                        <queue.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>{queue.organization}</CardTitle>
                        <CardDescription>Est. Wait: {queue.estimatedWaitTime} mins</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex justify-between font-mono text-lg font-semibold">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Current</p>
                    <p>{queue.currentToken}</p>
                  </div>
                  <div className="text-center text-primary">
                    <p className="text-sm font-medium">Your Token</p>
                    <p>{queue.yourToken}</p>
                  </div>
                </div>
                <div>
                  <Progress value={progressValue} className="w-full" />
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    {queue.yourToken - queue.currentToken} people ahead of you
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
