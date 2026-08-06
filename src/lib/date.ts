import { format } from "date-fns";

export function aujourdHui(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function heureActuelle(): string {
  return format(new Date(), "HH:mm");
}
