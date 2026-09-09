import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Cloud, Loader2 } from "lucide-react";
import logoAsset from "@/assets/logo-localway.png.asset.json";
import { Button } from "@/components/ui/button";
import { FieldGrid, FieldRenderer } from "@/components/onboarding/fields";
import { lookupCep } from "@/lib/masks";
import { supabase } from "@/integrations/supabase/client";
import {
  addressFields,
  companyFields,
  contactFields,
  missingRequired,
  serviceById,
  serviceDefs,
  visibleFields,
  type FieldDef,
  type Values,
} from "@/lib/onboarding-schema";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Onboarding Localway | Comece seu projeto" },
      { name: "description", content: "Preencha o onboarding do seu projeto de forma simples e segura." },
      { property: "og:title", content: "Onboarding Localway" },
      { property: "og:description", content: "Todas as informações do seu projeto em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STORAGE_KEY = "localway-onboarding-v2";

type FormData = {
  company: Values;
  address: Values;
  contact: Values;
  selected: string[];
  services: Record<string, Values>;
};

const initialData: FormData = { company: {}, address: {}, contact: {}, selected: [], services: {} };

type Step =
  | { kind: "company" }
  | { kind: "address" }
  | { kind: "contact" }
  | { kind: "services" }
  | { kind: "service"; id: string }
  | { kind: "review" };

function Index() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [data, setData] = useState<FormData>(initialData);
  const [saved, setSaved] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [invalidIds, setInvalidIds] = useState<string[]>([]);
  const [cepLoading, setCepLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const lastCep = useRef("");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { data?: FormData; index?: number; started?: boolean };
      if (parsed.data) setData({ ...initialData, ...parsed.data });
      if (typeof parsed.index === "number") setIndex(parsed.index);
      if (parsed.started) setStarted(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!started) return;
    const t = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, index, started }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    }, 500);
    return () => window.clearTimeout(t);
  }, [data, index, started]);

  const steps = useMemo<Step[]>(() => {
    const ordered = serviceDefs.filter((s) => data.selected.includes(s.id)).map((s) => ({ kind: "service" as const, id: s.id }));
    return [{ kind: "company" }, { kind: "address" }, { kind: "contact" }, { kind: "services" }, ...ordered, { kind: "review" }];
  }, [data.selected]);

  const step = steps[Math.min(index, steps.length - 1)] ?? { kind: "review" };
  const total = steps.length;
  const progress = Math.round(((index + 1) / total) * 100);

  const setSection = (section: "company" | "address" | "contact", id: string, value: unknown) =>
    setData((d) => ({ ...d, [section]: { ...d[section], [id]: value } }));

  const setService = (serviceId: string, id: string, value: unknown) =>
    setData((d) => ({ ...d, services: { ...d.services, [serviceId]: { ...(d.services[serviceId] ?? {}), [id]: value } } }));

  const currentFields = (): { fields: FieldDef[]; values: Values } => {
    if (step.kind === "company") return { fields: companyFields, values: data.company };
    if (step.kind === "address") return { fields: addressFields, values: data.address };
    if (step.kind === "contact") return { fields: contactFields, values: data.contact };
    if (step.kind === "service") return { fields: serviceById(step.id)?.fields ?? [], values: data.services[step.id] ?? {} };
    return { fields: [], values: {} };
  };

  const goNext = useCallback(() => {
    if (step.kind === "services") {
      if (!data.selected.length) return;
      setIndex((i) => Math.min(i + 1, total - 1));
      return;
    }
    const { fields, values } = currentFields();
    const missing = missingRequired(fields, values);
    if (missing.length) {
      setInvalidIds(missing.map((f) => f.id));
      formRef.current?.querySelector<HTMLElement>(`[data-field="${missing[0]!.id}"] input, [data-field="${missing[0]!.id}"] textarea`)?.focus();
      return;
    }
    setInvalidIds([]);
    setIndex((i) => Math.min(i + 1, total - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, data, total]);

  const goBack = () => {
    setInvalidIds([]);
    if (index === 0) {
      setStarted(false);
      return;
    }
    setIndex((i) => Math.max(i - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter") return;
    const target = e.target as HTMLElement;
    if (target.tagName === "TEXTAREA" || target.tagName === "BUTTON" || target.tagName === "A") return;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.dataset["repeatable"] === "true") return;
    e.preventDefault();
    const inputs = Array.from(formRef.current?.querySelectorAll<HTMLElement>("input, textarea") ?? []).filter(
      (el) => !(el as HTMLInputElement).disabled && el.offsetParent !== null,
    );
    const pos = inputs.indexOf(target);
    const next = inputs[pos + 1];
    if (next) next.focus();
    else goNext();
  };

  const handleCep = async (value: string) => {
    setSection("address", "cep", value);
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 8 || lastCep.current === digits) return;
    lastCep.current = digits;
    setCepLoading(true);
    const found = await lookupCep(digits);
    setCepLoading(false);
    if (!found) return;
    setData((d) => ({
      ...d,
      address: {
        ...d.address,
        cep: value,
        street: found.street || (d.address["street"] as string) || "",
        district: found.district || (d.address["district"] as string) || "",
        city: found.city || (d.address["city"] as string) || "",
        state: found.state || (d.address["state"] as string) || "",
      },
    }));
  };

  const submit = async () => {
    setSending(true);
    setErrorMsg("");
    const { error } = await supabase.from("onboarding_submissions").insert({
      company_name: String(data.company["trade_name"] ?? ""),
      company_data: data.company as never,
      address_data: data.address as never,
      contact_data: data.contact as never,
      selected_services: data.selected,
      service_data: data.services as never,
    });
    setSending(false);
    if (error) {
      setErrorMsg("Não foi possível enviar agora. Tente novamente em instantes.");
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    setSent(true);
  };

  if (sent) return <Success logo={logoAsset.url} />;

  if (!started)
    return (
      <main className="relative min-h-screen overflow-hidden bg-background">
        <Decor />
        <header className="relative z-10 flex h-20 items-center px-5 md:px-10">
          <img src={logoAsset.url} alt="Localway" className="h-8 w-auto object-contain grayscale contrast-200" />
        </header>
        <section className="relative z-10 mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center px-5">
          <div className="mb-8 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-blue" />
            <span className="h-2 w-2 rounded-full bg-brand-red" />
            <span className="h-2 w-2 rounded-full bg-brand-yellow" />
            <span className="h-2 w-2 rounded-full bg-brand-green" />
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.12] md:text-6xl">Vamos começar o seu onboarding</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            Precisamos de algumas informações para conhecer melhor a sua empresa e iniciar o serviço contratado com a Localway.
          </p>
          <div className="mt-9">
            <Button onClick={() => setStarted(true)} className="w-full sm:w-auto">
              Começar o onboarding
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
    );

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <Decor />
      <header className="relative z-10 flex h-20 items-center justify-between border-b border-border/70 px-5 md:px-10">
        <img src={logoAsset.url} alt="Localway" className="h-8 w-auto object-contain grayscale contrast-200" />
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Cloud className="h-4 w-4" />
          <span>{saved ? "Progresso salvo" : "Salvamento automático"}</span>
        </div>
      </header>

      <div className="relative z-10 border-b border-border/70 bg-background/80 px-5 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-4xl items-center gap-5">
          <span className="shrink-0 text-xs font-semibold">Etapa {index + 1} de {total}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-brand-blue transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{progress}%</span>
        </div>
      </div>

      <form
        ref={formRef}
        onSubmit={(e) => e.preventDefault()}
        onKeyDown={handleKeyDown}
        className="relative z-10 mx-auto max-w-4xl px-5 py-12 md:py-16"
      >
        {step.kind === "company" && (
          <Section eyebrow="Dados da empresa" title="Conte sobre a sua empresa" description="Estas informações são preenchidas uma única vez e reaproveitadas em todos os serviços.">
            <FieldGrid fields={companyFields} values={data.company} invalidIds={invalidIds} onChange={(id, v) => setSection("company", id, v)} />
          </Section>
        )}

        {step.kind === "address" && (
          <Section eyebrow="Endereço" title="Onde a empresa está localizada?" description="Informe o CEP e o restante do endereço é preenchido automaticamente.">
            <div className="grid gap-5 md:grid-cols-2">
              {addressFields.map((f) => (
                <div key={f.id} data-field={f.id} className={f.id === "cep" ? "relative" : undefined}>
                  <FieldGridSingle
                    field={f}
                    value={data.address[f.id]}
                    invalid={invalidIds.includes(f.id)}
                    onChange={(v) => (f.id === "cep" ? void handleCep(String(v)) : setSection("address", f.id, v))}
                  />
                  {f.id === "cep" && cepLoading && (
                    <span className="absolute right-3 top-11 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {step.kind === "contact" && (
          <Section eyebrow="Contato" title="Quem será o nosso contato durante o projeto?" description="Informe a pessoa que acompanhará o projeto junto com a Localway.">
            <FieldGrid fields={contactFields} values={data.contact} invalidIds={invalidIds} onChange={(id, v) => setSection("contact", id, v)} />
          </Section>
        )}

        {step.kind === "services" && (
          <Section eyebrow="Serviços contratados" title="Quais serviços fazem parte do seu projeto?" description="Selecione todos os serviços contratados. As próximas etapas serão montadas apenas com o que você escolher.">
            <div className="grid gap-3 sm:grid-cols-2">
              {serviceDefs.map((s) => {
                const active = data.selected.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      setData((d) => ({
                        ...d,
                        selected: d.selected.includes(s.id) ? d.selected.filter((x) => x !== s.id) : [...d.selected, s.id],
                      }))
                    }
                    className={`flex min-h-24 items-center gap-4 rounded-md border p-5 text-left transition ${active ? "border-foreground bg-foreground text-background shadow-soft" : "border-border bg-background hover:border-muted-foreground"}`}
                  >
                    <span className={`h-3 w-3 shrink-0 rounded-full bg-brand-${s.color}`} />
                    <span className="flex-1">
                      <strong className="block text-sm">{s.name}</strong>
                      <span className={`mt-1 block text-xs ${active ? "text-background/70" : "text-muted-foreground"}`}>{s.description}</span>
                    </span>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${active ? "border-background/30 bg-background text-foreground" : "border-border"}`}>
                      {active && <Check className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {step.kind === "service" && (
          <ServiceStep
            id={step.id}
            values={data.services[step.id] ?? {}}
            invalidIds={invalidIds}
            onChange={(fieldId, v) => setService(step.id, fieldId, v)}
          />
        )}

        {step.kind === "review" && (
          <Review data={data} onEdit={(target) => setIndex(target)} steps={steps} error={errorMsg} />
        )}

        <nav className="mt-12 flex items-center justify-between border-t border-border pt-6">
          <Button type="button" variant="ghost" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          {step.kind === "review" ? (
            <Button type="button" onClick={() => void submit()} disabled={sending}>
              {sending ? "Enviando..." : "Enviar onboarding"}
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
          ) : (
            <Button type="button" onClick={goNext} disabled={step.kind === "services" && !data.selected.length}>
              Continuar
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </nav>
      </form>
    </main>
  );
}

function FieldGridSingle({ field, value, onChange, invalid }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void; invalid: boolean }) {
  return <FieldRenderer field={field} value={value} onChange={onChange} invalid={invalid} />;
}

function ServiceStep({ id, values, onChange, invalidIds }: { id: string; values: Values; onChange: (fieldId: string, v: unknown) => void; invalidIds: string[] }) {
  const service = serviceById(id);
  if (!service) return null;
  const fields = visibleFields(service.fields, values);
  return (
    <Section eyebrow="Briefing do serviço" title={service.name} description="Os dados gerais da empresa já foram reaproveitados. Responda apenas o que é específico deste serviço.">
      <div className="grid gap-5 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.id} data-field={f.id} className={f.wide || ["hours", "offerings", "files", "list"].includes(f.type ?? "") ? "md:col-span-2" : ""}>
            <FieldGridSingle field={{ ...f, wide: false }} value={values[f.id]} invalid={invalidIds.includes(f.id)} onChange={(v) => onChange(f.id, v)} />
          </div>
        ))}
      </div>
    </Section>
  );
}

function Section({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section>
      <header className="mb-9">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand-blue">{eyebrow}</p>
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </header>
      {children}
    </section>
  );
}

function summarize(values: Values) {
  const filled = Object.values(values).filter((v) => (Array.isArray(v) ? v.length : typeof v === "object" && v ? Object.keys(v).length : String(v ?? "").trim())).length;
  return `${filled} respostas preenchidas`;
}

function Review({ data, onEdit, steps, error }: { data: FormData; onEdit: (n: number) => void; steps: Step[]; error: string }) {
  const indexOf = (predicate: (s: Step) => boolean) => steps.findIndex(predicate);
  return (
    <section>
      <header className="mb-9">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand-blue">Revisão final</p>
        <h1 className="text-3xl font-bold md:text-4xl">Confira suas informações</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Revise tudo antes do envio. Você pode voltar e editar qualquer bloco.</p>
      </header>
      <div className="divide-y divide-border border-y border-border">
        <Row title="Dados da empresa" detail={String(data.company["trade_name"] ?? "") || summarize(data.company)} onClick={() => onEdit(indexOf((s) => s.kind === "company"))} />
        <Row title="Endereço" detail={[data.address["street"], data.address["number"], data.address["city"]].filter(Boolean).join(", ") || "Não informado"} onClick={() => onEdit(indexOf((s) => s.kind === "address"))} />
        <Row title="Contato" detail={String(data.contact["name"] ?? "") || "Não informado"} onClick={() => onEdit(indexOf((s) => s.kind === "contact"))} />
        <Row title="Serviços contratados" detail={data.selected.map((id) => serviceById(id)?.name).filter(Boolean).join(", ") || "Nenhum"} onClick={() => onEdit(indexOf((s) => s.kind === "services"))} />
        {data.selected.map((id) => (
          <Row
            key={id}
            title={serviceById(id)?.name ?? id}
            detail={summarize(data.services[id] ?? {})}
            onClick={() => onEdit(indexOf((s) => s.kind === "service" && s.id === id))}
          />
        ))}
      </div>
      {error && <p className="mt-6 text-sm font-medium text-brand-red">{error}</p>}
    </section>
  );
}

function Row({ title, detail, onClick }: { title: string; detail: string; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-5">
      <div>
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{detail || "Não informado"}</p>
      </div>
      <Button type="button" variant="ghost" onClick={onClick}>
        Editar
      </Button>
    </div>
  );
}

function Decor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <i className="animate-drift absolute left-[6%] top-40 h-3 w-3 rounded-full bg-brand-blue opacity-70" />
      <i className="animate-drift absolute right-[8%] top-28 h-2.5 w-2.5 rounded-full bg-brand-red opacity-70 [animation-delay:1s]" />
      <i className="animate-drift absolute bottom-24 left-[10%] h-2 w-2 rounded-full bg-brand-green opacity-60 [animation-delay:2s]" />
      <i className="absolute bottom-20 right-[7%] h-3 w-3 rounded-full bg-brand-yellow opacity-70" />
      <i className="animate-draw absolute right-0 top-[43%] h-px w-24 bg-brand-green" />
      <i className="animate-draw absolute left-0 top-[67%] h-px w-16 bg-brand-red [animation-delay:2s]" />
    </div>
  );
}

function Success({ logo }: { logo: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <section className="max-w-xl text-center">
        <img src={logo} alt="Localway" className="mx-auto mb-12 h-8 w-auto grayscale contrast-200" />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-7 text-3xl font-bold md:text-4xl">Onboarding enviado com sucesso!</h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          Recebemos as informações necessárias para iniciar o seu projeto. A equipe da Localway vai analisar tudo e seguir para a próxima etapa.
        </p>
      </section>
    </main>
  );
}
