import { PageHeader } from "@/components/ui";
import { segmentOptions } from "@/lib/labels";
import { DiscoverClient } from "./discover-client";

export default function DiscoverPage() {
  return (
    <div>
      <PageHeader
        back={{ href: "/prospects", label: "Prospek" }}
        title="Temukan Prospek dari ICP"
        subtitle="Tentukan segmen dan daerah — sistem mencarikan calon prospek, membersihkan, menilai, dan mengkualifikasikannya. Anda tinggal meninjau dan menyimpan."
      />
      <DiscoverClient segments={segmentOptions} />
    </div>
  );
}
