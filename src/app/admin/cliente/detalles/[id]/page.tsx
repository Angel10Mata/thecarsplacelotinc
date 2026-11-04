import { z } from "zod";
import { getCustomerByIdAction } from "@/components/(base)/clientes/lib/actions";
import {
  ClienteDetalleLegacyEntrada,
  ClienteDetalleLegacyEntradaInvalida,
} from "@/components/(base)/clientes/ClienteDetalleLegacyEntrada";

type ClienteDetalleLegacyPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClienteDetalleLegacyPage({
  params,
}: ClienteDetalleLegacyPageProps) {
  const { id } = await params;
  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) {
    return <ClienteDetalleLegacyEntradaInvalida />;
  }

  const res = await getCustomerByIdAction(parsedId.data);
  if (!res.ok) {
    return <ClienteDetalleLegacyEntradaInvalida />;
  }

  return <ClienteDetalleLegacyEntrada customerId={res.data.id} />;
}
