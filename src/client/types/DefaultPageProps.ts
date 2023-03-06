export type WithDefaultPageProps<T = Record<string, unknown>> = {
  clientAdminToken: string | null;
  adminSide: boolean;
  version: string;
} & T;
