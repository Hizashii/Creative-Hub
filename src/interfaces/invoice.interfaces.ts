import type { InvoiceRow } from "../types/dashboard";

export interface ClientInvoiceDocumentsProps {
  invoices: InvoiceRow[];
  loading: boolean;
  clientName?: string;
  clientEmail?: string;
}
