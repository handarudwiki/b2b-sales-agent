"use client";

import { useTransition } from "react";
import { deleteContact, deleteRelationship } from "@/app/actions";

export function DeleteButton({
  id,
  kind,
}: {
  id: string;
  kind: "contact" | "relationship";
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      if (kind === "contact") await deleteContact(fd);
      else await deleteRelationship(fd);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="rounded-md px-2 py-1 text-xs text-muted hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
      title="Hapus"
    >
      {pending ? "..." : "✕"}
    </button>
  );
}
