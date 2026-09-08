type SubmissionRow = {
  company_name?: unknown;
  company_data?: Record<string, unknown>;
  address_data?: Record<string, unknown>;
  contact_data?: Record<string, unknown>;
  selected_services?: unknown;
  service_data?: Record<string, Record<string, unknown>>;
};

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzQfWx3h8U6zhnirRMQeupO5kog53w1EmWLXIdKW5rXkttdTC8gK9bMx28dpnig7s4/exec";

function isMeaningful(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(isMeaningful);
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).some(isMeaningful);
  return true;
}

function cleanValues(values: Record<string, unknown> | undefined) {
  return Object.fromEntries(Object.entries(values ?? {}).filter(([, value]) => isMeaningful(value)));
}

function cleanServiceData(selected: string[], serviceData: Record<string, Record<string, unknown>> | undefined) {
  return Object.fromEntries(
    selected
      .map((serviceId) => [serviceId, cleanValues(serviceData?.[serviceId])] as const)
      .filter(([, values]) => Object.keys(values).length > 0),
  );
}

export const supabase = {
  from(table: string) {
    return {
      async insert(row: SubmissionRow) {
        if (table !== "onboarding_submissions") {
          return { error: new Error(`Tabela não suportada: ${table}`) };
        }

        const selectedServices = Array.isArray(row.selected_services)
          ? row.selected_services.filter((value): value is string => typeof value === "string")
          : [];

        const payload = {
          company_name: String(row.company_name ?? ""),
          company_data: cleanValues(row.company_data),
          address_data: cleanValues(row.address_data),
          contact_data: cleanValues(row.contact_data),
          selected_services: selectedServices,
          service_data: cleanServiceData(selectedServices, row.service_data),
        };

        try {
          const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            return { error: new Error(`Apps Script respondeu com ${response.status}`) };
          }

          return { error: null };
        } catch (error) {
          return { error: error instanceof Error ? error : new Error("Falha ao enviar o onboarding") };
        }
      },
    };
  },
};
