"use client";

import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-900 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Sign in!
          </CardTitle>
          <CardDescription className="text-gray-400">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <GoogleLoginButton className="w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
