import type { FieldDef, Values } from "./onboarding-schema";

const has = (id: string, opt: string) => (v: Values) => {
  const x = v[id];
  return Array.isArray(x) ? x.includes(opt) : x === opt;
};
const any = (id: string, opts: string[]) => (v: Values) => opts.some((o) => has(id, o)(v));

const serviceModes: FieldDef = {
  id: "attendance",
  label: "Como você atende seus clientes?",
  type: "chips",
  options: ["No local", "A domicílio", "Online", "Outro"],
  wide: true,
};
const booking: FieldDef = {
  id: "booking",
  label: "Como o cliente agenda ou compra?",
  type: "chips",
  options: ["WhatsApp", "Telefone", "Instagram", "Aplicativo / link de agendamento", "Chegando no local", "Site", "Outro"],
  wide: true,
};
const differentials: FieldDef = { id: "differentials", label: "O que diferencia sua empresa da concorrência?", type: "textarea", wide: true };
const mainOffer: FieldDef = { id: "main_offer", label: "Quais produtos ou serviços são mais importantes para você vender mais?", type: "list", wide: true };
const delivery: FieldDef[] = [
  { id: "delivery", label: "Faz entregas?", type: "radio", options: ["Sim", "Não"] },
  { id: "delivery_area", label: "Para quais bairros/cidades entrega?", type: "list", wide: true, showIf: has("delivery", "Sim") },
];

const beauty = (services: string[]): FieldDef[] => [
  { id: "services", label: "Quais serviços você oferece?", type: "chips", options: [...services, "Outro"], required: true, wide: true },
  { id: "audience", label: "Seu público é principalmente", type: "radio", options: ["Feminino", "Masculino", "Todos", "Infantil", "Outro"], wide: true },
  booking,
  { id: "home_service", label: "Atende a domicílio?", type: "radio", options: ["Sim", "Não"] },
  mainOffer,
  differentials,
];

const health = (specialties: string[]): FieldDef[] => [
  { id: "specialties", label: "Quais especialidades/procedimentos são oferecidos?", type: "chips", options: [...specialties, "Outro"], required: true, wide: true },
  { id: "payment", label: "Atendimento", type: "radio", options: ["Particular", "Convênios", "Particular e convênios"], wide: true },
  { id: "insurances", label: "Quais convênios atende?", type: "list", wide: true, showIf: any("payment", ["Convênios", "Particular e convênios"]) },
  { id: "professionals", label: "Profissionais e registros (nome e CRM/CRO etc.)", type: "list", wide: true },
  { id: "telehealth", label: "Faz atendimento online?", type: "radio", options: ["Sim", "Não"] },
  booking,
  differentials,
];

const food = (products: string[]): FieldDef[] => [
  { id: "products", label: "O que você mais vende?", type: "chips", options: [...products, "Outro"], required: true, wide: true },
  { id: "modes", label: "Formas de atendimento", type: "chips", options: ["Consumo no local", "Delivery", "Retirada", "Encomendas", "Outro"], required: true, wide: true },
  { id: "apps", label: "Está em quais aplicativos de delivery?", type: "chips", options: ["iFood", "99Food", "Delivery próprio / WhatsApp", "Outro"], wide: true, showIf: has("modes", "Delivery") },
  { id: "delivery_area", label: "Área de entrega", type: "list", wide: true, showIf: has("modes", "Delivery") },
  { id: "order_notice", label: "Com quanta antecedência aceita encomendas?", showIf: has("modes", "Encomendas") },
  { id: "menu_link", label: "Link do cardápio (se tiver)", type: "url" },
  { id: "extras", label: "Diferenciais do espaço", type: "chips", options: ["Música ao vivo", "Espaço kids", "Pet friendly", "Estacionamento", "Wi-Fi", "Opções vegetarianas", "Outro"], wide: true },
  differentials,
];

const retail = (categories: string[]): FieldDef[] => [
  { id: "categories", label: "Principais categorias de produtos", type: "chips", options: [...categories, "Outro"], required: true, wide: true },
  { id: "brands", label: "Marcas que trabalha (se relevante)", type: "list", wide: true },
  { id: "channels", label: "Onde vende hoje?", type: "chips", options: ["Loja física", "WhatsApp", "Instagram", "Site próprio", "Marketplaces", "Outro"], wide: true },
  { id: "sales_type", label: "Vende para", type: "radio", options: ["Consumidor final", "Atacado / revenda", "Ambos"], wide: true },
  ...delivery,
  mainOffer,
  differentials,
];

