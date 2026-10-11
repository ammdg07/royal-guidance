export function letterProtection(paid: boolean) {
  return { watermarked: !paid, selectable: paid, canExport: paid };
}