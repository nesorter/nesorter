export function makeSafePath(path: string): string {
  return path
    .replaceAll(' ', '\\ ')
    .replaceAll(`'`, `\\'`)
    .replaceAll(`&`, `\\&`)
    .replaceAll(`;`, `\\;`)
    .replaceAll('[', '\\[')
    .replaceAll(']', '\\]')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')
    .replaceAll('>', '\\>')
    .replaceAll('｜', '\\｜')
    .replaceAll('⧸', '\\⧸')
    .replaceAll('|', '\\|')
    .replaceAll('/', '\\/')
    .replaceAll('$', '\\$')
    .replaceAll(',', '\\,');
}
