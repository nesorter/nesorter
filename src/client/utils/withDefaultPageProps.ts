import axios from 'axios';
import { GetServerSideProps } from 'next';

import { WithDefaultPageProps } from '@/client/types/DefaultPageProps';
import { Chain } from '@/radio-service/types/Scanner';
import { ServiceStatus } from '@/radio-service/types/ServiceStatus';

export const withDefaultPageProps =
  (wrappedGSSP?: GetServerSideProps): GetServerSideProps<WithDefaultPageProps> =>
  async (ctx) => {
    const wrappedSSP = (wrappedGSSP ? await wrappedGSSP(ctx) : { props: {} }) as {
      props: Record<string, unknown>;
    };

    const radioStatusRaw = await axios.get<ServiceStatus>('http://localhost:3000/api/status');
    const radioStatus = radioStatusRaw.data;

    const chainRaw = await axios.get<Chain>('http://localhost:3000/api/scanner/chain');
    const chain = Object.values(chainRaw.data);

    const clientAdminToken: string | null = ctx.req.cookies['nesorter-admin-token'] || null;
    const props: WithDefaultPageProps = {
      adminSide: true,
      clientAdminToken,
      chain,
      radioStatus,
      version: process.env.npm_package_version || 'unknown',
    };

    return {
      props: {
        ...props,
        ...(wrappedSSP.props || {}),
      },
    };
  };
