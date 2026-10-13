export function shouldSendOnKey(key: string, shiftKey: boolean, composing = false): boolean {
  return key === "Enter" && !shiftKey && !composing;
}
export interface LetterRequest { full_name: string; national_id: string; mobile: string; entity: string; details: string; recipient_person?: string; official_stamp?: boolean; language?: "ar" | "en"; legal_support?: boolean; witnesses?: boolean; original_letter?: string; attachments?: string[]; letter_type?: "general" | "cover_letter" }
export function validLetterRequest(request: LetterRequest, mode: "letter" | "improve" = "letter"): boolean {
  return [request.full_name, request.national_id, request.mobile, request.entity, mode === "improve" ? request.original_letter || "" : request.details].every(value => value.trim().length > 0);
}