import { DateTime, IANAZone } from "luxon";
import AppError from '../utils/AppError.js'

// ✅ Check if the timezone is valid
export function isValidTimezone(zone) {
  return IANAZone.isValidZone(zone);
}

export function convertDateToJs(stringDate, zone) {
  if (!isValidTimezone(zone)) {
    throw new AppError("Invalid time zone");
  }

  const parsedDate = DateTime.fromFormat(stringDate, "dd/MM/yyyy HH:mm", {
    zone,
  });
  if (!parsedDate.isValid) {
    throw new AppError("Format de date invalide. Utilisez dd/MM/YYYY HH:MM");
  }
  // convert to JSdate
  const jsDate = parsedDate.toJSDate();
  return jsDate;
}

// ✅ For a search between two dates (in DD/MM/YYYY format)
export function convertSearchDateToJs(fromStringDate, toStringDate, zone) {
  // const zone = "zone";
  if (!isValidTimezone(zone)) {
    throw new AppError("Invalid time zone");
  }

  // 00:00 du jour de début
  const fromDate = DateTime.fromFormat(fromStringDate, "dd/MM/yyyy", {
    zone,
  }).startOf("day");

  // 23:59:59.999 du jour de fin
  const toDate = DateTime.fromFormat(toStringDate, "dd/MM/yyyy", {
    zone,
  }).endOf("day");

  if (!fromDate.isValid || !toDate.isValid) {
    throw new AppError("Format de date invalide. Utilisez dd/MM/yyyy");
  }

  // Convert to UTC ISO for PostgreSQL because postgrel stores in iso and utc by default
  const fromISO = fromDate.toUTC().toISO();
  const toISO = toDate.toUTC().toISO();
  return [fromISO, toISO];
}
