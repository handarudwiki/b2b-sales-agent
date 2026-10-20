"use client";

import { useTransition } from "react";
import { PiCircleNotch, PiTrash } from "react-icons/pi";
import { deleteContact, deleteRelationship } from "@/app/actions";
import { useTopLoaderWhile } from "@/components/top-loader";

export function DeleteButton({
  id,
  kind,
}: {
  id: string;
  kind: "contact" | "relationship";
}) {
  const [pending, startTransition] = useTransition();
  useTopLoaderWhile(pending);

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
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label="Hapus"
      title="Hapus"
      className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
    >
      {pending ? <PiCircleNotch className="size-4 animate-spin" /> : <PiTrash className="size-4" />}
    </button>
  );
}
