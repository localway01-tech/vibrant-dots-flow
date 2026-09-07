export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "url"
  | "date"
  | "tel"
  | "cnpj"
  | "cpf"
  | "cep"
  | "radio"
  | "chips"
  | "list"
  | "offerings"
  | "hours"
  | "files";

export type Values = Record<string, unknown>;

export type FieldDef = {
  id: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  options?: string[];
  hint?: string;
  wide?: boolean;
  showIf?: (v: Values) => boolean;
};

export type ServiceDef = {
  id: string;
  name: string;
  description: string;
  color: "blue" | "red" | "yellow" | "green";
  icon: string;
  fields: FieldDef[];
};

export const TRANSFERNOW_URL = "https://www.transfernow.net/push/i/Localway-Upload";

export const companyFields: FieldDef[] = [
  { id: "trade_name", label: "Nome fantasia", required: true },
  { id: "legal_name", label: "Razão social", required: true },
  { id: "cnpj", label: "CNPJ", type: "cnpj", required: true },
  { id: "segment", label: "Segmento", required: true },
  { id: "description", label: "Descrição da empresa", type: "textarea", required: true, wide: true },
  { id: "founded_at", label: "Data de abertura", type: "date" },
  { id: "phone", label: "Telefone", type: "tel" },
  { id: "whatsapp", label: "WhatsApp", type: "tel" },
  { id: "email", label: "E-mail", type: "email" },
  { id: "billing_email", label: "E-mail financeiro", type: "email" },
  { id: "website", label: "Site", type: "url" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "social_other", label: "Outras redes sociais", type: "textarea", wide: true },
];

export const addressFields: FieldDef[] = [
  { id: "cep", label: "CEP", type: "cep", required: true },
  { id: "street", label: "Rua", required: true },
  { id: "number", label: "Número", required: true },
  { id: "complement", label: "Complemento" },
  { id: "district", label: "Bairro", required: true },
  { id: "city", label: "Cidade", required: true },
  { id: "state", label: "Estado", required: true },
];

export const contactFields: FieldDef[] = [
  { id: "name", label: "Nome completo", required: true },
  { id: "whatsapp", label: "WhatsApp", type: "tel", required: true },
  { id: "email", label: "E-mail", type: "email", required: true },
  { id: "role", label: "Cargo/função" },
];

const yesNo = ["Sim", "Não"];

