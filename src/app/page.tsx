import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Trip Planner</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          Plan your trips, organize your itinerary, and share with friends.
          The easiest way to manage your travel plans.
        </p>
        <div className="space-x-4">
          <Button asChild size="lg">
            <Link href="/login">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/trips">My Trips</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
