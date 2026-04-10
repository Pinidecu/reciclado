export function formatARS(amount: number): string {
  return amount.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function paymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Pendiente de pago",
    PAID: "Pagada",
    FAILED: "Fallida",
    REFUNDED: "Reembolsada",
  };
  return labels[status] ?? status;
}

export function deliveryStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    READY: "Lista para retirar",
    DELIVERED: "Retirada",
    CANCELLED: "Cancelada",
  };
  return labels[status] ?? status;
}

export function productStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Borrador",
    AVAILABLE: "Disponible",
    PAUSED: "Pausado",
    SOLD_OUT: "Agotado",
    EXPIRED: "Vencido",
    DELETED: "Eliminado",
  };
  return labels[status] ?? status;
}
