import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Welcome to Trip Planner</CardTitle>
                    <CardDescription>Sign in to start planning your next adventure</CardDescription>
                </CardHeader>
                <CardContent>
                    <GoogleSignInButton />
                </CardContent>
            </Card>
        </div>
    );
}
