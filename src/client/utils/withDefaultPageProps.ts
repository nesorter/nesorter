import { GetServerSideProps } from 'next';

import { WithDefaultPageProps } from '@/client/types/DefaultPageProps';

export const withDefaultPageProps =
  (wrappedGSSP?: GetServerSideProps): GetServerSideProps<WithDefaultPageProps> =>
  async (ctx) => {
    const wrappedSSP = (wrappedGSSP ? await wrappedGSSP(ctx) : { props: {} }) as {
      props: Record<string, unknown>;
    };

    const clientAdminToken: string | null = ctx.req.cookies['nesorter-admin-token'] || null;
    const props: WithDefaultPageProps = {
      adminSide: true,
      clientAdminToken,
      version: process.env.npm_package_version || 'unknown',
    };

    return {
      props: {
        ...props,
        ...(wrappedSSP.props || {}),
      },
    };
  };
