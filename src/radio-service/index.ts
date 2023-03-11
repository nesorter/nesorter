import { createRadioServiceModule } from '@/radio-service/main';

export const getInstance = () => {
  if (typeof window !== 'undefined') {
    return null;
  }

  if (!global['radioService']) {
    global['radioService'] = createRadioServiceModule();
    return global['radioService'];
  }

  return global['radioService'];
};
