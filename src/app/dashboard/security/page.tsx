'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, BrainCircuit, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { accessToolAnalysis } from '@/ai/flows/access-tool-analysis';

const sampleLogs = `[2023-10-27 10:05:15] user:alice@example.com, action:view, doc:doc-1, ip:192.168.1.10
[2023-10-27 10:06:22] user:bob@example.com, action:share, doc:doc-2, ip:10.0.0.5, recipient:charlie@example.com
[2023-10-27 11:30:45] user:alice@example.com, action:view, doc:doc-1, ip:203.0.113.55
[2023-10-27 12:00:01] user:eve@example.com, action:failed_login, ip:198.51.100.2
[2023-10-27 12:00:05] user:eve@example.com, action:failed_login, ip:198.51.100.2
[2023-10-27 12:00:09] user:eve@example.com, action:failed_login, ip:198.51.100.2
[2023-10-27 14:15:00] user:bob@example.com, action:download, doc:doc-2, ip:10.0.0.5
[2023-10-28 09:00:10] user:dave@example.com, action:view, doc:doc-3, ip:172.16.0.10
[2023-10-28 09:05:00] user:dave@example.com, action:delete, doc:doc-3, ip:172.16.0.10`;


export default function SecurityPage() {
    const [logs, setLogs] = useState(sampleLogs);
    const [analysisResult, setAnalysisResult] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleAnalyze = async () => {
        setLoading(true);
        setAnalysisResult('');
        try {
            const result = await accessToolAnalysis({ accessLogs: logs });
            setAnalysisResult(result.analysisResult);
        } catch (error: any) {
            toast({
                title: 'Analysis Failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-headline">Access Security Analysis</h2>
                    <p className="text-muted-foreground">
                        Use our AI tool to assess access history and enhance security.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Access Logs</CardTitle>
                        <CardDescription>
                            Enter or paste your document access logs below for analysis.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            value={logs}
                            onChange={(e) => setLogs(e.target.value)}
                            rows={15}
                            className="font-code"
                            placeholder="Paste your access logs here..."
                        />
                        <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <BrainCircuit className="mr-2 h-4 w-4" />
                            )}
                            Analyze Access History
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">AI Analysis Result</CardTitle>
                        <CardDescription>
                            Potential security threats and recommendations will appear here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                             <div className="space-y-4">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-1/2" />
                                <br/>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-4/5" />
                            </div>
                        ) : analysisResult ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md border bg-muted/50 p-4">
                                <p>{analysisResult}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full">
                                <ShieldAlert className="h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-sm text-muted-foreground">
                                    Analysis results will be displayed here. Click the analyze button to start.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
