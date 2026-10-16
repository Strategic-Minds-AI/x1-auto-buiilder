import PortalShell from "@/components/portal/PortalShell";
import MockupLibraryContent from "@/components/portal/MockupLibraryContent";

export default function MockupLibrary() {
  return (
    <div className="portal-light min-h-screen bg-white">
      <PortalShell title="Mockup Library">
        <MockupLibraryContent />
      </PortalShell>
    </div>
  );
}