export const serviceDefs: ServiceDef[] = [
  {
    id: "google",
    name: "Perfil da Empresa no Google",
    description: "Presença local e Google Maps",
    color: "blue",
    icon: "MapPin",
    fields: [
      { id: "has_profile", label: "O negócio já possui Perfil da Empresa no Google?", type: "radio", options: ["Sim", "Não", "Não sei"], required: true, wide: true },
      { id: "profile_url", label: "URL do perfil no Google", type: "url", showIf: (v) => v["has_profile"] === "Sim" },
      { id: "profile_name", label: "Nome exibido no Google", showIf: (v) => v["has_profile"] === "Sim" },
      { id: "verified", label: "O perfil está verificado?", type: "radio", options: ["Sim", "Não", "Não sei"], showIf: (v) => v["has_profile"] === "Sim" },
      { id: "has_access", label: "Existe acesso ao perfil?", type: "radio", options: ["Sim", "Não", "Não sei"], showIf: (v) => v["has_profile"] === "Sim" },
      { id: "issues", label: "Já teve algum problema de verificação ou suspensão?", type: "textarea", wide: true, showIf: (v) => v["has_profile"] === "Sim" },
      { id: "category", label: "Categoria principal", hint: "Digite a categoria (ex.: Restaurante, Advogado, Loja de roupas)", required: true },
      { id: "service_mode", label: "Como a empresa atende os clientes?", type: "radio", options: ["No endereço da empresa", "No endereço e em outras regiões", "Somente fora do endereço", "Atendimento online"], required: true, wide: true },
      { id: "areas", label: "Áreas de atendimento", type: "list", wide: true, showIf: (v) => v["service_mode"] === "No endereço e em outras regiões" || v["service_mode"] === "Somente fora do endereço" },
      { id: "address_note", label: "Observações sobre o endereço exibido", type: "textarea", wide: true, showIf: (v) => v["service_mode"] === "No endereço da empresa" || v["service_mode"] === "No endereço e em outras regiões" },
      { id: "hours", label: "Horário de funcionamento", type: "hours", wide: true },
      { id: "business_phone", label: "Telefone comercial", type: "tel" },
      { id: "business_whatsapp", label: "WhatsApp", type: "tel" },
      { id: "site", label: "Site", type: "url" },
      { id: "booking", label: "A empresa utiliza agendamento?", type: "radio", options: yesNo },
      { id: "booking_channel", label: "Canal de agendamento", showIf: (v) => v["booking"] === "Sim" },
      { id: "booking_link", label: "Link ou número de agendamento", showIf: (v) => v["booking"] === "Sim" },
      { id: "parking", label: "Estacionamento", type: "radio", options: ["Próprio", "Na rua", "Conveniado", "Não possui", "Outro"], wide: true },
      { id: "languages", label: "Idiomas atendidos", type: "list", wide: true },
      { id: "offerings", label: "Serviços oferecidos", type: "offerings", wide: true },
      { id: "goal", label: "Objetivo principal com o Perfil do Google", type: "textarea", wide: true },
      { id: "files", label: "Fotos e materiais", type: "files", wide: true },
    ],
  },
  {
    id: "site",
    name: "Site Profissional",
    description: "Site institucional completo",
    color: "red",
    icon: "Globe",
    fields: [
      { id: "goal", label: "Objetivo principal do site", type: "radio", options: ["Gerar contatos", "Gerar vendas", "Apresentar a empresa", "Receber agendamentos", "Divulgar serviços"], required: true, wide: true },
      { id: "pages", label: "Páginas desejadas", type: "list", wide: true },
      { id: "slogan", label: "Slogan" },
      { id: "about", label: "Descrição da empresa para o site", type: "textarea", wide: true },
      { id: "history", label: "História", type: "textarea", wide: true },
      { id: "differentials", label: "Diferenciais", type: "textarea", wide: true },
      { id: "colors_yes", label: "Cores desejadas" },
      { id: "colors_no", label: "Cores que não deseja utilizar" },
      { id: "references", label: "Sites de referência", type: "list", wide: true },
      { id: "domain", label: "Domínio" },
      { id: "domain_access", label: "Informações de acesso ao domínio", type: "textarea", wide: true },
      { id: "notes", label: "Observações", type: "textarea", wide: true },
      { id: "material_links", label: "Links de materiais", type: "list", wide: true },
      { id: "files", label: "Upload de arquivos", type: "files", wide: true },
    ],
  },
  {
    id: "ecommerce",
    name: "E-commerce / Loja Virtual",
    description: "Venda de produtos online",
    color: "yellow",
    icon: "ShoppingCart",
    fields: [
      { id: "store_name", label: "Nome da loja", required: true },
      { id: "product_count", label: "Quantidade aproximada de produtos" },
      { id: "categories", label: "Categorias", type: "list", wide: true },
      { id: "priority_products", label: "Produtos prioritários", type: "list", wide: true },
      { id: "has_catalog", label: "Já possui catálogo?", type: "radio", options: yesNo },
      { id: "stock", label: "Como controla estoque?", type: "textarea", wide: true },
      { id: "payments", label: "Formas de pagamento", type: "list", wide: true },
      { id: "shipping", label: "Formas de entrega", type: "list", wide: true },
      { id: "shipping_areas", label: "Regiões de entrega", type: "list", wide: true },
      { id: "integrations", label: "Integrações necessárias", type: "textarea", wide: true },
      { id: "notes", label: "Observações", type: "textarea", wide: true },
      { id: "files", label: "Upload de catálogo", type: "files", wide: true },
    ],
  },
  {
    id: "mini",
    name: "Mini Site",
    description: "Presença digital objetiva",
    color: "green",
    icon: "Smartphone",
    fields: [
      { id: "short_description", label: "Descrição curta", type: "textarea", required: true, wide: true },
      { id: "hours", label: "Horários", type: "hours", wide: true },
      { id: "services", label: "Principais serviços", type: "list", wide: true },
      { id: "links", label: "Links que devem aparecer", type: "list", wide: true },
      { id: "cta", label: "CTA principal" },
      { id: "references", label: "Referências", type: "list", wide: true },
      { id: "notes", label: "Observações", type: "textarea", wide: true },
      { id: "files", label: "Fotos", type: "files", wide: true },
    ],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Atendimento e catálogo",
    color: "green",
    icon: "MessageCircle",
    fields: [
      { id: "number", label: "Número utilizado", type: "tel", required: true },
      { id: "business_name", label: "Nome comercial" },
      { id: "category", label: "Categoria" },
      { id: "description", label: "Descrição", type: "textarea", wide: true },
      { id: "hours", label: "Horário de atendimento", type: "hours", wide: true },
      { id: "greeting", label: "Mensagem de saudação", type: "textarea", wide: true },
      { id: "away", label: "Mensagem de ausência", type: "textarea", wide: true },
      { id: "closing", label: "Mensagem de encerramento", type: "textarea", wide: true },
      { id: "catalog", label: "Catálogo atual", type: "textarea", wide: true },
      { id: "offerings", label: "Produtos / serviços", type: "offerings", wide: true },
      { id: "labels", label: "Etiquetas utilizadas", type: "list", wide: true },
      { id: "current_flow", label: "Como funciona o atendimento atualmente", type: "textarea", wide: true },
      { id: "faq", label: "Perguntas frequentes", type: "list", wide: true },
      { id: "objections", label: "Principais dúvidas / objeções dos clientes", type: "textarea", wide: true },
      { id: "notes", label: "Observações", type: "textarea", wide: true },
    ],
  },
  {
    id: "identity",
    name: "Identidade Visual",
    description: "Marca e linguagem visual",
    color: "blue",
    icon: "Palette",
    fields: [
      { id: "brand_name", label: "Nome da marca", required: true },
      { id: "what_we_do", label: "O que a empresa faz", type: "textarea", wide: true },
      { id: "audience", label: "Público-alvo", type: "textarea", wide: true },
      { id: "positioning", label: "Posicionamento desejado", type: "textarea", wide: true },
      { id: "personality", label: "Personalidade da marca" },
      { id: "colors_yes", label: "Cores desejadas" },
      { id: "colors_no", label: "Cores que não deseja" },
      { id: "styles_yes", label: "Estilos que gosta" },
      { id: "styles_no", label: "Estilos que não gosta" },
      { id: "symbols", label: "Símbolos ou elementos desejados", type: "textarea", wide: true },
      { id: "references", label: "Referências", type: "list", wide: true },
      { id: "competitors", label: "Concorrentes", type: "list", wide: true },
      { id: "usage", label: "Onde a identidade será utilizada", type: "chips", options: ["Redes sociais", "Site", "Fachada", "Uniforme", "Embalagem", "Cartão de visita", "Veículo"], wide: true },
      { id: "notes", label: "Observações", type: "textarea", wide: true },
      { id: "files", label: "Upload de referências", type: "files", wide: true },
    ],
  },
  {
    id: "plate",
    name: "Plaquinha Resinada",
    description: "Material personalizado",
    color: "yellow",
    icon: "QrCode",
    fields: [
      { id: "display_name", label: "Nome que aparecerá", required: true },
      { id: "logo", label: "Logo (link ou observação sobre o arquivo)" },
      { id: "qr", label: "Deseja QR Code?", type: "radio", options: yesNo },
      { id: "qr_link", label: "Link do QR Code", type: "url", showIf: (v) => v["qr"] === "Sim" },
      { id: "extra_text", label: "Texto adicional", type: "textarea", wide: true },
      { id: "quantity", label: "Quantidade" },
      { id: "notes", label: "Observações", type: "textarea", wide: true },
      { id: "files", label: "Arquivos da plaquinha", type: "files", wide: true },
    ],
  },
  {
    id: "traffic",
    name: "Tráfego Pago",
    description: "Campanhas e performance",
    color: "red",
    icon: "TrendingUp",
    fields: [
      { id: "goal", label: "Objetivo da campanha", type: "radio", options: ["Mensagens", "Leads", "Vendas", "Agendamentos", "Visitas", "Reconhecimento"], required: true, wide: true },
      { id: "product", label: "Produto / serviço anunciado", required: true },
      { id: "offer", label: "Oferta", type: "textarea", wide: true },
      { id: "audience", label: "Público-alvo", type: "textarea", wide: true },
      { id: "age", label: "Faixa etária" },
      { id: "region", label: "Região de atuação" },
      { id: "cities", label: "Cidades", type: "list", wide: true },
      { id: "districts", label: "Bairros", type: "list", wide: true },
      { id: "budget", label: "Orçamento mensal" },
      { id: "already_ads", label: "Já anuncia atualmente?", type: "radio", options: yesNo },
      { id: "past_results", label: "Resultados anteriores", type: "textarea", wide: true, showIf: (v) => v["already_ads"] === "Sim" },
      { id: "meta_business", label: "Meta Business" },
      { id: "ad_account", label: "Conta de anúncios" },
      { id: "pixel", label: "Pixel" },
      { id: "landing", label: "Landing page", type: "url" },
      { id: "competitors", label: "Concorrentes", type: "list", wide: true },
      { id: "notes", label: "Observações", type: "textarea", wide: true },
    ],
  },
  {
    id: "seo",
    name: "SEO",
    description: "Posicionamento orgânico",
    color: "blue",
    icon: "Search",
    fields: [
      { id: "priority_services", label: "Serviços prioritários", type: "list", wide: true },
      { id: "priority_products", label: "Produtos prioritários", type: "list", wide: true },
      { id: "priority_regions", label: "Regiões prioritárias", type: "list", wide: true },
      { id: "keywords", label: "Palavras-chave desejadas", type: "list", wide: true },
      { id: "competitors", label: "Concorrentes", type: "list", wide: true },
      { id: "did_seo", label: "Já realizou SEO?", type: "radio", options: yesNo },
      { id: "past_results", label: "Resultados anteriores", type: "textarea", wide: true, showIf: (v) => v["did_seo"] === "Sim" },
      { id: "search_console", label: "Google Search Console", type: "radio", options: ["Sim", "Não", "Não sei"] },
      { id: "analytics", label: "Google Analytics", type: "radio", options: ["Sim", "Não", "Não sei"] },
      { id: "blog", label: "Possui blog?", type: "radio", options: yesNo },
      { id: "goal", label: "Objetivo principal do SEO", type: "textarea", wide: true },
      { id: "notes", label: "Observações", type: "textarea", wide: true },
    ],
  },
  {
    id: "automation",
    name: "Automações",
    description: "Processos mais eficientes",
    color: "green",
    icon: "Workflow",
    fields: [
      { id: "what", label: "O que deseja automatizar?", type: "textarea", required: true, wide: true },
      { id: "current", label: "Como o processo funciona atualmente?", type: "textarea", wide: true },
      { id: "result", label: "Qual resultado deseja alcançar?", type: "textarea", wide: true },
      { id: "tools", label: "Quais ferramentas utiliza atualmente?", type: "chips", options: ["WhatsApp", "Planilhas", "E-mail", "CRM", "Instagram", "Site", "Formulários", "Outros"], wide: true },
      { id: "tools_other", label: "Outras ferramentas", type: "list", wide: true },
      { id: "details", label: "Descrição detalhada", type: "textarea", wide: true },
    ],
  },
];

export const serviceById = (id: string) => serviceDefs.find((s) => s.id === id);

export const visibleFields = (fields: FieldDef[], values: Values) =>
  fields.filter((f) => !f.showIf || f.showIf(values));

export const missingRequired = (fields: FieldDef[], values: Values) =>
  visibleFields(fields, values).filter((f) => {
    if (!f.required) return false;
    const v = values[f.id];
    if (Array.isArray(v)) return v.length === 0;
    return !String(v ?? "").trim();
  });

export const WEEK_DAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"] as const;

export type DayHours = {
  mode: "closed" | "open" | "24h";
  from?: string;
  to?: string;
  from2?: string;
  to2?: string;
  second?: boolean;
};

export type Offering = { name: string; description: string; price: string; priority: boolean };
