import type { RadioServiceModule } from '@/radio-service/utils/createRadioServiceModule';

declare global {
  // eslint-disable-next-line no-var
  var radioService: RadioServiceModule;
}
