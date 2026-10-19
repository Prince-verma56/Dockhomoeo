"use client";

import Link from "next/link";
import { User, Package, MapPin, LogOut, ClipboardList, Settings, CalendarClock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { displayName, useAuth } from "@/components/providers/AuthProvider";

export function AccountMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = (user.firstName?.trim()[0] ?? user.name?.trim()[0] ?? "U").toUpperCase();
  const items = [
    { href: "/account", label: "Account overview", icon: User },
    { href: "/account/consultations", label: "Consultations", icon: CalendarClock },
    { href: "/account/orders", label: "My orders", icon: Package },
    { href: "/account/prescriptions", label: "Prescriptions", icon: ClipboardList },
    { href: "/account/addresses", label: "Saved addresses", icon: MapPin },
    { href: "/account/profile", label: "Profile", icon: Settings },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={`Account menu for ${displayName(user)}`} className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#0d5a43]/40 cursor-pointer">
        <Avatar className="size-10 border border-line-soft/80 shadow-2xs transition-transform hover:scale-105 active:scale-95 bg-white/70 dark:bg-white/10 backdrop-blur-md text-[#0d5a43] dark:text-emerald-400">
          <AvatarFallback className="bg-transparent font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-white/20 bg-white/95 backdrop-blur-xl">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-ink">
              {[user.firstName, user.lastName].filter(Boolean).join(" ") || "Your account"}
            </p>
            <p className="text-xs leading-none text-muted-ink">
              +91 {user.phone}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-forest-abyss/5 my-1" />
        <DropdownMenuGroup>
          {items.map(({ href, label, icon: Icon }) => (
            <DropdownMenuItem key={href} asChild className="rounded-xl cursor-pointer hover:bg-forest-deep/5 focus:bg-forest-deep/5">
              <Link href={href}>
                <Icon className="mr-2 size-4 text-forest-deep/70" />
                <span>{label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-forest-abyss/5 my-1" />
        <DropdownMenuItem 
          onClick={() => void logout()}
          className="rounded-xl cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
        >
          <LogOut className="mr-2 size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
