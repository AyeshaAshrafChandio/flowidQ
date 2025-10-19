
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bell, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { initialQueueData } from "@/lib/data";

export default function OrganizationQueuePage() {
  const [queueData, setQueueData] = useState(initialQueueData);
  const { toast } = useToast();

  const handleNextCustomer = () => {
    setQueueData((prevData) => {
      if (prevData.upNext.length === 0) {
        toast({
            variant: "destructive",
            title: "Queue is empty!",
            description: "There are no more customers to call.",
        });
        return prevData;
      }

      const newNowServing = prevData.upNext[0];
      let newUpNext = prevData.upNext.slice(1);
      let newWaiting = [...prevData.waiting];

      if (newWaiting.length > 0) {
        newUpNext.push(newWaiting[0]);
        newWaiting = newWaiting.slice(1);
      }
      
      toast({
        title: `Now Serving: ${newNowServing.userName} (${newNowServing.token})`,
        description: "The queue has been updated.",
      });

      return {
        ...prevData,
        nowServing: newNowServing,
        upNext: newUpNext,
        waiting: newWaiting,
      };
    });
  };

  const handleNotifyUpcoming = () => {
    // This will later be implemented to send notifications
    console.log("Notifying upcoming customers");
    toast({
        title: "Notifications Sent",
        description: "The top 5 users in the queue have been notified."
    })
  };

  return (
    <>
      <PageHeader
        title={`${queueData.organizationName} - Queue Control`}
        subtitle="Manage your customer queue in real-time."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Control Panel */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Queue Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Now Serving */}
              <div className="p-6 rounded-lg bg-primary/10 border-2 border-primary">
                <p className="text-sm text-primary font-semibold mb-2">
                  Now Serving
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold text-primary">
                      {queueData.nowServing.token}
                    </p>
                    <p className="text-muted-foreground">{queueData.nowServing.userName}</p>
                  </div>
                  <Button size="lg" onClick={handleNextCustomer}>
                    <UserCheck className="mr-2 h-5 w-5" /> Next Customer
                  </Button>
                </div>
              </div>

              {/* Up Next List */}
              <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Up Next</h3>
                    <Button variant="outline" size="sm" onClick={handleNotifyUpcoming}>
                        <Bell className="mr-2 h-4 w-4"/> Notify Top 5
                    </Button>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Token</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queueData.upNext.length > 0 ? (
                        queueData.upNext.map((user, index) => (
                            <TableRow key={user.token}>
                            <TableCell className="font-bold">{user.token}</TableCell>
                            <TableCell>{user.userName}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={index === 0 ? "secondary" : "outline"}>
                                {index === 0 ? "Next in line" : "Waiting"}
                                </Badge>
                            </TableCell>
                            </TableRow>
                        ))
                      ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center h-24">No one is waiting in the 'Up Next' list.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Waiting List */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Full Queue</CardTitle>
              <CardDescription>
                {queueData.waiting.length} more people waiting.
              </CardDescription>
            </CardHeader>
            <CardContent>
                {queueData.waiting.length > 0 ? (
                    <div className="space-y-3">
                        {queueData.waiting.map(user => (
                            <div key={user.token} className="flex justify-between items-center p-3 bg-muted rounded-md">
                                <p className="font-medium">{user.userName}</p>
                                <p className="font-mono text-muted-foreground">{user.token}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        The waiting list is empty.
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
