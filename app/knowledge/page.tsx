import {
  PiBooks,
  PiCaretDown,
  PiCheckCircle,
  PiFloppyDisk,
  PiPlus,
  PiQuestion,
  PiTag,
  PiTextAlignLeft,
  PiTrash,
} from "react-icons/pi";
import { prisma } from "@/lib/prisma";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  Field,
  PageHeader,
  checkboxClass,
  inputClass,
  labelClass,
  selectClass,
  textareaClass,
} from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { knowledgeCategoryStyle } from "@/components/tokens";
import { knowledgeCategoryLabels } from "@/lib/labels";
import { createKnowledge, deleteKnowledge, updateKnowledge } from "@/app/actions";
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

  const groups = CATEGORIES.map((category) => ({
    category,
    items: entries.filter((e) => e.category === category),
  })).filter((g) => g.items.length > 0);
  const approved = entries.filter((e) => e.isApproved).length;

  return (
    <div>
      <PageHeader
        title="Basis Pengetahuan"
        subtitle="Sumber jawaban AI. Dapat diperbarui tanpa mengubah kode — hanya entri yang disetujui yang dipakai untuk menjawab."
        meta={
          <>
            <Badge icon={PiBooks}>{entries.length} entri</Badge>
            <Badge icon={PiCheckCircle} className="bg-emerald-100 text-emerald-800">
              {approved} disetujui untuk grounding
            </Badge>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          {entries.length === 0 ? (
            <EmptyState icon={PiBooks} title="Belum ada entri" description="Tambahkan FAQ atau informasi layanan." />
          ) : (
            groups.map(({ category, items }) => {
              const style = knowledgeCategoryStyle[category];
              const Icon = style.icon;
              return (
                <section key={category} className="animate-fade-up">
                  <h2 className="mb-2.5 flex items-center gap-2 px-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
                    <Icon className="size-4" />
                    {knowledgeCategoryLabels[category]}
                    <span className="font-medium normal-case tracking-normal">· {items.length}</span>
                  </h2>
                  <div className="space-y-2.5">
                    {items.map((e) => (
                      <details
                        key={e.id}
                        className="group rounded-[22px] border border-line/80 bg-surface shadow-card transition-colors open:border-line-strong"
                      >
                        <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                          <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${style.className}`}>
                            <Icon className="size-[18px]" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14px] font-semibold leading-snug text-ink">{e.question}</span>
                            <span className="mt-0.5 block truncate text-[12px] text-muted">{e.answer}</span>
                          </span>
                          {e.isApproved ? (
                            <Badge dot className="bg-emerald-100 text-emerald-800">Disetujui</Badge>
                          ) : (
                            <Badge dot className="bg-slate-100 text-slate-600">Draft</Badge>
                          )}
                          <PiCaretDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                        </summary>

                        <div className="border-t border-line px-5 pb-5 pt-4">
                          <form action={updateKnowledge} className="space-y-4">
                            <input type="hidden" name="id" value={e.id} />
                            <Field label="Pertanyaan / topik" icon={PiQuestion}>
                              <input name="question" defaultValue={e.question} className={inputClass} />
                            </Field>
                            <Field label="Jawaban" icon={PiTextAlignLeft}>
                              <textarea name="answer" defaultValue={e.answer} rows={4} className={textareaClass} />
                            </Field>
                            <Field label="Kata kunci (pisahkan koma)" icon={PiTag}>
                              <input name="keywords" defaultValue={e.keywords.join(", ")} className={inputClass} />
                            </Field>
                            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-[13px] text-ink">
                              <input type="checkbox" name="isApproved" defaultChecked={e.isApproved} className={checkboxClass} />
                              Disetujui untuk grounding AI
                            </label>
                            <SubmitButton icon={<PiFloppyDisk />}>Simpan</SubmitButton>
                          </form>
                          <form action={deleteKnowledge} className="mt-3 border-t border-line pt-3">
                            <input type="hidden" name="id" value={e.id} />
                            <SubmitButton variant="danger-soft" size="sm" icon={<PiTrash />}>
                              Hapus entri
                            </SubmitButton>
                          </form>
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>

        <div className="lg:col-span-4">
          <Card className="lg:sticky lg:top-24">
            <CardHeader icon={PiPlus} title="Tambah entri" />
            <form action={createKnowledge} className="space-y-4">
              <div>
                <label htmlFor="category" className={labelClass}>Kategori</label>
                <select id="category" name="category" className={selectClass} defaultValue="FAQ">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{knowledgeCategoryLabels[c]}</option>
                  ))}
                </select>
              </div>
              <Field label="Pertanyaan / topik" icon={PiQuestion}>
                <input name="question" required className={inputClass} />
              </Field>
              <Field label="Jawaban (resmi)" icon={PiTextAlignLeft}>
                <textarea name="answer" required rows={4} className={textareaClass} />
              </Field>
              <Field label="Kata kunci (koma)" icon={PiTag}>
                <input name="keywords" className={inputClass} placeholder="maklon, herbal, proses" />
              </Field>
              <SubmitButton icon={<PiPlus />} className="w-full" size="lg">
                Tambah
              </SubmitButton>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
