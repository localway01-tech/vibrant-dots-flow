import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Cloud, Upload } from "lucide-react";
import logoAsset from "@/assets/logo-localway.png.asset.json";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Onboarding Localway | Comece seu projeto" },
    { name: "description", content: "Preencha o onboarding do seu projeto de forma simples e segura." },
    { property: "og:title", content: "Onboarding Localway" },
    { property: "og:description", content: "Todas as informações do seu projeto em um só lugar." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: Index,
});

const services = [
  ["google", "Perfil da Empresa no Google", "Presença local e Google Maps", "blue"],
  ["site", "Site Profissional", "Site institucional completo", "red"],
  ["ecommerce", "E-commerce / Loja Virtual", "Venda de produtos online", "yellow"],
  ["mini", "Mini Site", "Presença digital objetiva", "green"],
  ["whatsapp", "WhatsApp Business", "Atendimento e catálogo", "green"],
  ["identity", "Identidade Visual", "Marca e linguagem visual", "blue"],
  ["plate", "Plaquinha Resinada", "Material personalizado", "yellow"],
  ["traffic", "Tráfego Pago", "Campanhas e performance", "red"],
  ["seo", "SEO", "Posicionamento orgânico", "blue"],
  ["automation", "Automações", "Processos mais eficientes", "green"],
] as const;

type FormData = { company: Record<string,string>; contact: Record<string,string>; selected: string[]; briefings: Record<string,Record<string,string>> };
const initialData: FormData = { company: {}, contact: {}, selected: [], briefings: {} };

const briefingFields: Record<string, { label: string; type?: string; options?: string[] }[]> = {
  google: [{label:"A empresa já possui Perfil da Empresa no Google?",options:["Sim","Não","Não sei"]},{label:"Link do perfil no Google Maps",type:"url"},{label:"Categoria principal"},{label:"Principais produtos e serviços",type:"textarea"},{label:"Como sua empresa atende os clientes?",options:["No endereço","No endereço e em outros locais","Em outros locais","Exclusivamente online"]},{label:"Horário de atendimento"},{label:"Objetivo principal",type:"textarea"}],
  site: [{label:"Qual é o objetivo principal do site?",options:["Gerar contatos","Gerar vendas","Apresentar a empresa","Receber agendamentos","Divulgar serviços"]},{label:"Quais páginas deseja?"},{label:"Slogan da empresa"},{label:"Sites de referência",type:"textarea"},{label:"Estilo desejado",type:"textarea"},{label:"Já possui domínio?",options:["Sim","Não"]}],
  ecommerce: [{label:"Nome da loja"},{label:"Quantidade aproximada de produtos"},{label:"Categorias de produtos"},{label:"Como controla o estoque?"},{label:"Formas de pagamento"},{label:"Formas de entrega"},{label:"Integrações necessárias",type:"textarea"}],
  mini: [{label:"Descrição curta",type:"textarea"},{label:"Principais serviços"},{label:"Links principais"},{label:"Chamada principal"},{label:"Cor e estilo desejados"},{label:"Link de referência",type:"url"}],
  whatsapp: [{label:"Número que será utilizado",type:"tel"},{label:"Mensagem de saudação desejada",type:"textarea"},{label:"Principais dúvidas dos clientes",type:"textarea"},{label:"Deseja criar catálogo?",options:["Sim","Não"]},{label:"Como funciona o atendimento atual?",type:"textarea"}],
  identity: [{label:"Nome que deve aparecer na marca"},{label:"Público-alvo"},{label:"Personalidade da marca"},{label:"Cores preferidas"},{label:"Cores que não deseja"},{label:"Marcas que admira"},{label:"Observações adicionais",type:"textarea"}],
  plate: [{label:"Nome que deverá aparecer"},{label:"Telefone ou WhatsApp"},{label:"Link para o QR Code",type:"url"},{label:"Formato e tamanho"},{label:"Quantidade"},{label:"Observações",type:"textarea"}],
  traffic: [{label:"Qual é o objetivo principal?",options:["Mensagens","Leads","Vendas","Agendamentos","Visitas","Reconhecimento"]},{label:"Produto ou serviço que deseja anunciar"},{label:"Público-alvo",type:"textarea"},{label:"Região de atendimento"},{label:"Orçamento mensal"},{label:"Já anunciou anteriormente?",options:["Sim","Não"]},{label:"Observações",type:"textarea"}],
  seo: [{label:"Serviços ou produtos prioritários"},{label:"Cidades ou regiões prioritárias"},{label:"Palavras-chave importantes"},{label:"Principais concorrentes"},{label:"Possui blog?",options:["Sim","Não"]},{label:"Já realizou SEO?",options:["Sim","Não"]}],
  automation: [{label:"O que você gostaria de automatizar?",type:"textarea"},{label:"Qual processo é feito manualmente?",type:"textarea"},{label:"Em qual ferramenta o processo acontece?"},{label:"Qual é o gatilho?"},{label:"O que deve acontecer automaticamente?",type:"textarea"},{label:"Resultado esperado",type:"textarea"}],
};

