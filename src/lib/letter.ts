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
  official_stamp?: boolean;
  witnesses?: boolean;
  language?: "ar" | "en";
  attachments?: string[];
}

export function letterLabels(letter: LetterData) {
  return letter.language === "en" ? {
    basmala: "In the name of Allah, the Most Gracious, the Most Merciful", subject: "Subject", sender: "Submitted by", id: "National ID", contact: "Contact", date: "Date", signature: "Signature", officialSignature: "Official signature", stamp: "Official stamp", witnesses: "Witnesses / Identifiers", witness: "Witness / Identifier", name: "Name", attachments: "Attachments",
  } : {
    basmala: "بسم الله الرحمن الرحيم", subject: "الموضوع", sender: "مقدمه", id: "رقم الهوية", contact: "التواصل", date: "التاريخ", signature: "التوقيع", officialSignature: "التوقيع الرسمي", stamp: "الختم الرسمي", witnesses: "الشهود / المعرّفون", witness: "الشاهد / المعرّف", name: "الاسم", attachments: "المرفقات",
  };
}


export function attachmentLines(letter: LetterData): string[] {
  const items = (letter.attachments || []).map(a => a.trim()).filter(Boolean);
  return items.length ? [`${letterLabels(letter).attachments}:`, ...items.map(a => `• ${a}`)] : [];
}

export function witnessLines(letter: LetterData): string[] {
  if (!letter.witnesses) return [];
  const labels = letterLabels(letter);
  return [1, 2].flatMap(number => [`${labels.witness} ${number}`, `${labels.name}: ________________`, `${labels.id}: ________________`, `${labels.signature}: ________________`]);
}

export function signatureLines(letter: LetterData): string[] {
  const value = (field?: string) => field?.trim() || "________________";
  const labels = letterLabels(letter);
  return [
    `${letter.language === "en" ? labels.sender : letter.sender_label || labels.sender}: ${value(letter.sender_name)}`,
    ...(letter.sender_id?.trim() ? [`${labels.id}: ${letter.sender_id.trim()}`] : []),
    `${labels.contact}: ${value(letter.sender_mobile)}`,
    `${labels.date}: ${value(letter.sender_date)}`,
  ];
}

export function letterToText(letter: LetterData): string {
  const labels = letterLabels(letter);
  const attachments = attachmentLines(letter);
  return [
    labels.basmala, "", letter.addressee, "",
    `${labels.subject}: ${letter.subject}`, "", letter.greeting, "",
    ...letter.body, "", letter.closing, "", ...(attachments.length ? [...attachments, ""] : []), ...signatureLines(letter),
    "", `${labels.signature}: ________________`,
    ...(letter.official_stamp ? ["", `${labels.officialSignature}: ________________`, `${labels.stamp}: ________________`] : []),
    ...witnessLines(letter),
  ].join("\n");
}