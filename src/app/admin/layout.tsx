import { AppPageBackground } from "@/components/(base)/layout/AppPageBackground";

export default function FarmamuniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppPageBackground hexagonBackdrop>{children}</AppPageBackground>;
}
