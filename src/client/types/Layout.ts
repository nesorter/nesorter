import { ComponentType, PropsWithChildren } from 'react';

import { WithDefaultPageProps } from '@/client/types/DefaultPageProps';

export type WithLayout<T> = T & { Layout: Layout; Title: string };
export type Layout = ComponentType<PropsWithChildren<WithDefaultPageProps>>;
