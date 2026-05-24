import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, MessageCircle, RefreshCw, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { Report, TimelineEntry, Message } from "@shared/schema";

const STATUSES = [
  { value: "submitted",     label: "Received",     color: "bg-yellow-100 text-yellow-800" },
  { value: "assigned",      label: "Assigned",     color: "bg-blue-100 text-blue-800" },
  { value: "investigating", label: "Investigating",color: "bg-orange-100 text-orange-800" },
  { value: "resolved",      label: "Resolved",     color: "bg-green-100 text-green-800" },
  { value: "escalated",     label: "Escalated",    color: "bg-red-100 text-red-800" },
];

export default function PoliceIOCases() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Report | null>(null);
  const [tab, setTab] = useState<"details" | "chat">("details");
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");

  const { data: cases = [], isLoading } = useQuery<Report[]>({ queryKey: ["/api/reports"] });
  const { data: timeline = [] } = useQuery<TimelineEntry[]>({
    queryKey: [`/api/reports/${selected?.id}/timeline`],
    enabled: !!selected,
  });
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: [`/api/reports/${selected?.id}/messages`],
    enabled: !!selected,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, officerNotes }: any) =>
      apiRequest("PATCH", `/api/reports/${id}`, { status, officerNotes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/reports"] });
      qc.invalidateQueries({ queryKey: [`/api/reports/${selected?.id}/timeline`] });
      toast({ title: "Status updated" });
      setNotes("");
      setNewStatus("");
    },
  });

  const sendMsg = useMutation({
    mutationFn: (content: string) =>
      apiRequest("POST", `/api/reports/${selected?.id}/messages`, { content }),
    onSuccess: () => {
      setMsg("");
      qc.invalidateQueries({ queryKey: [`/api/reports/${selected?.id}/messages`] });
    },
  });

  const statusColor = (s: string) => STATUSES.find(x => x.value === s)?.color || "bg-gray-100 text-gray-700";

  if (selected) {
    return (
      <MobileLayout phoneFrame={false} className="bg-blue-50/30 min-h-screen">
        <div className="max-w-4xl mx-auto w-full pb-24">
          <div className="p-6 pt-12 lg:p-12 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-mono text-muted-foreground">{selected.caseNumber || `#${selected.id}`}</span>
                <Badge variant="outline" className={`text-[10px] ${statusColor(selected.status || "")}`}>
                  {selected.status}
                </Badge>
              </div>
              <h2 className="font-display font-bold text-lg">{selected.title}</h2>
              <p className="text-sm text-muted-foreground capitalize">{selected.type?.replace(/_/g," ")}</p>
            </div>
          </div>

          <div className="flex gap-1 px-6 lg:px-12 mb-4">
            {(["details","chat"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors capitalize ${tab === t ? "bg-blue-600 text-white" : "bg-white text-muted-foreground"}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="px-6 lg:px-12">
            {tab === "details" && (
              <div>
                <div className="bg-white rounded-2xl border border-blue-100 p-4 mb-4">
                  <p className="text-sm leading-relaxed text-foreground">{selected.description}</p>
                  {selected.location && <p className="text-xs text-muted-foreground mt-2">📍 {selected.location}</p>}
                </div>

                <div className="bg-white rounded-2xl border border-blue-100 p-4 mb-4">
                  <h4 className="font-semibold text-sm text-blue-900 mb-3 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Update Status
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {STATUSES.map(s => (
                      <button key={s.value} onClick={() => setNewStatus(s.value)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                          newStatus === s.value ? "border-blue-500 bg-blue-50" : "border-neutral-200 bg-white hover:bg-blue-50"
                        }`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Officer notes (optional)…"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
                  />
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!newStatus || updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ id: selected.id, status: newStatus, officerNotes: notes })}
                    data-testid="button-update-status"
                  >
                    Update Case Status
                  </Button>
                </div>

                {timeline.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-blue-900">Timeline</h4>
                    {timeline.map((t, i) => (
                      <div key={i} className="bg-white rounded-xl border border-blue-100 p-3">
                        <p className="text-sm font-medium">{t.action}</p>
                        {t.notes && <p className="text-xs text-muted-foreground">{t.notes}</p>}
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {t.actorName} · {t.createdAt ? format(new Date(t.createdAt), "MMM d, h:mm a") : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "chat" && (
              <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden">
                <div className="p-3 bg-blue-50 border-b border-blue-100">
                  <p className="text-xs font-medium text-blue-800 flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" /> Secure channel with citizen
                  </p>
                </div>
                <div className="h-72 overflow-y-auto p-4 flex flex-col gap-3">
                  {messages.length === 0
                    ? <p className="text-sm text-muted-foreground text-center mt-8">No messages yet.</p>
                    : messages.map(m => (
                      <div key={m.id} className={`flex flex-col ${m.senderRole !== "citizen" ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                          m.senderRole !== "citizen" ? "bg-blue-600 text-white rounded-br-md" : "bg-neutral-100 text-foreground rounded-bl-md"
                        }`}>
                          {m.content}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {m.senderName} · {m.createdAt ? format(new Date(m.createdAt), "h:mm a") : ""}
                        </span>
                      </div>
                    ))}
                </div>
                <div className="p-3 border-t flex gap-2">
                  <input
                    value={msg} onChange={e => setMsg(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && msg.trim() && sendMsg.mutate(msg)}
                    placeholder="Message citizen…"
                    className="flex-1 text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button size="icon" className="bg-blue-600 hover:bg-blue-700 shrink-0"
                    onClick={() => msg.trim() && sendMsg.mutate(msg)} disabled={!msg.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout phoneFrame={false} className="bg-blue-50/30 min-h-screen">
      <div className="max-w-4xl mx-auto w-full p-6 pt-12 pb-24 lg:p-12">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/police/dashboard/" + user?.role)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-blue-900">Case Management</h1>
            <p className="text-sm text-muted-foreground">All incoming crime reports</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-blue-100" />)}
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-semibold text-blue-900">No cases yet</p>
            <p className="text-sm text-muted-foreground">New reports from citizens appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay: i*0.04 }}
                className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => { setSelected(c); setNewStatus(c.status || "submitted"); }}
                data-testid={`case-row-${c.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-muted-foreground">{c.caseNumber || `#${c.id}`}</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusColor(c.status || "")}`}>
                      {c.status}
                    </Badge>
                  </div>
                  <p className="font-semibold text-sm text-blue-900 truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {c.type?.replace(/_/g," ")} · {c.location || "Unknown"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : ""}
                  </p>
                  <ChevronRight className="w-4 h-4 text-blue-300 mt-1 ml-auto" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
