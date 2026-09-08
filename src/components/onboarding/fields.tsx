import { useState } from "react";
import { ExternalLink, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyMask } from "@/lib/masks";
import {
  TRANSFERNOW_URL,
  WEEK_DAYS,
  type DayHours,
  type FieldDef,
  type Offering,
  type Values,
} from "@/lib/onboarding-schema";

const base =
  "mt-2 w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-foreground focus:ring-2 focus:ring-ring/20";

export function FieldRenderer({
  field,
  value,
  onChange,
  invalid,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  invalid?: boolean;
}) {
  const type = field.type ?? "text";
  const label = (
    <span className="text-sm font-semibold">
      {field.label}
      {field.required && <span className="ml-1 text-brand-red">*</span>}
    </span>
  );
  const hint = field.hint && <span className="mt-1 block text-xs text-muted-foreground">{field.hint}</span>;
  const cls = `${base} ${invalid ? "border-brand-red" : ""}`;
  const wrap = field.wide ? "md:col-span-2" : "";

  if (type === "textarea")
    return (
      <label className={wrap}>
        {label}
        {hint}
        <textarea
          data-multiline="true"
          className={`${cls} min-h-28 resize-y`}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite sua resposta"
        />
      </label>
    );

  if (type === "radio")
    return (
      <fieldset className={wrap}>
        {label}
        {hint}
        <div className="mt-3 flex flex-wrap gap-2">
          {(field.options ?? []).map((o) => {
            const active = value === o;
            return (
              <button
                key={o}
                type="button"
                onClick={() => onChange(o)}
                className={`rounded-full border px-4 py-2 text-sm transition ${active ? "border-foreground bg-foreground text-background" : "border-border hover:border-muted-foreground"}`}
              >
                {o}
              </button>
            );
          })}
        </div>
      </fieldset>
    );

  if (type === "chips") {
    const list = Array.isArray(value) ? (value as string[]) : [];
    return (
      <fieldset className={wrap}>
        {label}
        {hint}
        <div className="mt-3 flex flex-wrap gap-2">
          {(field.options ?? []).map((o) => {
            const active = list.includes(o);
            return (
              <button
                key={o}
                type="button"
                onClick={() => onChange(active ? list.filter((x) => x !== o) : [...list, o])}
                className={`rounded-full border px-4 py-2 text-sm transition ${active ? "border-foreground bg-foreground text-background" : "border-border hover:border-muted-foreground"}`}
              >
                {o}
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (type === "list") return <ListField field={field} value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />;
  if (type === "offerings")
    return <OfferingsField field={field} value={Array.isArray(value) ? (value as Offering[]) : []} onChange={onChange} />;
  if (type === "hours")
    return <HoursField field={field} value={(value as Record<string, DayHours>) ?? {}} onChange={onChange} />;
  if (type === "files") return <FilesField field={field} value={String(value ?? "")} onChange={onChange} />;

  const inputType = ["email", "url", "date"].includes(type) ? type : "text";
  return (
    <label className={wrap}>
      {label}
      {hint}
      <input
        className={cls}
        type={inputType}
        inputMode={["tel", "cnpj", "cpf", "cep"].includes(type) ? "numeric" : undefined}
        value={String(value ?? "")}
        onChange={(e) => onChange(applyMask(type, e.target.value))}
        placeholder={type === "cnpj" ? "12.345.678/0001-95" : type === "cpf" ? "123.456.789-00" : type === "cep" ? "12345-678" : type === "tel" ? "(85) 99999-9999" : "Digite aqui"}
      />
    </label>
  );
}

function ListField({ field, value, onChange }: { field: FieldDef; value: string[]; onChange: (v: unknown) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    onChange([...value, t]);
    setDraft("");
  };
  return (
    <div className={field.wide ? "md:col-span-2" : ""}>
      <span className="text-sm font-semibold">
        {field.label}
        {field.required && <span className="ml-1 text-brand-red">*</span>}
      </span>
      <div className="mt-2 flex gap-2">
        <input
          className={base + " mt-0"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              add();
            }
          }}
          placeholder="Digite e pressione Enter para adicionar"
        />
        <Button type="button" variant="outline" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {value.map((item, i) => (
            <li key={`${item}-${i}`} className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs">
              {item}
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label={`Remover ${item}`}>
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OfferingsField({ field, value, onChange }: { field: FieldDef; value: Offering[]; onChange: (v: unknown) => void }) {
  const update = (i: number, patch: Partial<Offering>) =>
    onChange(value.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  return (
    <div className="md:col-span-2">
      <span className="text-sm font-semibold">{field.label}</span>
      <div className="mt-3 space-y-3">
        {value.map((item, i) => (
          <div key={i} className="rounded-md border border-border p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <input className={base + " mt-0"} placeholder="Nome" value={item.name} onChange={(e) => update(i, { name: e.target.value })} />
              <input className={base + " mt-0"} placeholder="Descrição" value={item.description} onChange={(e) => update(i, { description: e.target.value })} />
              <input className={base + " mt-0"} placeholder="Preço (opcional)" value={item.price} onChange={(e) => update(i, { price: e.target.value })} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-medium">
                <input type="checkbox" checked={item.priority} onChange={(e) => update(i, { priority: e.target.checked })} />
                Serviço prioritário
              </label>
              <Button type="button" variant="ghost" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>
                Remover
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        className="mt-3"
        onClick={() => onChange([...value, { name: "", description: "", price: "", priority: false }])}
      >
        <Plus className="h-4 w-4" />
        Adicionar item
      </Button>
    </div>
  );
}

function HoursField({ field, value, onChange }: { field: FieldDef; value: Record<string, DayHours>; onChange: (v: unknown) => void }) {
  const set = (day: string, patch: Partial<DayHours>) =>
    onChange({ ...value, [day]: { mode: "closed", ...(value[day] ?? {}), ...patch } });
  return (
    <div className="md:col-span-2">
      <span className="text-sm font-semibold">{field.label}</span>
      <div className="mt-3 divide-y divide-border rounded-md border border-border">
        {WEEK_DAYS.map((day) => {
          const d = value[day] ?? { mode: "closed" as const };
          return (
            <div key={day} className="flex flex-wrap items-center gap-3 p-4">
              <strong className="w-12 text-xs">{day}</strong>
              <div className="flex gap-2">
                {(["closed", "open", "24h"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set(day, { mode: m })}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${d.mode === m ? "border-foreground bg-foreground text-background" : "border-border"}`}
                  >
                    {m === "closed" ? "Fechado" : m === "open" ? "Aberto" : "24 horas"}
                  </button>
                ))}
              </div>
              {d.mode === "open" && (
                <div className="flex flex-wrap items-center gap-2">
                  <input type="time" className={base + " mt-0 w-32"} value={d.from ?? ""} onChange={(e) => set(day, { from: e.target.value })} />
                  <span className="text-xs text-muted-foreground">até</span>
                  <input type="time" className={base + " mt-0 w-32"} value={d.to ?? ""} onChange={(e) => set(day, { to: e.target.value })} />
                  {d.second ? (
                    <>
                      <input type="time" className={base + " mt-0 w-32"} value={d.from2 ?? ""} onChange={(e) => set(day, { from2: e.target.value })} />
                      <span className="text-xs text-muted-foreground">até</span>
                      <input type="time" className={base + " mt-0 w-32"} value={d.to2 ?? ""} onChange={(e) => set(day, { to2: e.target.value })} />
                      <Button type="button" variant="ghost" onClick={() => set(day, { second: false, from2: "", to2: "" })}>
                        Remover intervalo
                      </Button>
                    </>
                  ) : (
                    <Button type="button" variant="ghost" onClick={() => set(day, { second: true })}>
                      + intervalo
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilesField({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: unknown) => void }) {
  return (
    <div className="md:col-span-2 rounded-md border border-dashed border-border bg-muted/40 p-5">
      <span className="text-sm font-semibold">{field.label}</span>
      <p className="mt-1 text-xs text-muted-foreground">
        Envie fotos, logos e materiais pelo TransferNow ou cole o link de uma pasta externa.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a href={TRANSFERNOW_URL} target="_blank" rel="noopener noreferrer">
          <Button type="button" variant="outline">
            Enviar arquivos pelo TransferNow
            <ExternalLink className="h-4 w-4" />
          </Button>
        </a>
      </div>
      <input
        className={base}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Link da pasta (Google Drive, Dropbox, WeTransfer...)"
      />
    </div>
  );
}

export function FieldGrid({
  fields,
  values,
  onChange,
  invalidIds,
}: {
  fields: FieldDef[];
  values: Values;
  onChange: (id: string, v: unknown) => void;
  invalidIds: string[];
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {fields.map((f) => (
        <FieldRenderer
          key={f.id}
          field={f}
          value={values[f.id]}
          onChange={(v) => onChange(f.id, v)}
          invalid={invalidIds.includes(f.id)}
        />
      ))}
    </div>
  );
}