const autoRepair = (services: string[]): FieldDef[] => [
  { id: "services", label: "Quais serviços realiza?", type: "chips", options: [...services, "Outro"], required: true, wide: true },
  { id: "vehicles", label: "Tipos de veículo atendidos", type: "chips", options: ["Carros", "Motos", "Caminhões / utilitários", "Outro"], wide: true },
  { id: "brands", label: "Marcas em que é especialista (se houver)", type: "list", wide: true },
  { id: "extras", label: "Oferece", type: "chips", options: ["Orçamento gratuito", "Guincho", "Leva e traz", "Garantia do serviço", "Atendimento a seguradoras", "Outro"], wide: true },
  differentials,
];

const vehiclesSale: FieldDef[] = [
  { id: "sale_condition", label: "Vende veículos", type: "chips", options: ["Novos", "Seminovos / usados", "Outro"], wide: true },
  { id: "sale_extras", label: "Oferece", type: "chips", options: ["Financiamento", "Aceita troca", "Consignação", "Garantia", "Outro"], wide: true },
  { id: "stock_size", label: "Quantidade média de veículos em estoque" },
];

const services = (list: string[]): FieldDef[] => [
  { id: "services", label: "Quais serviços você oferece?", type: "chips", options: [...list, "Outro"], required: true, wide: true },
  serviceModes,
  { id: "quote", label: "Como funciona o orçamento?", type: "radio", options: ["Gratuito no local", "Por WhatsApp / foto", "Com visita técnica", "Outro"], wide: true },
  { id: "service_area", label: "Regiões atendidas", type: "list", wide: true },
  mainOffer,
  differentials,
];

const education = (list: string[]): FieldDef[] => [
  { id: "courses", label: "Cursos / categorias oferecidos", type: "chips", options: [...list, "Outro"], required: true, wide: true },
  { id: "modality", label: "Modalidade", type: "chips", options: ["Presencial", "Online", "Híbrido"], wide: true },
  { id: "audience", label: "Público principal", type: "chips", options: ["Crianças", "Adolescentes", "Adultos", "Empresas", "Outro"], wide: true },
  mainOffer,
  differentials,
];

