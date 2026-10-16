import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: true },
};

export default function RegisterLayout({ children }: LayoutProps<"/register">) {
  return children;
}