const companyFields = [["Nome fantasia","text"],["Razão social","text"],["CNPJ","text"],["Segmento da empresa","text"],["Descrição da empresa","textarea"],["Endereço completo","text"],["Cidade","text"],["Estado","text"],["CEP","text"],["WhatsApp principal","tel"],["E-mail principal","email"],["Site atual","url"]];
const contactFields = [["Nome completo","text"],["CPF","text"],["Cargo / função","text"],["Telefone","tel"],["WhatsApp","tel"],["E-mail","email"]];

function Index() {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [data, setData] = useState<FormData>(initialData);
  const [saved, setSaved] = useState(false);

  useEffect(() => { const raw = localStorage.getItem("localway-onboarding"); if (raw) { try { const parsed = JSON.parse(raw); setData(parsed.data ?? initialData); setStep(parsed.step ?? 0); } catch {} } }, []);
  useEffect(() => { if (step === 0) return; const timer = window.setTimeout(() => { localStorage.setItem("localway-onboarding", JSON.stringify({ data, step })); setSaved(true); window.setTimeout(() => setSaved(false), 1800); }, 500); return () => window.clearTimeout(timer); }, [data, step]);

  const flow = useMemo(() => ["company","contact","services",...data.selected,"review"], [data.selected]);
  const current = step === 0 ? "welcome" : flow[step - 1];
  const total = flow.length;
  const progress = step ? Math.round((step / total) * 100) : 0;
  const setGroup = (group: "company"|"contact", key:string, value:string) => setData(d => ({...d,[group]:{...d[group],[key]:value}}));
  const setBrief = (service:string,key:string,value:string) => setData(d => ({...d,briefings:{...d.briefings,[service]:{...d.briefings[service],[key]:value}}}));
  const next = () => setStep(s => Math.min(s + 1, total));
  const previous = () => setStep(s => Math.max(s - 1, 0));

  if (sent) return <Success logo={logoAsset.url} />;
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <Decor />
      <header className="relative z-10 flex h-20 items-center justify-between border-b border-border/70 px-5 md:px-10">
        <img src={logoAsset.url} alt="Localway" className="h-8 w-auto object-contain grayscale contrast-200" />
        {step > 0 && <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><Cloud className="h-4 w-4"/><span>{saved ? "Progresso salvo" : "Salvamento automático"}</span></div>}
      </header>

      {step > 0 && <div className="relative z-10 border-b border-border/70 bg-background/80 px-5 py-4 backdrop-blur md:px-10"><div className="mx-auto flex max-w-4xl items-center gap-5"><span className="shrink-0 text-xs font-semibold text-foreground">Etapa {Math.min(step,total)} de {total}</span><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand-blue transition-all duration-500" style={{width:`${progress}%`}} /></div><span className="text-xs text-muted-foreground">{progress}%</span></div></div>}

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-12 md:py-16">
        {current === "welcome" && <Welcome onStart={() => setStep(1)} />}
        {current === "company" && <Fields title="Conte sobre a sua empresa" eyebrow="Dados gerais" description="Você só precisa preencher estas informações uma vez." fields={companyFields} values={data.company} onChange={(k,v)=>setGroup("company",k,v)} />}
        {current === "contact" && <Fields title="Quem será nosso contato?" eyebrow="Responsável pelo projeto" description="Informe a pessoa que acompanhará o projeto junto com a Localway." fields={contactFields} values={data.contact} onChange={(k,v)=>setGroup("contact",k,v)} />}
        {current === "services" && <ServicePicker selected={data.selected} onToggle={(id)=>setData(d=>({...d,selected:d.selected.includes(id)?d.selected.filter(x=>x!==id):[...d.selected,id]}))} />}
        {briefingFields[current] && <Briefing service={current} values={data.briefings[current] ?? {}} onChange={(k,v)=>setBrief(current,k,v)} />}
        {current === "review" && <Review data={data} onEdit={(target)=>setStep(target)} />}

        {step > 0 && <nav className="mt-12 flex items-center justify-between border-t border-border pt-6"><Button variant="ghost" onClick={previous}><ArrowLeft className="h-4 w-4"/>Voltar</Button>{current === "review" ? <Button onClick={()=>setSent(true)}>Enviar onboarding<Check className="h-4 w-4"/></Button> : <Button onClick={next} disabled={current === "services" && !data.selected.length}>Continuar<ArrowRight className="h-4 w-4"/></Button>}</nav>}
      </div>
    </main>
  );
}

