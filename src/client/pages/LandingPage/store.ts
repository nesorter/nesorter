import { differenceInSeconds, endOfDay, secondsInDay } from 'date-fns';
import { map, onMount } from 'nanostores';

import { api } from '@/client/api';
import type { ChainItem, QueueItem, ServiceStatus } from '@/radio-service/types';

const currentSecondsFromDayStart = () => {
  return secondsInDay - differenceInSeconds(endOfDay(new Date()), new Date());
};

export type TStoreLandingPage = {
  status?: ServiceStatus;
  chain: ChainItem[];

  currentSeconds: number;
  currentChainItem?: ChainItem;
  currentQueueItem?: QueueItem;

  audio?: HTMLAudioElement;
  isPlaying: boolean;
  isFetching: boolean;
  isSimulating: boolean;
};

export const StoreLandingPage = map<TStoreLandingPage>({
  status: undefined,
  chain: [],

  currentSeconds: currentSecondsFromDayStart(),
  currentChainItem: undefined,
  currentQueueItem: undefined,

  audio: typeof window === 'undefined' ? undefined : new Audio(),
  isPlaying: false,
  isFetching: true,
  isSimulating: false,
});

export const setIsPlaying = (flag: boolean) => {
  StoreLandingPage.setKey('isPlaying', flag);
};

export const setIsSimulating = (flag: boolean) => {
  StoreLandingPage.setKey('isSimulating', flag);
};

export const setCurrentSeconds = (seconds: number) => {
  StoreLandingPage.setKey('currentSeconds', seconds);
};

export const handleVolume = (volume: number) => {
  const { audio } = StoreLandingPage.get();

  if (audio) {
    audio.volume = volume / 100;
  }
};

export const handleStopPlay = () => {
  const { audio } = StoreLandingPage.get();

  if (audio) {
    audio.src = '';
    setIsPlaying(false);
  }
};

export const handleStartPlay = () => {
  const { audio, status, isSimulating, currentSeconds, currentQueueItem, currentChainItem } =
    StoreLandingPage.get();

  if (audio) {
    if (status?.streaming) {
      audio.src = `${status?.steamUrl || ''}?no-cache=${Date.now()}`;
      audio.play().catch(console.log);
    } else if (isSimulating) {
      audio.src = api.scanner.getFileAsPath(currentChainItem?.fsItem?.filehash || '');
      const seekTo = currentSeconds - Number(currentQueueItem?.startAt);
      audio.fastSeek(seekTo > 0 ? (seekTo < Number(currentQueueItem?.endAt) ? seekTo : 0) : 0);
      audio.play().catch(console.log);
    }

    setIsPlaying(true);
  }
};

const loopStatus = async () => {
  const status = await api.logger.getStatus().then((_) => _.data);
  StoreLandingPage.setKey('status', status);
  StoreLandingPage.setKey('isSimulating', status.streaming !== true);

  const rawCQI = status?.queue?.items?.find((_) => _.fileHash === status?.currentFile);
  const { currentQueueItem, chain, isPlaying, isSimulating, audio, currentSeconds } =
    StoreLandingPage.get();

  if (currentQueueItem?.fileHash !== rawCQI?.fileHash) {
    StoreLandingPage.setKey('currentQueueItem', rawCQI);

    const currentChainItem = chain?.find((_) => _.fsItem?.filehash === status?.currentFile);
    StoreLandingPage.setKey('currentChainItem', currentChainItem);

    if (isPlaying && isSimulating && audio) {
      audio.pause();
      audio.src = api.scanner.getFileAsPath(currentChainItem?.fsItem?.filehash || '');
      const seekTo = currentSeconds - Number(rawCQI?.startAt);
      audio.fastSeek(seekTo > 0 ? (seekTo < Number(rawCQI?.endAt) ? seekTo : 0) : 0);
      audio.play().catch(console.log);
    }
  }

  setTimeout(() => loopStatus(), 5000);
};

const initStore = async () => {
  const chainRaw = await api.scanner.getChain().then((_) => _.data);
  const chain = Object.values(chainRaw);
  StoreLandingPage.setKey('chain', chain);

  console.log('Init store');

  await loopStatus();
};

onMount(StoreLandingPage, () => {
  if (typeof window === 'undefined') {
    return;
  }

  initStore()
    .catch(console.error)
    .finally(() => {
      StoreLandingPage.setKey('isFetching', false);
    });

  const timer = setInterval(() => {
    setCurrentSeconds(currentSecondsFromDayStart());
  }, 500);

  return () => clearInterval(timer);
});
