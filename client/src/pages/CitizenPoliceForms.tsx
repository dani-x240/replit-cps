import { useState } from "react";
import { useLocation } from "wouter";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, ChevronRight, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const FORMS = [
  {
    id: "pf3",
    code: "PF3",
    title: "Medical Examination Form",
    subtitle: "For injured persons seeking police assistance",
    fields: [
      { id: "fullName",     label: "Full Name",          type: "text",   required: true },
      { id: "age",          label: "Age",                type: "number", required: true },
      { id: "address",      label: "Home Address",       type: "text",   required: true },
      { id: "injuryDate",   label: "Date of Injury",     type: "date",   required: true },
      { id: "injuryDesc",   label: "Description of Injuries", type: "textarea", required: true },
      { id: "hospitalName", label: "Hospital / Clinic",  type: "text",   required: false },
      { id: "doctorName",   label: "Doctor's Name",      type: "text",   required: false },
    ],
  },
  {
    id: "pf18",
    code: "PF18",
    title: "Lost Property Report",
    subtitle: "Report lost or stolen property to police",
    fields: [
      { id: "fullName",    label: "Full Name",          type: "text",     required: true },
      { id: "phone",       label: "Phone Number",       type: "tel",      required: true },
      { id: "address",     label: "Home Address",       type: "text",     required: true },
      { id: "lostDate",    label: "Date Lost",          type: "date",     required: true },
      { id: "lostPlace",   label: "Where Was It Lost",  type: "text",     required: true },
      { id: "items",       label: "Items Lost (describe each)", type: "textarea", required: true },
      { id: "estimatedValue", label: "Estimated Value (UGX)", type: "number", required: false },
    ],
  },
  {
    id: "gc",
    code: "GC",
    title: "Good Conduct Certificate",
    subtitle: "Request a certificate of good conduct",
    fields: [
      { id: "fullName",  label: "Full Name",       type: "text", required: true },
      { id: "nin",       label: "NIN Number",      type: "text", required: true },
      { id: "dob",       label: "Date of Birth",   type: "date", required: true },
      { id: "address",   label: "Current Address", type: "text", required: true },
      { id: "purpose",   label: "Purpose / Reason",type: "textarea", required: true },
    ],
  },
];

export default function CitizenPoliceForms() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selected, setSelected] = useState<typeof FORMS[0] | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function prefill(form: typeof FORMS[0]) {
    const defaults: Record<string, string> = {};
    if (user) {
      defaults.fullName = user.fullName || "";
      defaults.phone = user.phone || "";
      defaults.nin = user.nin || "";
    }
    setValues(defaults);
    setSelected(form);
    setSubmitted(false);
  }

  function handleSubmit() {
    if (!selected) return;
    const missing = selected.fields.filter(f => f.required && !values[f.id]?.trim());
    if (missing.length > 0) {
      toast({ title: "Missing fields", description: `Please fill: ${missing.map(f=>f.label).join(", ")}`, variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Form submitted", description: `${selected.code} sent to nearest police station.` });
  }

  return (
    <MobileLayout phoneFrame={false} className="bg-green-50/30 min-h-screen">
      <div className="max-w-3xl mx-auto w-full p-6 pt-12 pb-24 lg:p-12">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost" size="icon"
            onClick={() => selected ? setSelected(null) : setLocation("/citizen/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">Police Forms</h1>
            <p className="text-sm text-muted-foreground">
              {selected ? selected.title : "Fill and submit Uganda Police forms digitally"}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div key="list" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <div className="space-y-3">
                {FORMS.map(form => (
                  <button
                    key={form.id}
                    onClick={() => prefill(form)}
                    className="w-full bg-white rounded-2xl border border-green-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow text-left"
                    data-testid={`form-card-${form.id}`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{form.code} – {form.title}</p>
                      <p className="text-xs text-muted-foreground">{form.subtitle}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : submitted ? (
            <motion.div key="done" initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }} className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Form Submitted</h2>
              <p className="text-sm text-muted-foreground mb-1">
                Your <strong>{selected.code}</strong> has been sent to the nearest police station.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Ref: {selected.code}-{Date.now().toString().slice(-6)}
              </p>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setSelected(null)}>
                Submit Another Form
              </Button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-20 }}>
              <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5 mb-4">
                <div className="space-y-4">
                  {selected.fields.map(field => (
                    <div key={field.id}>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          rows={3}
                          value={values[field.id] || ""}
                          onChange={e => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                          className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 resize-none"
                          data-testid={`input-${field.id}`}
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={values[field.id] || ""}
                          onChange={e => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                          className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                          data-testid={`input-${field.id}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleSubmit} data-testid="button-submit-form">
                  Submit Form
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileLayout>
  );
}
