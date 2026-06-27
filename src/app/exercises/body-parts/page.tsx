import Link from "next/link";
import { getBodyParts } from "@/lib/actions/exercises";
import AddBodyPartForm from "@/components/exercises/AddBodyPartForm";

export default async function BodyPartsPage() {
  const bodyParts = await getBodyParts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Body Parts</h1>
        <Link href="/exercises" className="text-sm text-muted underline">
          &larr; Back
        </Link>
      </div>

      <AddBodyPartForm />

      <ul className="divide-y divide-border rounded-xl bg-surface">
        {bodyParts.map((bp) => (
          <li key={bp.id} className="px-4 py-3">
            {bp.name}
          </li>
        ))}
        {bodyParts.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-muted">No body parts yet.</li>
        )}
      </ul>
    </div>
  );
}
