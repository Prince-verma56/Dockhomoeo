import {
  Baby,
  BadgeCheck,
  Bone,
  CalendarCheck,
  CreditCard,
  Droplets,
  FileText,
  FlaskConical,
  Flower2,
  Hand,
  Headset,
  HeartPulse,
  Leaf,
  Moon,
  PackageCheck,
  Pill,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Truck,
  Video,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/types/common";

/**
 * Icon registry. Data files reference icons by name so they stay plain,
 * serialisable objects that a future API response could drop straight into —
 * no React components inside the data layer.
 *
 * One family throughout (lucide), per brain/06_COMPONENT_SYSTEM.md.
 */
export const ICONS: Record<IconName, LucideIcon> = {
  "shield-check": ShieldCheck,
  truck: Truck,
  "credit-card": CreditCard,
  "rotate-ccw": RotateCcw,
  stethoscope: Stethoscope,
  video: Video,
  "file-text": FileText,
  "calendar-check": CalendarCheck,
  "package-check": PackageCheck,
  search: Search,
  "heart-pulse": HeartPulse,
  sparkles: Sparkles,
  leaf: Leaf,
  baby: Baby,
  bone: Bone,
  wind: Wind,
  moon: Moon,
  "flower-2": Flower2,
  droplets: Droplets,
  pill: Pill,
  "flask-conical": FlaskConical,
  hand: Hand,
  "badge-check": BadgeCheck,
  headset: Headset,
};
