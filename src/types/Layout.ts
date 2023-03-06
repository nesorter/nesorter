import { ComponentType, PropsWithChildren } from 'react';

import { WithDefaultPageProps } from '@/types/DefaultPageProps';

export type WithLayout<T> = T & { Layout: Layout };
export type Layout = ComponentType<PropsWithChildren<WithDefaultPageProps>>;
