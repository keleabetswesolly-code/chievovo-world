// Detect user's locale and preferred currency via browser API
const getUserLocale = () => Intl.DateTimeFormat().resolvedOptions().locale || navigator.language || "en-ZA";

const LOCALE_CURRENCY_MAP = {
  ZA: "ZAR", US: "USD", GB: "GBP", EU: "EUR", NG: "NGN",
  GH: "GHS", KE: "KES", EG: "EGP", AU: "AUD", CA: "CAD",
};

const getUserCurrency = () => {
  try {
    // Try timezone-based detection first
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.startsWith("Africa/Jo") || tz === "Africa/Johannesburg") return "ZAR";
    if (tz.startsWith("Africa/Lagos") || tz === "Africa/Abidjan") return "NGN";
    if (tz.startsWith("Africa/Nairobi")) return "KES";
    if (tz.startsWith("Africa/Accra")) return "GHS";
    if (tz.startsWith("Africa/Cairo")) return "EGP";
    if (tz.startsWith("America/")) return "USD";
    if (tz.startsWith("Europe/London")) return "GBP";
    if (tz.startsWith("Europe/")) return "EUR";
    if (tz.startsWith("Australia/")) return "AUD";

    // Fallback to locale
    const locale = getUserLocale();
    const region = locale.split("-")[1]?.toUpperCase();
    return LOCALE_CURRENCY_MAP[region] || "ZAR";
  } catch {
    return "ZAR";
  }
};

export const userCurrency = getUserCurrency();
export const userLocale = getUserLocale();

export const formatPrice = (amount) => {
  return new Intl.NumberFormat(userLocale, {
    style: "currency",
    currency: userCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};