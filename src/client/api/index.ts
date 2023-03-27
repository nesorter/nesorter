import type { PlaylistItem } from '@prisma/client';
import axios from 'axios';

import type { DtoCreateCategory, DtoUpsertCategory } from '@/radio-service/types/ApisDtos';
import type { DtoUpsertFileItem } from '@/radio-service/types/ApisDtos';
import type { AggregatedClassCategory } from '@/radio-service/types/Classificator';
import type { AggregatedPlaylistItem } from '@/radio-service/types/Playlist';
import type { DtoUpdatePlaylist } from '@/radio-service/types/Playlist';
import type { AggregatedFileItem, Chain } from '@/radio-service/types/Scanner';
import type { AggregatedScheduleItem } from '@/radio-service/types/Scheduler';
import type { ServiceStatus } from '@/radio-service/types/ServiceStatus';

export const request = axios.create({
  baseURL: typeof window === 'undefined' ? 'http://localhost:3001' : '/',
  headers: {
    token:
      typeof window === 'undefined'
        ? process.env.ADMIN_TOKEN
        : localStorage.getItem('nesorter-admin-token') || '',
  },
});

export const api = {
  logger: {
    /**
     * Gives status
     */
    getStatus() {
      return request.get<ServiceStatus>('/api/status');
    },

    /**
     * Restarts service
     */
    restart() {
      return request.post('/api/restart', {});
    },
  },

  scheduler: {
    /**
     * Startups scheduler
     */
    start() {
      return request.post('/api/scheduler/start');
    },

    /**
     * Stops scheduler
     */
    stop() {
      return request.post('/api/scheduler/stop');
    },

    /**
     * Gives schedules
     */
    getItems() {
      return request.get<AggregatedScheduleItem[]>('/api/scheduler/items');
    },

    /**
     * Creates schedule
     */
    createItem(name: string, start: number, end: number, playlistIds: string) {
      return request.post('/api/scheduler', { name, start, end, playlistIds });
    },

    /**
     * Updates schedule
     */
    updateItem(
      itemId: number | string,
      data: {
        startAt: number;
        endAt: number;
        playlistIds: string;
        withMerging: number;
        name: string;
      },
    ) {
      return request.post(`/api/scheduler/${itemId}`, { id: itemId, data });
    },

    /**
     * Delete schedule
     */
    deleteItem(itemId: number | string) {
      return request.delete(`/api/scheduler/${itemId}`);
    },
  },

  categories: {
    /**
     * Returns category
     */
    get() {
      return request.get<AggregatedClassCategory[]>('/api/classificator/categories');
    },

    /**
     * Create category
     */
    create(data: DtoCreateCategory) {
      return request.post('/api/classificator/categories', data);
    },

    /**
     * Updates category
     */
    update(data: DtoUpsertCategory) {
      return request.post(`/api/classificator/category/${data.id}`, data);
    },

    /**
     * Gives FileItem with classification
     * @param filehash
     */
    getTrackData(filehash: string) {
      return request.get<AggregatedFileItem>(`/api/classificator/item/${filehash}`);
    },

    /**
     * Updates FileItem classification
     * @param filehash
     * @param data
     */
    updateTrackData(filehash: string, data: DtoUpsertFileItem) {
      return request.post(`/api/classificator/item/${filehash}`, data);
    },
  },

  scanner: {
    /**
     * Starts FS sync
     */
    startSync() {
      return request.post<string>('/api/scanner/sync');
    },

    /**
     * Returns Chain
     */
    getChain() {
      return request.get<Chain>('/api/scanner/chain');
    },

    /**
     * Returns FileItem
     */
    getFsItem(filehash: string) {
      return request.get<AggregatedFileItem>(`/api/scanner/fsitem/${filehash}`);
    },

    /**
     * Updates track trim
     */
    setTrim(filehash: string, start: number, end: number) {
      return request.post(`/api/scanner/fsitem/trim/${filehash}`, { start, end });
    },

    /**
     * Returns track waveform
     */
    getWaveform(filehash: string) {
      return request.get<number[]>(`/api/scanner/waveform/${filehash}`);
    },

    /**
     * Returns URI to track
     */
    getFileAsPath(filehash: string) {
      return `/api/scanner/plainfile/${filehash}`;
    },

    /**
     * Returns URI to album
     */
    getFileImageAsPath(filehash: string) {
      return `/api/scanner/image/${filehash}`;
    },
  },

  playlistsManager: {
    /**
     * Gives playlists list
     */
    getPlaylists() {
      return request.get<AggregatedPlaylistItem[]>('/api/playlistsManager/queues');
    },

    /**
     * Creates playlist
     */
    createPlaylist(name: string, type: 'manual' | 'fs', filehash?: string) {
      return request.post('/api/playlistsManager/queues', { name, type, filehash });
    },

    /**
     * Gives playlist
     */
    getPlaylist(id: string | number) {
      return request.get<PlaylistItem[]>(`/api/playlistsManager/queue/${id}`);
    },

    /**
     * Updates playlist
     */
    updatePlaylist(id: string | number, dto: DtoUpdatePlaylist) {
      return request.post(`/api/playlistsManager/queue/${id}`, dto);
    },

    /**
     * Deletes playlist
     */
    deletePlaylist(id: string | number) {
      return request.delete(`/api/playlistsManager/queue/${id}`);
    },
  },

  streamer: {
    /**
     * Stops ffmpeg-stream to icecast
     */
    stopStream() {
      return request.post('/api/playlistsManager/streamStop', {});
    },

    /**
     * Runs ffmpeg-stream to icecast
     */
    startStream() {
      return request.post('/api/playlistsManager/streamStart', {});
    },
  },

  player: {
    /**
     * Starts queue
     */
    play() {
      return request.post('/api/player/play', {});
    },

    /**
     * Stops queue
     */
    stop() {
      return request.post('/api/player/stop', {});
    },

    /**
     * Clears queue
     */
    clear() {
      return request.post('/api/player/clear', {});
    },

    /**
     * Queues all playlists in random
     */
    playRandom() {
      return request.post('/api/player/helper/random', {});
    },

    /**
     * Adds playlist into queue
     */
    playPlaylist(id: number) {
      return request.post(`/api/player/helper/playlist/${id}`, {});
    },
  },
};
