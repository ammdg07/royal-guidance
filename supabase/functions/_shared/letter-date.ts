export function formatLetterDate(date: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Riyadh", numberingSystem: "latn", day: "numeric", month: "long", year: "numeric",
  };
  const format = (calendar: string) => {
    const parts = new Intl.DateTimeFormat("ar-SA", { ...options, calendar }).formatToParts(date);
    return ["day", "month", "year"].map(type => parts.find(part => part.type === type)?.value ?? "").join(" ");
  };
  const hijri = format("islamic-umalqura");
  const gregorian = format("gregory");
  return `${hijri} هـ، الموافق ${gregorian} م`;
}