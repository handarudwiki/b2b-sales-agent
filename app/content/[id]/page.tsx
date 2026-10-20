import { notFound } from "next/navigation";
import {
  PiChartLineUp,
  PiFlowArrow,
  PiLightbulb,
  PiSealCheck,
  PiShieldWarning,
  PiTag,
} from "react-icons/pi";
import { prisma } from "@/lib/prisma";
import {
  Alert,
  Badge,
  Card,
  CardHeader,
  PageHeader,
} from "@/components/ui";
import { ScoreRing } from "@/components/charts";
import { segmentColor, segmentIcon, tint } from "@/components/tokens";
import {
  segmentLabels,
  contentStatusLabels,
  contentStatusColors,
} from "@/lib/labels";
import { evaluateGeo } from "@/lib/content";
import { ContentEditor } from "./editor";
import { StatusControls } from "./status-controls";

export const dynamic = "force-dynamic";

function geoColor(score: number) {
  if (score >= 70) return "#12a150";
  if (score >= 45) return "#f0a20b";
  return "#e5484d";
}

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
  const SegmentIcon = segmentIcon[content.segment];

  return (
    <div>
      <PageHeader
        back={{ href: "/content", label: "Konten" }}
        title={content.title}
        meta={
          <>
            <Badge dot className={contentStatusColors[content.status]}>
              {contentStatusLabels[content.status]}
            </Badge>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-[11.5px] font-medium leading-none"
              style={tint(segmentColor[content.segment], 14)}
            >
              <SegmentIcon className="size-3.5" />
              {segmentLabels[content.segment]}
            </span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ContentEditor
            id={content.id}
            title={content.title}
            body={content.body}
            metaTitle={content.metaTitle ?? ""}
            metaDescription={content.metaDescription ?? ""}
          />
        </div>

        <div className="space-y-5 lg:col-span-4">
          <Card className="animate-fade-up" style={{ animationDelay: "60ms" }}>
            <CardHeader icon={PiChartLineUp} title="Skor SEO/GEO" />
            <div className="flex items-center gap-5">
              <ScoreRing value={geo.score} color={geoColor(geo.score)} size={108} stroke={10}>
                <div>
                  <p className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-ink">{geo.score}</p>
                  <p className="mt-1 text-[10.5px] font-medium text-muted">dari 100</p>
                </div>
              </ScoreRing>
              <p className="text-[12.5px] leading-relaxed text-muted">
                Dihitung dari panjang konten, struktur heading, Q&amp;A, meta, dan kata kunci.
              </p>
            </div>
            <ul className="mt-5 space-y-2.5 border-t border-line pt-4">
              {geo.recommendations.map((r, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-2">
                  <PiLightbulb className="mt-0.5 size-4 shrink-0 text-amber-600" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            {content.keywords.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-line pt-4">
                {content.keywords.map((k) => (
                  <Badge key={k} icon={PiTag}>
                    {k}
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: "120ms" }}>
            <CardHeader icon={content.claimsValidated ? PiSealCheck : PiShieldWarning} title="Validasi klaim" />
            <Alert tone={content.claimsValidated ? "success" : "warning"}>
              <p>{content.claimNotes}</p>
              <p className="mt-1.5 text-[12px] opacity-80">
                {content.claimsValidated
                  ? "Klaim divalidasi — konten dapat diterbitkan setelah disetujui."
                  : "Konten tidak dapat diterbitkan sebelum klaim divalidasi."}
              </p>
            </Alert>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: "180ms" }}>
            <CardHeader icon={PiFlowArrow} title="Alur review" />
            <StatusControls id={content.id} status={content.status} claimsValidated={content.claimsValidated} />
          </Card>
        </div>
      </div>
    </div>
  );
}
