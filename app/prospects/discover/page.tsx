import { PageHeader } from "@/components/ui";
import { segmentOptions } from "@/lib/labels";
import { DiscoverClient } from "./discover-client";

export default function DiscoverPage() {
  return (
    <div>
      <PageHeader
        title="Temukan Prospek dari ICP"
        subtitle="Tentukan Ideal Customer Profile — segmen & daerah — lalu sistem mencarikan calon prospek, membersihkan, menilai, dan mengkualifikasikannya. Anda tinggal meninjau dan menyimpan."
      />
      <div className="p-8">
        <DiscoverClient segments={segmentOptions} />
      </div>
    </div>
  );
}
