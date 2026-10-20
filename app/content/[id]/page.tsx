import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge } from "@/components/ui";
import { buttonClass } from "@/components/ui";
import {
  segmentLabels,
  contentStatusLabels,
  contentStatusColors,
} from "@/lib/labels";
import { evaluateGeo } from "@/lib/content";
import { ContentEditor } from "./editor";
import { StatusControls } from "./status-controls";

export const dynamic = "force-dynamic";

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const content = await prisma.content.findUnique({ where: { id } });
  if (!content) notFound();

  const geo = evaluateGeo({
    title: content.title,
    body: content.body,
    metaTitle: content.metaTitle,
    metaDescription: content.metaDescription,
    headings: content.headings,
    faqPairs: content.faqPairs,
    keywords: content.keywords,
  });

  return (
    <div>
      <PageHeader
        title={content.title}
        subtitle={segmentLabels[content.segment]}
        action={
          <div className="flex items-center gap-2">
            <Badge className={contentStatusColors[content.status]}>
              {contentStatusLabels[content.status]}
            </Badge>
            <Link href="/content" className={buttonClass("secondary")}>← Kembali</Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContentEditor
            id={content.id}
            title={content.title}
            body={content.body}
            metaTitle={content.metaTitle ?? ""}
            metaDescription={content.metaDescription ?? ""}
          />
        </div>

        <div className="space-y-6">
          {/* GEO panel */}
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Skor SEO/GEO</h3>
              <span className="text-2xl font-bold text-foreground">{geo.score}/100</span>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-primary" style={{ width: `${geo.score}%` }} />
            </div>
            <ul className="space-y-2 text-sm text-foreground">
              {geo.recommendations.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-muted">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            {content.keywords.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3">
                {content.keywords.map((k) => (
                  <Badge key={k}>{k}</Badge>
                ))}
              </div>
            )}
          </Card>

          {/* Claim validation */}
          <Card className={content.claimsValidated ? "" : "border-amber-300 bg-amber-50"}>
            <h3 className="mb-2 text-base font-semibold text-foreground">Validasi Klaim</h3>
            <p className="text-sm text-foreground">{content.claimNotes}</p>
            <p className="mt-2 text-xs text-muted">
              {content.claimsValidated
                ? "✅ Klaim divalidasi — konten dapat diterbitkan setelah disetujui."
                : "⚠ Konten tidak dapat diterbitkan sebelum klaim divalidasi (NFR-08)."}
            </p>
          </Card>

          {/* Review workflow */}
          <Card>
            <h3 className="mb-3 text-base font-semibold text-foreground">Alur Review</h3>
            <StatusControls
              id={content.id}
              status={content.status}
              claimsValidated={content.claimsValidated}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