function Decor(){ return <div aria-hidden className="pointer-events-none absolute inset-0"><i className="animate-drift absolute left-[6%] top-40 h-3 w-3 rounded-full bg-brand-blue opacity-70"/><i className="animate-drift absolute right-[8%] top-28 h-2.5 w-2.5 rounded-full bg-brand-red opacity-70 [animation-delay:1s]"/><i className="animate-drift absolute bottom-24 left-[10%] h-2 w-2 rounded-full bg-brand-green opacity-60 [animation-delay:2s]"/><i className="absolute bottom-20 right-[7%] h-3 w-3 rounded-full bg-brand-yellow opacity-70"/><i className="animate-draw absolute right-0 top-[43%] h-px w-24 bg-brand-green"/><i className="animate-draw absolute left-0 top-[67%] h-px w-16 bg-brand-red [animation-delay:2s]"/></div> }

function Welcome({onStart}:{onStart:()=>void}){ return <section className="flex min-h-[65vh] flex-col justify-center py-8"><div className="mb-8 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-blue"/><span className="h-2 w-2 rounded-full bg-brand-red"/><span className="h-2 w-2 rounded-full bg-brand-yellow"/><span className="h-2 w-2 rounded-full bg-brand-green"/></div><p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Bem-vindo à Localway</p><h1 className="max-w-3xl text-4xl font-bold leading-[1.12] tracking-normal md:text-6xl">Vamos começar o seu onboarding.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">Precisamos de algumas informações para conhecer melhor sua empresa e iniciar os serviços contratados com a Localway.</p><div className="mt-9"><Button onClick={onStart} className="w-full sm:w-auto">Começar onboarding<ArrowRight className="h-4 w-4"/></Button></div><p className="mt-6 max-w-xl text-sm leading-6 text-muted-foreground">Primeiro cadastramos sua empresa. Depois, você responde apenas o necessário para cada serviço contratado.</p></section> }

function Fields({title,eyebrow,description,fields,values,onChange}:{title:string;eyebrow:string;description:string;fields:string[][];values:Record<string,string>;onChange:(k:string,v:string)=>void}){ return <section><Heading eyebrow={eyebrow} title={title} description={description}/><div className="grid gap-5 md:grid-cols-2">{fields.map(([label,type],i)=><Field key={label} label={label} type={type} value={values[label]??""} onChange={v=>onChange(label,v)} wide={type==="textarea"||i===4}/>)}</div></section> }

function Field({label,type="text",value,onChange,options,wide}:{label:string;type?:string;value:string;onChange:(v:string)=>void;options?:string[];wide?:boolean}){ const base="mt-2 w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-foreground focus:ring-2 focus:ring-ring/20"; return <label className={wide?"md:col-span-2":""}><span className="text-sm font-semibold">{label}</span>{options?<select className={base} value={value} onChange={e=>onChange(e.target.value)}><option value="">Selecione uma opção</option>{options.map(o=><option key={o}>{o}</option>)}</select>:type==="textarea"?<textarea className={`${base} min-h-28 resize-y`} value={value} onChange={e=>onChange(e.target.value)} placeholder="Digite sua resposta"/>:<input className={base} type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder="Digite aqui"/>}</label> }

function Heading({eyebrow,title,description}:{eyebrow:string;title:string;description:string}){ return <header className="mb-9"><p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand-blue">{eyebrow}</p><h1 className="text-3xl font-bold tracking-normal md:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></header> }

function ServicePicker({selected,onToggle}:{selected:string[];onToggle:(id:string)=>void}){ return <section><Heading eyebrow="Serviços contratados" title="Quais serviços fazem parte do seu projeto?" description="Selecione todos os serviços contratados. O próximo passo será montado especialmente para você."/><div className="grid gap-3 sm:grid-cols-2">{services.map(([id,name,desc,color])=>{const active=selected.includes(id);return <button key={id} type="button" onClick={()=>onToggle(id)} className={`group flex min-h-24 items-center gap-4 rounded-md border p-5 text-left transition ${active?"border-foreground bg-foreground text-background shadow-soft":"border-border bg-background hover:border-muted-foreground"}`}><span className={`h-3 w-3 shrink-0 rounded-full bg-brand-${color}`}/><span className="flex-1"><strong className="block text-sm">{name}</strong><span className={`mt-1 block text-xs ${active?"text-background/70":"text-muted-foreground"}`}>{desc}</span></span><span className={`flex h-6 w-6 items-center justify-center rounded-full border ${active?"border-background/30 bg-background text-foreground":"border-border"}`}>{active&&<Check className="h-3.5 w-3.5"/>}</span></button>})}</div></section> }

function Briefing({service,values,onChange}:{service:string;values:Record<string,string>;onChange:(k:string,v:string)=>void}){ const item=services.find(s=>s[0]===service); return <section><Heading eyebrow="Briefing do serviço" title={item?.[1]??"Seu projeto"} description="As informações gerais já foram reaproveitadas. Conte apenas o que é específico deste serviço."/><div className="grid gap-5 md:grid-cols-2">{briefingFields[service].map((f,i)=><Field key={f.label} label={f.label} type={f.type} options={f.options} value={values[f.label]??""} onChange={v=>onChange(f.label,v)} wide={f.type==="textarea"||i===0}/>)}</div><label className="mt-6 flex cursor-pointer items-center justify-center gap-3 rounded-md border border-dashed border-border bg-muted/40 px-5 py-8 text-sm font-semibold text-muted-foreground transition hover:border-foreground hover:text-foreground"><Upload className="h-5 w-5"/>Anexar arquivos e referências<input type="file" multiple className="sr-only"/></label></section> }

function Review({data,onEdit}:{data:FormData;onEdit:(n:number)=>void}){ const chosen=services.filter(s=>data.selected.includes(s[0])); return <section><Heading eyebrow="Revisão final" title="Confira suas informações" description="Revise tudo antes do envio. Você pode voltar e editar qualquer seção."/><div className="divide-y divide-border border-y border-border"><ReviewRow title="Dados da empresa" detail={data.company["Nome fantasia"]||"Informações da empresa"} onClick={()=>onEdit(1)}/><ReviewRow title="Responsável" detail={data.contact["Nome completo"]||"Contato principal"} onClick={()=>onEdit(2)}/><ReviewRow title="Serviços contratados" detail={chosen.map(s=>s[1]).join(", ")} onClick={()=>onEdit(3)}/>{chosen.map((s,i)=><ReviewRow key={s[0]} title={s[1]} detail={`${Object.values(data.briefings[s[0]]??{}).filter(Boolean).length} respostas preenchidas`} onClick={()=>onEdit(4+i)}/>)}</div></section> }
function ReviewRow({title,detail,onClick}:{title:string;detail:string;onClick:()=>void}){ return <div className="flex items-center justify-between gap-4 py-5"><div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-xs text-muted-foreground">{detail||"Não informado"}</p></div><Button variant="ghost" onClick={onClick}>Editar</Button></div> }
function Success({logo}:{logo:string}){ return <main className="flex min-h-screen items-center justify-center bg-background px-5"><section className="max-w-xl text-center"><img src={logo} alt="Localway" className="mx-auto mb-12 h-8 w-auto grayscale contrast-200"/><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/10 text-brand-green"><CheckCircle2 className="h-8 w-8"/></div><h1 className="mt-7 text-3xl font-bold md:text-4xl">Onboarding enviado com sucesso!</h1><p className="mt-4 leading-7 text-muted-foreground">Recebemos as informações necessárias para iniciar seu projeto. Nossa equipe irá analisar os dados e seguir para a próxima etapa.</p></section></main> }