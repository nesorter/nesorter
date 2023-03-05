import { NestedApi } from '@/radio-service/NestedApi';

declare global {
  var nestedApi: NestedApi;
}

export const getApi = () => {
  if (typeof window !== 'undefined') {
    return null;
  }

  if (!global['nestedApi']) {
    global['nestedApi'] = new NestedApi();
    global['nestedApi'].bindRoutes();

    return global['nestedApi'];
  } else {
    return global['nestedApi'];
  }
};

export const config = {
  runtime: 'nodejs',
};
