export type WithDefaultPageProps<T = Record<string, unknown>> = {
  clientAdminToken: string | null;
  adminSide: boolean;
} & T;
