"use client";

import Link from "next/link";
import { User, Package, MapPin, LogOut } from "lucide-react";
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
import { useAuth } from "@/components/providers/AuthProvider";

export function AccountMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = user.firstName ? user.firstName[0].toUpperCase() : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none ml-1">
        <Avatar className="size-9 border border-white/40 shadow-sm transition-transform hover:scale-105 active:scale-95 bg-white/50 backdrop-blur-md text-forest-deep">
          <AvatarFallback className="bg-transparent font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-white/20 bg-white/95 backdrop-blur-xl">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-ink">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs leading-none text-muted-ink">
              {user.phone}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-forest-abyss/5 my-1" />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer hover:bg-forest-deep/5 focus:bg-forest-deep/5">
            <Link href="/account">
              <User className="mr-2 size-4 text-forest-deep/70" />
              <span>Account Overview</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer hover:bg-forest-deep/5 focus:bg-forest-deep/5">
            <Link href="/account/orders">
              <Package className="mr-2 size-4 text-forest-deep/70" />
              <span>My Orders</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer hover:bg-forest-deep/5 focus:bg-forest-deep/5">
            <Link href="/account/addresses">
              <MapPin className="mr-2 size-4 text-forest-deep/70" />
              <span>Saved Addresses</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-forest-abyss/5 my-1" />
        <DropdownMenuItem 
          onClick={() => logout()}
          className="rounded-xl cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
        >
          <LogOut className="mr-2 size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
