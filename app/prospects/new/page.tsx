import { PageHeader, Card } from "@/components/ui";
import { segmentOptions } from "@/lib/labels";
import { ProspectForm } from "./form";

export default function NewProspectPage() {
  return (
    <div>
      <PageHeader
        title="Tambah Prospek"
        subtitle="Sistem akan menghitung skor prioritas dan menandai data yang belum lengkap."
      />
      <div className="max-w-2xl p-8">
        <Card>
          <ProspectForm segments={segmentOptions} />
        </Card>
      </div>
    </div>
  );
}
