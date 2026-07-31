import { notFound } from "next/navigation";
import { getProgramme } from "@/lib/actions/programmes";
import ProgrammeBuilderClient from "@/components/train/ProgrammeBuilderClient";

export default async function EditProgrammePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const programme = await getProgramme(id);
  if (!programme) notFound();

  return <ProgrammeBuilderClient programme={programme} />;
}