const SEGMENT_FIELDS: Record<string, FieldDef[]> = {
  Fotografia: [
    { id: "types", label: "Quais tipos de fotografia/ensaios você realiza?", type: "chips", options: ["Gestante", "Newborn", "Infantil", "Família", "Casamento", "Formatura", "Eventos", "Corporativo", "Produtos", "Outro"], required: true, wide: true },
    { id: "wedding_scope", label: "No casamento, o que oferece?", type: "chips", options: ["Pré-wedding", "Making of", "Cerimônia e festa", "Vídeo / filmagem", "Álbum", "Outro"], wide: true, showIf: has("types", "Casamento") },
    { id: "location", label: "Onde fotografa?", type: "chips", options: ["Estúdio próprio", "Externo", "No local do cliente / evento", "Outro"], wide: true },
    { id: "travel", label: "Atende em outras cidades?", type: "radio", options: ["Sim", "Não"] },
    { id: "delivery_format", label: "Formas de entrega", type: "chips", options: ["Galeria online", "Álbum impresso", "Pendrive", "Quadros", "Outro"], wide: true },
    differentials,
  ],
  Barbearia: beauty(["Corte", "Barba", "Sobrancelha", "Pigmentação", "Química / coloração", "Tratamentos capilares"]),
  "Salão de beleza": beauty(["Corte", "Coloração", "Escova / penteado", "Tratamentos capilares", "Manicure / pedicure", "Maquiagem", "Sobrancelha", "Depilação"]),
  Estética: beauty(["Limpeza de pele", "Depilação a laser", "Drenagem / massagem", "Harmonização facial", "Estética corporal", "Micropigmentação", "Cílios"]),
  "Clínica / consultório": health(["Clínico geral", "Psicologia", "Nutrição", "Fisioterapia", "Pediatria", "Dermatologia", "Ginecologia", "Exames"]),
  Odontologia: health(["Clínico geral", "Ortodontia", "Implantes", "Estética / clareamento", "Lentes / facetas", "Odontopediatria", "Canal", "Prótese"]),
  "Academia / fitness": [
    { id: "modalities", label: "Modalidades oferecidas", type: "chips", options: ["Musculação", "Funcional", "Pilates", "Crossfit", "Lutas", "Dança", "Natação", "Yoga", "Outro"], required: true, wide: true },
    { id: "plans", label: "Tipos de plano", type: "chips", options: ["Mensal", "Trimestral", "Semestral", "Anual", "Diária / avulso", "Outro"], wide: true },
    { id: "extras", label: "Oferece", type: "chips", options: ["Aula experimental", "Personal trainer", "Avaliação física", "Estacionamento", "Vestiário", "Outro"], wide: true },
    differentials,
  ],
  Restaurante: food(["Almoço / prato feito", "Self-service", "À la carte", "Rodízio", "Japonesa", "Hambúrguer", "Frutos do mar", "Churrasco"]),
  "Bar / lanchonete": food(["Lanches", "Petiscos", "Bebidas / drinks", "Açaí", "Salgados", "Sucos"]),
  Padaria: food(["Pães", "Bolos", "Salgados", "Café da manhã", "Frios", "Doces"]),
  Confeitaria: food(["Bolos de festa", "Doces finos", "Bolos caseiros", "Tortas", "Kits festa", "Brigadeiros"]),
  Pizzaria: food(["Pizzas tradicionais", "Pizzas especiais", "Pizzas doces", "Rodízio", "Massas", "Esfihas"]),
  "Mercado / mercadinho": retail(["Mercearia", "Hortifrúti", "Açougue", "Padaria", "Bebidas", "Limpeza e higiene"]),
  "Loja de roupas": retail(["Feminino", "Masculino", "Infantil", "Plus size", "Moda praia", "Fitness", "Acessórios"]),
  Calçados: retail(["Feminino", "Masculino", "Infantil", "Esportivo", "Social", "Bolsas e acessórios"]),
  "Moda íntima": retail(["Lingerie", "Pijamas", "Moda praia", "Masculino", "Plus size"]),
  "Semijoias / joias": retail(["Semijoias", "Joias em ouro", "Prata", "Relógios", "Alianças", "Personalizados"]),
  "Cosméticos / perfumaria": retail(["Perfumes", "Maquiagem", "Skincare", "Cabelos", "Dermocosméticos"]),
  Ótica: [
    ...retail(["Óculos de grau", "Óculos de sol", "Lentes de contato", "Armações infantis"]),
    { id: "exam", label: "Oferece exame de vista?", type: "radio", options: ["Sim", "Não", "Por parceria"] },
  ],
  "Loja de eletrônicos / assistência técnica": [
    { id: "activity", label: "O que a empresa faz?", type: "radio", options: ["Vende eletrônicos", "Assistência técnica", "Vende e conserta"], required: true, wide: true },
    { id: "products", label: "Produtos vendidos", type: "chips", options: ["Celulares", "Acessórios", "Informática", "Games", "Áudio / TV", "Outro"], wide: true, showIf: any("activity", ["Vende eletrônicos", "Vende e conserta"]) },
    { id: "repairs", label: "Consertos realizados", type: "chips", options: ["Troca de tela", "Bateria", "Placa", "Notebooks / PCs", "Videogames", "Outro"], wide: true, showIf: any("activity", ["Assistência técnica", "Vende e conserta"]) },
    { id: "brands", label: "Marcas atendidas", type: "list", wide: true },
    differentials,
  ],
  "Loja de móveis": [
    ...retail(["Sala", "Quarto", "Cozinha", "Escritório", "Área externa", "Colchões"]),
    { id: "custom", label: "Faz móveis planejados / sob medida?", type: "radio", options: ["Sim", "Não"] },
  ],
  "Loja de decoração": retail(["Objetos decorativos", "Iluminação", "Tapetes e cortinas", "Quadros", "Plantas / vasos", "Mesa posta"]),
  "Material de construção": retail(["Básico / cimento", "Elétrica", "Hidráulica", "Pisos e revestimentos", "Tintas", "Ferramentas"]),
  Vidraçaria: services(["Box de banheiro", "Janelas", "Portas", "Espelhos", "Fachadas", "Guarda-corpo"]),
  Marcenaria: services(["Móveis planejados", "Cozinhas", "Guarda-roupas", "Móveis comerciais", "Restauração"]),
  Gráfica: services(["Cartões de visita", "Panfletos", "Banners / lonas", "Adesivos", "Placas", "Brindes", "Convites"]),
  "Recarga de cartuchos / toner": services(["Recarga de cartuchos", "Recarga de toner", "Venda de suprimentos", "Manutenção de impressoras", "Locação de impressoras"]),
  Autoescola: education(["Carro (B)", "Moto (A)", "A e B", "Caminhão / ônibus", "Reciclagem", "Aulas para habilitados"]),
  "Oficina mecânica": autoRepair(["Mecânica geral", "Revisão", "Suspensão / freios", "Troca de óleo", "Injeção eletrônica", "Ar-condicionado"]),
  "Auto elétrica": autoRepair(["Elétrica geral", "Baterias", "Som automotivo", "Alarmes / travas", "Ar-condicionado", "Diagnóstico"]),
  "Funilaria / pintura automotiva": autoRepair(["Funilaria", "Pintura", "Martelinho de ouro", "Polimento", "Vitrificação", "Estética automotiva"]),
  "Loja de carros": vehiclesSale,
  "Loja de motos": [...vehiclesSale, { id: "workshop", label: "Tem oficina / peças?", type: "radio", options: ["Sim", "Não"] }],
  "Locadora de veículos": [
    { id: "activity", label: "Qual atividade sua empresa realiza?", type: "radio", options: ["Aluguel de veículos", "Venda de veículos", "Aluguel e venda", "Outro"], required: true, wide: true },
    { id: "rent_fleet", label: "Tipos de veículo para aluguel", type: "chips", options: ["Carros populares", "SUVs", "Executivos", "Vans", "Motos", "Utilitários", "Outro"], wide: true, showIf: any("activity", ["Aluguel de veículos", "Aluguel e venda"]) },
    { id: "rent_periods", label: "Períodos de locação", type: "chips", options: ["Diária", "Semanal", "Mensal", "Para aplicativo", "Corporativo", "Outro"], wide: true, showIf: any("activity", ["Aluguel de veículos", "Aluguel e venda"]) },
    { id: "rent_requirements", label: "Principais requisitos para alugar", type: "textarea", wide: true, showIf: any("activity", ["Aluguel de veículos", "Aluguel e venda"]) },
    ...vehiclesSale.map((f) => ({ ...f, showIf: any("activity", ["Venda de veículos", "Aluguel e venda"]) })),
    differentials,
  ],
  Imobiliária: [
    { id: "activity", label: "Atua com", type: "chips", options: ["Venda", "Locação", "Lançamentos", "Administração de imóveis", "Temporada", "Outro"], required: true, wide: true },
    { id: "property_types", label: "Tipos de imóvel", type: "chips", options: ["Casas", "Apartamentos", "Terrenos", "Comerciais", "Rurais", "Outro"], wide: true },
    { id: "creci", label: "CRECI" },
    { id: "regions", label: "Bairros / regiões de atuação", type: "list", wide: true },
    differentials,
  ],
  "Hotel / pousada": [
    { id: "rooms", label: "Quantidade de quartos/acomodações" },
    { id: "amenities", label: "Comodidades", type: "chips", options: ["Café da manhã", "Piscina", "Estacionamento", "Wi-Fi", "Pet friendly", "Ar-condicionado", "Restaurante", "Outro"], wide: true },
    { id: "booking_channels", label: "Onde recebe reservas?", type: "chips", options: ["Booking", "Airbnb", "WhatsApp", "Site próprio", "Outro"], wide: true },
    { id: "nearby", label: "Atrações ou pontos próximos", type: "list", wide: true },
    differentials,
  ],
  "Agência de viagens / turismo": [
    { id: "products", label: "O que vende?", type: "chips", options: ["Pacotes nacionais", "Internacionais", "Passeios locais", "Excursões", "Cruzeiros", "Passagens", "Outro"], required: true, wide: true },
    { id: "destinations", label: "Principais destinos", type: "list", wide: true },
    differentials,
  ],
  Eventos: [
    { id: "event_types", label: "Tipos de evento", type: "chips", options: ["Casamento", "Aniversário", "Infantil", "Corporativo", "Formatura", "15 anos", "Outro"], required: true, wide: true },
    { id: "offer", label: "O que oferece?", type: "chips", options: ["Espaço / salão", "Decoração", "Cerimonial", "Som e iluminação", "Locação de itens", "Outro"], wide: true },
    { id: "capacity", label: "Capacidade de convidados (se tiver espaço)", showIf: has("offer", "Espaço / salão") },
    differentials,
  ],
  Buffet: [
    { id: "event_types", label: "Atende quais eventos?", type: "chips", options: ["Casamento", "Aniversário", "Infantil", "Corporativo", "Formatura", "Outro"], required: true, wide: true },
    { id: "menu", label: "Tipos de cardápio", type: "chips", options: ["Coquetel", "Jantar", "Churrasco", "Finger food", "Doces", "Outro"], wide: true },
    { id: "own_space", label: "Possui espaço próprio?", type: "radio", options: ["Sim", "Não, atende no local do cliente", "Ambos"], wide: true },
    differentials,
  ],
  "Escola / curso": education(["Educação infantil", "Ensino fundamental", "Idiomas", "Reforço escolar", "Cursos profissionalizantes", "Música / artes", "Informática"]),
  "Serviços profissionais": services(["Advocacia", "Contabilidade", "Consultoria", "Arquitetura", "Engenharia", "Despachante"]),
  "Prestador de serviços": services(["Limpeza", "Manutenção", "Elétrica", "Hidráulica", "Pintura", "Dedetização", "Jardinagem"]),
  Outro: [
    { id: "what", label: "O que sua empresa vende ou oferece?", type: "textarea", required: true, wide: true },
    serviceModes,
    mainOffer,
    differentials,
  ],
};

export const SEGMENTS = Object.keys(SEGMENT_FIELDS).filter((s) => s !== "Outro").concat("Outro");

export const segmentFields = (segment: unknown): FieldDef[] => {
  const s = String(segment ?? "");
  if (!s) return [];
  return SEGMENT_FIELDS[s] ?? SEGMENT_FIELDS["Outro"]!;
};
