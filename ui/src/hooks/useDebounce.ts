export const useDebounce = <T extends (...args: any) => void>(
  delay: number,
  cb: T,
): T => {
  let timeout: number;

  return ((args: any) => {
    clearTimeout(timeout);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    timeout = setTimeout(() => cb(args), delay);
  }) as T;
};
