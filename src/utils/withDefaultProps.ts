import { GetServerSideProps } from 'next';

export type WithDefaultProps<T = Record<string, unknown>> = {
  clientAdminToken: string | null;
} & T;

export const withDefaultProps =
  (wrappedGSSP?: GetServerSideProps): GetServerSideProps<WithDefaultProps> =>
  async (ctx) => {
    const wrappedSSP = (wrappedGSSP ? await wrappedGSSP(ctx) : { props: {} }) as {
      props: Record<string, unknown>;
    };

    const clientAdminToken: string | null = ctx.req.cookies['nesorter-admin-token'] || null;
    const props: WithDefaultProps = {
      clientAdminToken,
    };

    return {
      props: {
        ...props,
        ...(wrappedSSP.props || {}),
      },
    };
  };
