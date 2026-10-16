"use client";

import React, { useId, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { describeError } from "@/lib/api";
import { uploadAdminFile, type UploadFolder } from "@/lib/admin/content";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Uploads one image to /api/admin/uploads and hands back the address the
 * backend gives it. The backend checks the file's content; this only stops
 * files that are obviously too large or not images before sending them.
 */
export function ImageUpload({
  label,
  value,
  onChange,
  folder,
  disabled,
  shape = "square",
  hint,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  folder: UploadFolder;
  disabled?: boolean;
  shape?: "square" | "round" | "wide";
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const choose = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) return setError("Choose a JPG, PNG, WebP or GIF image.");
    if (file.size > MAX_BYTES) return setError("The image is larger than 5 MB.");
    setBusy(true);
    try {
      const { url } = await uploadAdminFile(file, folder);
      onChange(url);
    } catch (err) {
      setError(describeError(err, "The image could not be uploaded."));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      <span id={`${id}-label`} className="block text-xs font-semibold text-neutral-700">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "relative grid shrink-0 place-items-center overflow-hidden border border-neutral-200 bg-neutral-50 text-neutral-300",
            shape === "round" && "size-16 rounded-full",
            shape === "square" && "size-16 rounded-lg",
            shape === "wide" && "h-20 w-32 rounded-lg",
          )}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin uploads of any size, previewed as uploaded
            <img src={value} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <ImagePlus className="size-5" aria-hidden />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            id={id}
            aria-labelledby={`${id}-label`}
            disabled={disabled || busy}
            onChange={(e) => choose(e.target.files?.[0])}
          />
          <Button type="button" variant="outline" className="h-9 gap-1.5 text-xs" disabled={disabled || busy} onClick={() => inputRef.current?.click()}>
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
            {busy ? "Uploading…" : value ? "Replace" : "Upload"}
          </Button>
          {value ? (
            <Button type="button" variant="ghost" className="h-9 gap-1.5 text-xs text-rose-700 hover:bg-rose-50" disabled={disabled || busy} onClick={() => onChange(null)}>
              <Trash2 className="size-3.5" />
              Remove
            </Button>
          ) : null}
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-[11px] font-medium text-rose-700">
          {error}
        </p>
      ) : null}
      {hint ? <p className="text-[11px] text-neutral-500">{hint}</p> : null}
    </div>
  );
}
