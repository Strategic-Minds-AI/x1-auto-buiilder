import Campaigns from "@/components/portal/Campaigns";
import PageHeader from "@/components/shared/PageHeader";

export default function CampaignMonitor() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="Campaign Monitor" subtitle="Monitor bulk website launch campaigns across locations" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Campaigns />
      </div>
    </div>
  );
}