import { DateTime } from "luxon";

export function convertDateToJs(stringDate) {
  // Conversion  en date JS
  const parsedDate = DateTime.fromFormat(stringDate, "dd/MM/yyyy HH:mm", {
    zone: "Africa/Lagos",
  });
  if (!parsedDate.isValid) {
    throw new Error("Format de date invalide. Utilisez DD/MM/YYYY HH:MM");
  }
  const jsDate = parsedDate.toJSDate();
  return jsDate;
}

export function convetSearcheDateToJs(fromStringDate, ToStringDate) {
  const zone = "Africa/Lagos";

  // 00:00 du jour de début
  const fromDate = DateTime.fromFormat(fromStringDate, "dd/MM/yyyy", {
    zone,
  }).startOf("day");

  // 23:59:59.999 du jour de fin
  const toDate = DateTime.fromFormat(ToStringDate, "dd/MM/yyyy", {
    zone,
  }).endOf("day");

  // Convertir en UTC ISO pour PostgreSQL car postgrel stocke en iso et utc par defaut
  const fromISO = fromDate.toUTC().toISO();
  const toISO = toDate.toUTC().toISO();
  return [fromISO,toISO]
}
