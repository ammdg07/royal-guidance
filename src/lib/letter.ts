export interface LetterData {
  addressee: string;
  subject: string;
  greeting: string;
  body: string[];
  closing: string;
  sender_label: string;
  sender_name?: string;
  sender_id?: string;
  sender_mobile?: string;
  sender_date?: string;
  notes?: string;
}

export function signatureLines(letter: LetterData): string[] {
  const value = (field?: string) => field?.trim() || "________________";
  return [
    `${letter.sender_label || "مقدمه"}: ${value(letter.sender_name)}`,
    ...(letter.sender_id?.trim() ? [`رقم الهوية: ${letter.sender_id.trim()}`] : []),
    `التواصل: ${value(letter.sender_mobile)}`,
    `التاريخ: ${value(letter.sender_date)}`,
  ];
}

export function letterToText(letter: LetterData): string {
  return [
    "بسم الله الرحمن الرحيم", "", letter.addressee, "",
    `الموضوع: ${letter.subject}`, "", letter.greeting, "",
    ...letter.body, "", letter.closing, "", ...signatureLines(letter),
    "", "التوقيع: ________________",
  ].join("\n");
}