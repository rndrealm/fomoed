"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                <Card
                    className="cursor-pointer transition-shadow hover:shadow-lg"
                    onClick={() => router.push("/dashboard")}
                >
                    <CardHeader>
                        <CardTitle>Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 flex justify-end">
                        <Button variant="default" size="lg" className="w-full flex justify-between items-center">
                            Go to Dashboard <ArrowRight className="ml-2" />
                        </Button>
                    </CardContent>
                </Card>
                <Card
                    className="cursor-pointer transition-shadow hover:shadow-lg"
                    onClick={() => router.push("/signals")}
                >
                    <CardHeader>
                        <CardTitle>Smart Signals</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 flex justify-end">
                        <Button variant="default" size="lg" className="w-full flex justify-between items-center">
                            Go to Signals <ArrowRight className="ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
