import type { Metadata } from "next";

// The staff panel is private: search engines are asked not to list any of it.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
