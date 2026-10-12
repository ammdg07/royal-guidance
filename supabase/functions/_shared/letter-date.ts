export function formatLetterDate(date: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Riyadh", day: "numeric", month: "long", year: "numeric",
  };
  const hijri = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", options).format(date);
  const gregorian = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", options).format(date);
  return `${hijri} هـ، الموافق ${gregorian} م`;
}