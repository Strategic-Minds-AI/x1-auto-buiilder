import { useNavigate } from "react-router-dom";
import MassLaunchConsole from "@/components/portal/MassLaunchConsole";
import PageHeader from "@/components/shared/PageHeader";

export default function MassLaunchConsolePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="Mass Launch Console" subtitle="Configure and execute batch deployments of website variants" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MassLaunchConsole onDone={() => navigate("/campaign-monitor")} />
      </div>
    </div>
  );
}