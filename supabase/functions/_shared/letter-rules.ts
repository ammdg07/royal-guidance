const clean = (value: string) => value.trim().replace(/\s+/g, " ");

/** Protocol addressee derived from the entity type (Arabic letters). */
export function entityAddressee(entity: string): string {
  const name = clean(entity);
  if (!name) return "";
  if (/^(صاحب|معالي|سعادة|سمو)/.test(name)) return name;
  if (/إمارة|امارة/.test(name)) return `صاحب السمو الملكي أمير ${clean(name.replace(/^(إمارة|امارة)/, ""))} حفظه الله`;
  if (/^(وزارة|وزاره)/.test(name)) return `معالي وزير ${clean(name.replace(/^(وزارة|وزاره)/, ""))} حفظه الله`;
  if (/ديوان/.test(name)) return `معالي رئيس ${name} حفظه الله`;
  return `سعادة مدير عام ${name} المحترم`;
}

const informal = ["ابي", "أبي", "ابغى", "أبغى", "ابغا", "ودي", "عشان", "علشان", "وش", "ليش", "كذا", "زي", "مره", "مرة وحدة", "حيل", "يبغى", "ماني", "مو", "اللحين", "الحين", "طفشت", "حرامية", "حرامي", "نصابين", "فاشلين", "فاشل", "غبي", "أغبياء", "زفت", "تبن", "ظلمتوني", "مهزلة"];

/** Colloquial or harsh words found in the request text. */
export function toneIssues(text: string): string[] {
  const words = text.replace(/[^\p{L}\s]/gu, " ").split(/\s+/).filter(Boolean);
  const found = informal.filter(term => term.includes(" ") ? text.includes(term) : words.includes(term));
  return [...new Set(found)];
}

export function validAttachments(value: unknown): boolean {
  return value === undefined || Array.isArray(value) && value.length <= 15 && value.every(item => typeof item === "string" && item.trim().length > 0 && item.length <= 200);
}

export const coverLetterInstruction = "نوع الخطاب: خطاب طلب وظيفة (Cover Letter) موجه إلى الرئيس التنفيذي أو مدير الموارد البشرية. ركّز على المهارات والخبرات والمؤهلات المذكورة فقط وقيمتها للجهة، بأسلوب إداري رصين ومقنع وموجز، واختم بطلب مقابلة شخصية. لا تختلق مؤهلات أو سنوات خبرة.";

export const toneInstruction = "هذّب أي عبارات عامية أو حادة أو غير لائقة في طلب المستخدم وأعد صياغتها بأسلوب نظامي وقور دون تغيير المعنى أو المطالب.";
