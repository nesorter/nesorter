import { createRadioServiceModule } from '@/radio-service/utils/createRadioServiceModule';

export const getInstance = () => {
  if (!global['radioService']) {
    global['radioService'] = createRadioServiceModule();
    global['radioService'].init();

    return global['radioService'];
  }

  return global['radioService'];
};
