const digits = (v: string) => v.replace(/\D/g, "");

export const maskCNPJ = (v: string) =>
  digits(v)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");

export const maskCPF = (v: string) =>
  digits(v)
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");

export const maskCEP = (v: string) => {
  const d = digits(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

export const maskPhone = (v: string) => {
  const d = digits(v).slice(0, 11);
  if (d.length <= 2) return d.replace(/^(\d{0,2})/, "($1");
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export const applyMask = (type: string, value: string) => {
  if (type === "cnpj") return maskCNPJ(value);
  if (type === "cpf") return maskCPF(value);
  if (type === "cep") return maskCEP(value);
  if (type === "tel") return maskPhone(value);
  return value;
};

export type CepResult = { street: string; district: string; city: string; state: string };

export async function lookupCep(cep: string): Promise<CepResult | null> {
  const d = digits(cep);
  if (d.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${d}/json/`);
    if (!res.ok) return null;
    const json = (await res.json()) as Record<string, string> & { erro?: boolean };
    if (json.erro) return null;
    return {
      street: json["logradouro"] ?? "",
      district: json["bairro"] ?? "",
      city: json["localidade"] ?? "",
      state: json["uf"] ?? "",
    };
  } catch {
    return null;
  }
}
