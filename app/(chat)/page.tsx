import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { MessageSquare, ImageIcon, History } from "lucide-react";
import { auth } from "@/app/(auth)/auth";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Overview from "@/components/home/overview";
import HomeInput from "@/components/home/home-input";
import HomeGreeting from "@/components/home/home-greeting";
import WidgetSidebar from "@/components/home/widget-sidebar";
export default async function Home() {
  // Obtener la sesión del usuario
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex gap-4">
      <div className="container mx-4 sm:mx-auto sm:w-fit sm:p-4">
        <HomeGreeting user={user} />

        <HomeInput />

        <div className="flex flex-col gap-2 justify-start mt-6 w-fit">
          <p className="text-sm font-normal w-fit">Oder:</p>
          <Button variant="default" className="w-fit">
            <Link href="/projects/create">Neues Projekt anlegen</Link>
          </Button>
        </div>

        <Overview />
      </div>
      <WidgetSidebar user={user} />
    </div>
  );
}
