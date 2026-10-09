export function shouldSendOnKey(key: string, shiftKey: boolean, composing = false): boolean {
  return key === "Enter" && !shiftKey && !composing;
}
export interface LetterRequest { full_name: string; national_id: string; mobile: string; entity: string; details: string }
export function validLetterRequest(request: LetterRequest): boolean {
  return Object.values(request).every(value => value.trim().length > 0);
}