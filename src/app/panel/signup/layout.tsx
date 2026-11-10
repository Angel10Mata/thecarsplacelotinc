import { requireAdminPageAccess } from "@/lib/user-role";

export default async function PanelSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPageAccess();
  return children;
}
