import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, FileText, MessageCircle, Send, ShieldCheck, ShieldX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import type { Report, Evidence, Message, TimelineEntry } from "@shared/schema";

const statusDot: Record<string, string> = {
  submitted: "bg-yellow-500", assigned: "bg-blue-500",
  investigating: "bg-orange-500", resolved: "bg-green-500", escalated: "bg-red-500",
};

export default function CitizenCaseDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"details" | "evidence" | "chat">("details");
  const [msg, setMsg] = useState("");
  const qc = useQueryClient();

  const { data: report } = useQuery<Report>({ queryKey: ["/api/reports", id] });
  const { data: evidence = [] } = useQuery<Evidence[]>({ queryKey: [`/api/evidence/${id}`] });
  const { data: timeline = [] } = useQuery<TimelineEntry[]>({ queryKey: [`/api/reports/${id}/timeline`] });
  const { data: messages = [], isLoading: msgsLoading } = useQuery<Message[]>({
    queryKey: [`/api/reports/${id}/messages`],
  });

  const sendMsg = useMutation({
    mutationFn: (content: string) =>
      apiRequest("POST", `/api/reports/${id}/messages`, { content }),
    onSuccess: () => {
      setMsg("");
      qc.invalidateQueries({ queryKey: [`/api/reports/${id}/messages`] });
    },
  });

  if (!report) return null;

  const cfg = statusDot[report.status || "submitted"] || "bg-gray-400";

  return (
    <MobileLayout phoneFrame={false} className="bg-green-50/30 min-h-screen">
      <div className="max-w-4xl mx-auto w-full pb-24">
        {/* Header */}
        <div className="p-6 pt-12 lg:p-12 lg:pt-16 flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/citizen/cases")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${cfg}`} />
              <span className="text-xs font-mono text-muted-foreground">{report.caseNumber || `#${report.id}`}</span>
              <Badge variant="secondary" className="text-[10px] capitalize">{report.status}</Badge>
            </div>
            <h1 className="text-xl font-display font-bold">{report.title}</h1>
            <p className="text-sm text-muted-foreground capitalize">
              {report.type?.replace(/_/g, " ")} · {report.location}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 lg:px-12 mb-4">
          {(["details","evidence","chat"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors capitalize ${
                tab === t ? "bg-green-600 text-white" : "bg-white text-muted-foreground hover:bg-green-50"
              }`}
              data-testid={`tab-${t}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="px-6 lg:px-12">
          <AnimatePresence mode="wait">
            {tab === "details" && (
              <motion.div key="details" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                <div className="bg-white rounded-2xl border border-green-100 p-4 mb-4">
                  <h3 className="font-semibold text-sm mb-2 text-green-800">Description</h3>
                  <p className="text-sm text-foreground leading-relaxed">{report.description}</p>
                </div>

                <h3 className="font-semibold text-sm mb-3 text-green-800 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Case Timeline
                </h3>
                {timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No updates yet.</p>
                ) : (
                  <div className="relative">
                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-green-100" />
                    <div className="space-y-4">
                      {timeline.map((entry, i) => (
                        <div key={i} className="pl-7 relative">
                          <div className="absolute left-0 w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                          <div className="bg-white rounded-xl border border-green-100 p-3">
                            <p className="font-semibold text-sm">{entry.action}</p>
                            {entry.notes && <p className="text-xs text-muted-foreground mt-0.5">{entry.notes}</p>}
                            <p className="text-[11px] text-muted-foreground mt-1">
                              {entry.actorName} · {entry.createdAt ? format(new Date(entry.createdAt), "MMM d, h:mm a") : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {tab === "evidence" && (
              <motion.div key="evidence" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                {evidence.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-green-200" />
                    <p className="text-sm text-muted-foreground">No evidence uploaded for this case.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {evidence.map(ev => (
                      <div key={ev.id} className="bg-white rounded-2xl border border-green-100 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">{ev.fileName || `Evidence #${ev.id}`}</span>
                          </div>
                          {ev.verificationStatus === "verified" ? (
                            <div className="flex items-center gap-1 text-xs text-green-700 font-semibold bg-green-100 px-2 py-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3" /> VERIFIED
                            </div>
                          ) : ev.verificationStatus === "tampered" ? (
                            <div className="flex items-center gap-1 text-xs text-red-700 font-semibold bg-red-100 px-2 py-0.5 rounded-full">
                              <ShieldX className="w-3 h-3" /> TAMPERED
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground bg-neutral-100 px-2 py-0.5 rounded-full capitalize">
                              {ev.verificationStatus}
                            </div>
                          )}
                        </div>
                        {ev.sha256Hash && (
                          <p className="text-[10px] font-mono text-muted-foreground break-all bg-neutral-50 p-2 rounded-lg">
                            SHA-256: {ev.sha256Hash.slice(0,32)}…
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 capitalize">{ev.fileType}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === "chat" && (
              <motion.div key="chat" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
                  <div className="p-3 border-b border-green-100 bg-green-50">
                    <p className="text-xs font-medium text-green-800 flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" /> Secure channel with assigned officer
                    </p>
                  </div>
                  <div className="h-72 overflow-y-auto p-4 flex flex-col gap-3">
                    {msgsLoading ? <p className="text-sm text-muted-foreground">Loading…</p> :
                     messages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center mt-8">
                        No messages yet. Send a message to the officer.
                      </p>
                    ) : messages.map(m => (
                      <div key={m.id} className={`flex flex-col ${m.senderRole === "citizen" ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                          m.senderRole === "citizen"
                            ? "bg-green-600 text-white rounded-br-md"
                            : "bg-neutral-100 text-foreground rounded-bl-md"
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
                      value={msg}
                      onChange={e => setMsg(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && msg.trim() && sendMsg.mutate(msg)}
                      placeholder="Type a message…"
                      className="flex-1 text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                      data-testid="input-case-message"
                    />
                    <Button
                      size="icon"
                      className="bg-green-600 hover:bg-green-700 shrink-0"
                      onClick={() => msg.trim() && sendMsg.mutate(msg)}
                      disabled={!msg.trim() || sendMsg.isPending}
                      data-testid="button-send-message"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MobileLayout>
  );
}
