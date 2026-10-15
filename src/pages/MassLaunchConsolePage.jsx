import { useNavigate } from "react-router-dom";
import MassLaunchConsoleV2 from "@/components/masslaunch/MassLaunchConsoleV2";
import PageHeader from "@/components/shared/PageHeader";

export default function MassLaunchConsolePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="Mass Launch Console" subtitle="Generate, validate, auto-fix, and batch-deploy sites to Google standards" />
      <MassLaunchConsoleV2 onDeployed={() => navigate("/campaign-monitor")} />
    </div>
  );
}