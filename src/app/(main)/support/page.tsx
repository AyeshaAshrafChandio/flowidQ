
"use client";

import { useState, useActionState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Sparkles, User } from "lucide-react";
import { handleSupportQuery } from "@/app/actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const initialState = {
  messages: [],
  error: undefined,
};

export default function SupportPage() {
  const [state, formAction, isPending] = useActionState(handleSupportQuery, initialState);
  const [messages, setMessages] = useState<Message[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.messages) {
      setMessages(state.messages);
      formRef.current?.reset();
    }
  }, [state]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A bit of a hack to scroll to the bottom of the content
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


  return (
    <>
      <PageHeader
        title="AI Support Assistant"
        subtitle="Have a question about FlowIDQ? Ask our AI assistant."
      />
      <div className="flex justify-center">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">FlowIDQ Support Bot</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[50vh] w-full pr-4" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.length === 0 && (
                     <div className="text-center text-muted-foreground pt-16">
                        <Sparkles className="mx-auto h-10 w-10 mb-4" />
                        <p>Ask me anything about using the app!</p>
                        <p className="text-sm">e.g., "How do I upload a document?"</p>
                    </div>
                )}
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <Sparkles className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-md rounded-lg p-3 text-sm",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.content}
                    </div>
                     {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                         <AvatarFallback>
                            <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isPending && (
                    <div className="flex items-start gap-3 justify-start">
                         <Avatar className="h-8 w-8">
                            <AvatarFallback>
                                <Sparkles className="h-4 w-4" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="max-w-md rounded-lg p-3 text-sm bg-muted animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form action={formAction} ref={formRef} className="w-full flex items-center gap-2">
              <input type="hidden" name="messages" value={JSON.stringify(messages)} />
              <Input
                name="prompt"
                placeholder="Type your message..."
                autoComplete="off"
                required
              />
              <Button type="submit" size="icon" disabled={isPending}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
