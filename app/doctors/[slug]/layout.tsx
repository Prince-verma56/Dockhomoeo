import { notFound } from "next/navigation";
import { getDoctor } from "@/lib/care/doctor";

/**
 * Settles whether the doctor exists before the profile streams: the page's
 * loading state starts the response, after which an unknown doctor could only
 * be a 200 with a not-found body. Here it is still a real 404.
 */
export default async function DoctorLayout({ children, params }: LayoutProps<"/doctors/[slug]">) {
  if (!(await getDoctor((await params).slug))) notFound();
  return children;
}
