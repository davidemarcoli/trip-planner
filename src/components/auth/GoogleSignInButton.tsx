"use client";

import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function GoogleSignInButton() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
            router.push("/trips"); // Redirect to trips page after login
        } catch (error) {
            console.error("Login failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handleSignIn} disabled={isLoading} className="w-full">
            {isLoading ? "Signing in..." : "Sign in with Google"}
        </Button>
    );
}
