"use client";

import { useEffect, useState } from "react";
import { repositories } from "@/lib/repositories";
import { ApiAddress } from "@/types/api/account";
import { Loader2, Plus, MapPin, MoreVertical, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const data = await repositories.account.getAddresses();
        setAddresses(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAddresses();
  }, []);

  const handleSetDefault = async (id: string) => {
    try {
      await repositories.account.setDefaultAddress(id);
      setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await repositories.account.deleteAddress(id);
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[2rem] bg-white border border-forest-abyss/5">
        <Loader2 className="size-8 animate-spin text-forest-deep" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-ink">Saved Addresses</h2>
        <Button className="rounded-xl bg-forest-deep text-white hover:bg-forest-abyss h-11 px-6 shadow-sm">
          <Plus className="mr-2 size-4" />
          Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] bg-white border border-forest-abyss/5 p-16 text-center shadow-sm">
          <div className="rounded-full bg-forest-abyss/5 p-4 mb-4">
            <MapPin className="size-8 text-muted-ink" />
          </div>
          <h3 className="font-display text-xl font-bold text-ink">No saved addresses</h3>
          <p className="mt-2 text-muted-ink max-w-md">
            Add a delivery address to make checkout faster next time.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`relative rounded-[2rem] p-6 sm:p-8 shadow-sm border transition-all duration-300 ${
                addr.isDefault 
                  ? "bg-forest-deep/5 border-forest-deep/20" 
                  : "bg-white border-forest-abyss/5 hover:border-forest-deep/20"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-ink">{addr.fullName}</span>
                  {addr.isDefault && (
                    <span className="inline-flex items-center rounded-md bg-forest-deep/10 px-2 py-1 text-xs font-medium text-forest-deep">
                      Default
                    </span>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 rounded-full -mr-2 text-muted-ink hover:text-ink hover:bg-black/5">
                      <MoreVertical className="size-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl">
                    <DropdownMenuItem className="cursor-pointer rounded-lg">
                      <Edit2 className="mr-2 size-4 text-muted-ink" />
                      Edit
                    </DropdownMenuItem>
                    {!addr.isDefault && (
                      <DropdownMenuItem 
                        className="cursor-pointer rounded-lg"
                        onClick={() => handleSetDefault(addr.id)}
                      >
                        <CheckCircle2 className="mr-2 size-4 text-muted-ink" />
                        Set as Default
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      className="cursor-pointer rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={() => handleDelete(addr.id)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <address className="not-italic text-sm text-muted-ink space-y-1">
                <p>{addr.line1}</p>
                {addr.landmark && <p>{addr.landmark}</p>}
                <p>{addr.city}, {addr.state} {addr.pincode}</p>
                <p className="mt-4 text-ink font-medium">Phone: {addr.phone}</p>
              </address>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
