import { PlaylistItem } from '@prisma/client';
import axios from 'axios';

// import config from '@/radio-service/lib/config';
import type { DtoUpdatePlaylistItem, DtoUpsertCategory } from '@/radio-service/types/ApisDtos';
import type { AggregatedClassCategory } from '@/radio-service/types/Classificator';
import type { AggregatedPlaylistItem } from '@/radio-service/types/Playlist';
import type { AggregatedFileItem, Chain } from '@/radio-service/types/Scanner';
import type { AggregatedScheduleItem } from '@/radio-service/types/Scheduler';
import type { ServiceStatus } from '@/radio-service/types/ServiceStatus';

const request = axios.create({
  baseURL: typeof window === 'undefined' ? 'http://localhost:3001' : '/api',
  headers: {
    token: typeof window === 'undefined' ? '' : localStorage.getItem('nesorter-admin-token') || '',
  },
});

export const api = {
  logger: {
    getStatus() {
      return request.get<ServiceStatus>('/api/status');
    },

    restart() {
      return request.post('/api/restart', {});
    },
  },

  scheduler: {
    /**
     * Запускает шедулер
     */
    start() {
      return request.get('/api/scheduler/start');
    },

    /**
     * Останавливает шедулер
     */
    stop() {
      return request.get('/api/scheduler/stop');
    },

    /**
     * Отдает расписание
     */
    getItems() {
      return request.get<AggregatedScheduleItem[]>('/api/scheduler/items');
    },

    /**
     * Создает айтем в расписании
     */
    createItem(start: number, end: number, playlistIds: string) {
      return request.post('/api/scheduler', { start, end, playlistIds });
    },

    /**
     * Обновляет айтем расписания
     */
    updateItem(
      itemId: number | string,
      data: { startAt: number; endAt: number; playlistIds: string; withMerging: number },
    ) {
      return request.post(`/api/scheduler/${itemId}`, { id: itemId, data });
    },

    /**
     * Удаляет айтем в расписании
     */
    deleteItem(itemId: number | string) {
      return request.delete(`/api/scheduler/${itemId}`);
    },
  },

  categories: {
    /**
     * Возвращает категории
     */
    get() {
      return request.get<AggregatedClassCategory[]>('/api/classificator/categories');
    },

    /**
     * Создает категорию
     */
    create(data: DtoUpsertCategory) {
      return request.post('/api/classificator/categories', data);
    },

    /**
     * Обновляет категорию
     */
    update(data: DtoUpsertCategory) {
      return request.put('/api/classificator/categories', data);
    },
  },

  scanner: {
    /**
     * Запускает синхронизацию файликов в БД
     */
    startSync() {
      return request.get<string>('/api/scanner/sync');
    },

    /**
     * Возвращает связный список файлов и директорий
     */
    getChain() {
      return request.get<Chain>('/api/scanner/chain');
    },

    /**
     * Возвращает данные трека
     */
    getFsItem(filehash: string) {
      return request.get<AggregatedFileItem>(`/api/scanner/fsitem/${filehash}`);
    },

    /**
     * Задает тримминг трека (срезка начальных и конечных моментов трека)
     */
    setTrim(filehash: string, start: number, end: number) {
      return request.post(`/api/scanner/fsitem/trim/${filehash}`, { start, end });
    },

    /**
     * Возвращает waveform трека
     */
    getWaveform(filehash: string) {
      return request.get<number[]>(`/api/scanner/waveform/${filehash}`);
    },

    /**
     * Возвращает строку-путь до файла (это чтобы прям файл GET-методом получить)
     */
    getFileAsPath(filehash: string) {
      return `/api/scanner/plainfile/${filehash}`;
    },

    /**
     * Возвращает строку-путь до файла-картинки
     */
    getFileImageAsPath(filehash: string) {
      return `/api/scanner/image/${filehash}`;
    },
  },

  playlistsManager: {
    /**
     * Возвращает список плейлистов
     */
    getPlaylists() {
      return request.get<AggregatedPlaylistItem[]>('/api/playlistsManager/queues');
    },

    /**
     * Создаёт плейлист
     */
    createPlaylist(name: string, type: 'manual' | 'fs', filehash?: string) {
      return request.post('/api/playlistsManager/queues', { name, type, filehash });
    },

    /**
     * Возвращает плейлист
     */
    getPlaylist(id: string | number) {
      return request.get<PlaylistItem[]>(`/api/playlistsManager/queue/${id}`);
    },

    /**
     * Перезаписывает содержимое плейлиста
     */
    updatePlaylist(id: string | number, items: DtoUpdatePlaylistItem) {
      return request.post(`/api/playlistsManager/queue/${id}`, items);
    },

    /**
     * Удаляет плейлист
     */
    deletePlaylist(id: string | number) {
      return request.delete(`/api/playlistsManager/queue/${id}`);
    },
  },

  streamer: {
    /**
     * Останавливает ffmpeg-стрим на icecast
     */
    stopStream() {
      return request.post('/api/playlistsManager/streamStop', {});
    },

    /**
     * Запускает ffmpeg-стрим на icecast
     */
    startStream() {
      return request.post('/api/playlistsManager/streamStart', {});
    },
  },

  player: {
    /**
     * Запускает queue
     */
    play() {
      return request.post('/api/player/play', {});
    },

    /**
     * Стопит queue
     */
    stop() {
      return request.post('/api/player/stop', {});
    },

    /**
     * Очищает queue
     */
    clear() {
      return request.post('/api/player/clear', {});
    },

    /**
     * Включает режим рандомных плейлистов в queue
     */
    playRandom() {
      return request.post('/api/player/helper/random', {});
    },

    /**
     * Включает плейлист в queue
     */
    playPlaylist(id: number) {
      return request.post(`/api/player/helper/playlist/${id}`, {});
    },
  },
};
