import GPTSyncDashboard from "@/components/portal/GPTSyncDashboard";
import PageHeader from "@/components/shared/PageHeader";

export default function GPTSyncLogs() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="GPT Sync Dashboard" subtitle="Monitor AI validation and send commands to the generator" />
      <GPTSyncDashboard />
    </div>
  );
}