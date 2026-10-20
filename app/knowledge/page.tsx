import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import { knowledgeCategoryLabels } from "@/lib/labels";
import { createKnowledge, deleteKnowledge, updateKnowledge } from "@/app/actions";
import { buttonClass, inputClass, labelClass } from "@/components/ui";
import type { KnowledgeCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

const CATEGORIES: KnowledgeCategory[] = [
  "COMPANY_PROFILE",
  "SERVICE_CATALOG",
  "PROCESS",
  "LEGALITY",
  "FAQ",
  "CLAIM_GUIDELINE",
];

export default async function KnowledgePage() {
  const entries = await prisma.knowledgeEntry.findMany({
    orderBy: [{ category: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Basis Pengetahuan (FAQ & Katalog)"
        subtitle="Sumber jawaban AI. Admin dapat memperbarui tanpa mengubah kode. Hanya entri yang disetujui yang digunakan untuk menjawab (grounding)."
      />

      <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {entries.length === 0 ? (
            <EmptyState title="Belum ada entri" description="Tambahkan FAQ atau informasi layanan." />
          ) : (
            entries.map((e) => (
              <Card key={e.id}>
                <details>
                  <summary className="flex cursor-pointer items-center justify-between gap-3">
                    <span className="font-medium text-foreground">{e.question}</span>
                    <span className="flex items-center gap-2">
                      <Badge>{knowledgeCategoryLabels[e.category]}</Badge>
                      {e.isApproved ? (
                        <Badge className="bg-emerald-100 text-emerald-700">Disetujui</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600">Draft</Badge>
                      )}
                    </span>
                  </summary>

                  <form action={updateKnowledge} className="mt-4 space-y-3 border-t border-border pt-4">
                    <input type="hidden" name="id" value={e.id} />
                    <div>
                      <label className={labelClass}>Pertanyaan / Topik</label>
                      <input name="question" defaultValue={e.question} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Jawaban</label>
                      <textarea name="answer" defaultValue={e.answer} rows={4} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Kata kunci (pisahkan koma)</label>
                      <input name="keywords" defaultValue={e.keywords.join(", ")} className={inputClass} />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input type="checkbox" name="isApproved" defaultChecked={e.isApproved} />
                      Disetujui untuk grounding AI
                    </label>
                    <div className="flex gap-2">
                      <button className={buttonClass("primary")}>Simpan</button>
                    </div>
                  </form>

                  <form action={deleteKnowledge} className="mt-2">
                    <input type="hidden" name="id" value={e.id} />
                    <button className={buttonClass("ghost")}>Hapus entri</button>
                  </form>
                </details>
              </Card>
            ))
          )}
        </div>

        <div>
          <Card>
            <h3 className="mb-3 text-base font-semibold text-foreground">Tambah Entri</h3>
            <form action={createKnowledge} className="space-y-3">
              <div>
                <label className={labelClass}>Kategori</label>
                <select name="category" className={inputClass} defaultValue="FAQ">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{knowledgeCategoryLabels[c]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Pertanyaan / Topik</label>
                <input name="question" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Jawaban (resmi)</label>
                <textarea name="answer" required rows={4} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Kata kunci (koma)</label>
                <input name="keywords" className={inputClass} placeholder="maklon, herbal, proses" />
              </div>
              <button className={`${buttonClass("primary")} w-full`}>Tambah</button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
