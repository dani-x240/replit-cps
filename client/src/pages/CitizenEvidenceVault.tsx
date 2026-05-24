import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Image, Mic, Shield, ShieldCheck, ShieldX, Video } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import type { Evidence } from "@shared/schema";

function FileIcon({ type }: { type: string }) {
  if (type === "image") return <Image className="w-5 h-5 text-purple-600" />;
  if (type === "video") return <Video className="w-5 h-5 text-blue-600" />;
  if (type === "audio") return <Mic className="w-5 h-5 text-green-600" />;
  return <FileText className="w-5 h-5 text-orange-600" />;
}

const vBadge: Record<string, { label: string; cls: string; Icon: any }> = {
  verified: { label: "VERIFIED",  cls: "bg-green-100 text-green-800", Icon: ShieldCheck },
  tampered: { label: "TAMPERED",  cls: "bg-red-100 text-red-800",     Icon: ShieldX },
  archived: { label: "ARCHIVED",  cls: "bg-neutral-100 text-neutral-600", Icon: Shield },
};

export default function CitizenEvidenceVault() {
  const [, setLocation] = useLocation();
  const { data: items = [], isLoading } = useQuery<Evidence[]>({ queryKey: ["/api/evidence/my"] });

  return (
    <MobileLayout phoneFrame={false} className="bg-green-50/30 min-h-screen">
      <div className="max-w-4xl mx-auto w-full p-6 pt-12 pb-24 lg:p-12">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/citizen/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">Evidence Vault</h1>
            <p className="text-sm text-muted-foreground">SHA-256 verified files</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 text-xs text-green-800">
          Every file has a unique SHA-256 fingerprint. If anyone tampers with it, the system shows a red
          <strong> TAMPERED</strong> warning instantly.
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-green-100" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Shield className="w-12 h-12 mx-auto mb-3 text-green-200" />
            <p className="font-semibold">No evidence uploaded yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Evidence files you upload with crime reports appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((ev, i) => {
              const vs = ev.verificationStatus || "verified";
              const badge = vBadge[vs] || vBadge.verified;
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-green-100 shadow-sm p-4"
                  data-testid={`evidence-card-${ev.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-neutral-50 border flex items-center justify-center">
                        <FileIcon type={ev.fileType} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold truncate max-w-[160px]">
                          {ev.fileName || `Evidence #${ev.id}`}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{ev.fileType}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>
                      <badge.Icon className="w-3 h-3" />
                      {badge.label}
                    </div>
                  </div>

                  {ev.sha256Hash ? (
                    <div className="bg-neutral-50 rounded-lg p-2 mb-2">
                      <p className="text-[9px] font-mono text-muted-foreground break-all leading-tight">
                        {ev.sha256Hash}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-neutral-50 rounded-lg p-2 mb-2">
                      <p className="text-[10px] text-muted-foreground italic">Hash not recorded</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground">
                      Case #{ev.reportId}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {ev.createdAt ? format(new Date(ev.createdAt), "MMM d, yyyy") : ""}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
