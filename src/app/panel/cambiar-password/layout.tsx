import { AppPageBackground } from "@/components/(base)/layout/AppPageBackground";

export default function CambiarPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppPageBackground
      centered
      contentClassName="items-center justify-center"
      hexagonBackdrop
    >
      {children}
    </AppPageBackground>
  );
}
