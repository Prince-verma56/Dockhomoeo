import { cache } from "react";
import { repositories } from "@/lib/repositories";

/**
 * One doctor (GET /api/care/doctors/:slug), read once per request and shared by
 * the profile's layout (which answers 404 before anything streams), its
 * metadata and the page.
 */
export const getDoctor = cache((slug: string) => repositories.care.getDoctor(slug));
