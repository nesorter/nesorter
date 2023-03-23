export function makeArrayRange(num: number): number[] {
  return Array(num)
    .fill(0)
    .map((_, i) => i);
}
