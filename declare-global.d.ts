import type { RadioServiceModule } from '@/radio-service/main';

declare global {
  // eslint-disable-next-line no-var
  var radioService: RadioServiceModule;
}
