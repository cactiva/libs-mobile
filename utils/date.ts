import Theme from "@libs/config/theme";
import { format as formatFNS, parseISO } from "date-fns";
import * as locales from "date-fns/locale";

export const dateParse = (value: any) => {
  if (typeof value === "string") {
    return parseISO(value);
  }
  return value;
};
export const dateFormat = (value: any, format?: string) => {
  const locale: string = Theme.LocalLang || "enUS";
  const inputFormat = format ? format : "dd MMM yyyy - HH:mm";
  if (typeof value === "string") {
    return formatFNS(parseISO(value), inputFormat, {
      locale: (locales as any)[locale],
    });
  }

  try {
    return formatFNS(value, inputFormat, {
      locale: (locales as any)[locale],
    });
  } catch (e) {
    return value;
  }
};
