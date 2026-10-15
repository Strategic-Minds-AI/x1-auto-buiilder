import SyncEngine from "@/components/portal/SyncEngine";
import PageHeader from "@/components/shared/PageHeader";

export default function GPTSyncLogs() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="GPT Sync Logs" subtitle="History of content validation, system commands, and synchronization status" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SyncEngine />
      </div>
    </div>
  );
}