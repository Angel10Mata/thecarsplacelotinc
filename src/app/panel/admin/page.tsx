import { redirect } from "next/navigation";
import { APP_AJUSTES_PATH } from "@/lib/app-config";

export default function PanelAdminLegacyRedirect() {
  redirect(APP_AJUSTES_PATH);
}
