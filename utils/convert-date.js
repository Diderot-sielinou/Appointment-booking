import { DateTime } from "luxon";

export function convertDateToJs(stringDate) {
  // Conversion  en date JS
  const parsedDate = DateTime.fromFormat(stringDate, "dd/MM/yyyy HH:mm", {
    zone: 'Africa/Lagos',
  });
  if (!parsedDate.isValid) {
    throw new Error("Format de date invalide. Utilisez DD/MM/YYYY HH:MM");
  }
  const jsDate = parsedDate.toJSDate();
  return jsDate
}
