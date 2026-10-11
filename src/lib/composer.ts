export function shouldSendOnKey(key: string, shiftKey: boolean, composing = false): boolean {
  return key === "Enter" && !shiftKey && !composing;
}
export interface LetterRequest { full_name: string; national_id: string; mobile: string; entity: string; details: string; recipient_person?: string; official_stamp?: boolean }
export function validLetterRequest(request: LetterRequest): boolean {
  return [request.full_name, request.national_id, request.mobile, request.entity, request.details].every(value => value.trim().length > 0);
}