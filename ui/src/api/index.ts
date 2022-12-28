import { delete_, get, post, put } from "./methods";
import {
  Chain,
  ClassificatedItem,
  ClassificationCategory,
  CreateCategoryDTO,
  FSItem,
  GetClassifiedFiltersDTO,
  ManualPlaylistItem,
  Playlist,
  SchedulerItem,
  Status,
  UpdateCategoryDTO,
  UpdatePlaylistItemDto
} from "./types";

export const api = {
  logger: {
    /**
     * Возвращает логи. Пока не работает
     */
    getLogs() {
      return get<never[]>('/api/logger');
    },

    getStatus() {
      return get<Status>('/api/status');
    },
  },

  scheduler: {
    /**
     * Запускает шедулер
     */
    start() {
      return get('/api/scheduler/start');
    },

    /**
     * Останавливает шедулер
     */
    stop() {
      return get('/api/scheduler/stop');
    },

    /**
     * Отдает расписание
     */
    getItems() {
      return get<SchedulerItem[]>('/api/scheduler/items');
    },

    /**
     * Создает айтем в расписании
     */
    createItem(start: number, end: number, playlistIds: string) {
      return post('/api/scheduler', { start, end, playlistIds });
    },

    /**
     * Обновляет айтем расписания
     */
    updateItem(itemId: number | string, data: { startAt: number, endAt: number, playlistIds: string }) {
      return post(`/api/scheduler/${itemId}`, { id: itemId, data });
    },

    /**
     * Удаляет айтем в расписании
     */
    deleteItem(itemId: number | string) {
      return delete_(`/api/scheduler/${itemId}`);
    },
  },

  categories: {
    /**
     * Возвращает категории
     */
    get() {
      return get<ClassificationCategory[]>('/api/classificator/categories');
    },

    /**
     * Создает категорию
     */
    create(data: CreateCategoryDTO) {
      return post('/api/classificator/categories', data);
    },

    /**
     * Обновляет категорию
     */
    update(data: UpdateCategoryDTO) {
      return put('/api/classificator/categories', data);
    }
  },

  classificator: {
    /**
     * Возвращает список всех отсортированных треков
     * @param filters - объект, где ключ -- это _имя_ категории, а значение это массив тегов в категории по которым будет производиться фильтрация
     */
    getClassifiedList(filters?: GetClassifiedFiltersDTO) {
      return get<ClassificatedItem[]>('/api/classificator/items', filters || {});
    },

    /**
     * Возвращает категории для трека
     */
    getClassifiedCategory(filehash: string) {
      return get<ClassificationCategory[]>(`/api/classificator/item/${filehash}`);
    },

    /**
     * Создает или обновляет категории у трека (перезаписывает)
     */
    setCategories(filehash: string, categories: ClassificationCategory[]) {
      return post(`/api/classificator/item/${filehash}`, { categories });
    }
  },

  scanner: {
    /**
     * Запускает синхронизацию файликов в БД
     */
    startSync() {
      return get<string>('/api/scanner/sync');
    },

    /**
     * Возвращает связный список файлов и директорий
     */
    getChain() {
      return get<Chain>('/api/scanner/chain');
    },

    /**
     * Возвращает данные трека
     */
    getFsItem(filehash: string) {
      return get<FSItem>(`/api/scanner/fsitem/${filehash}`);
    },

    /**
     * Задает тримминг трека (срезка начальных и конечных моментов трека)
     */
    setTrim(filehash: string, start: number, end: number) {
      return post(`/api/scanner/fsitem/trim/${filehash}`, { start, end });
    },

    /**
     * Возвращает waveform трека
     */
    getWaveform(filehash: string) {
      return get<number[]>(`/api/scanner/waveform/${filehash}`);
    },

    /**
     * Возвращает строку-путь до файла (это чтобы прям файл GET-методом получить)
     */
    getFileAsPath(filehash: string) {
      return `/api/scanner/plainfile/${filehash}`;
    },

    /**
     * Возвращает путь до файла-картинки
     */
    getFileImageAsPath(filehash: string) {
      return `/api/scanner/image/${filehash}`;
    },
  },

  playlistsManager: {
    /**
     * Возвращает список плейлистов (без их данных)
     */
    getPlaylists() {
      return get<Playlist[]>('/api/playlistsManager/queues');
    },

    /**
     * Создаёт плейлист
     */
    createPlaylist(name: string, type: 'manual' | 'smart') {
      return post('/api/playlistsManager/queues', { name, type });
    },

    /**
     * Возвращает плейлист
     */
    getPlaylist(id: string | number) {
      return get<ManualPlaylistItem[]>(`/api/playlistsManager/queue/${id}`);
    },

    /**
     * Перезаписывает содержимое плейлиста
     */
    updatePlaylist(id: string | number, items: UpdatePlaylistItemDto) {
      return post(`/api/playlistsManager/queue/${id}`, items);
    },

    /**
     * Удаляет плейлист
     */
    deletePlaylist(id: string | number) {
      return delete_(`/api/playlistsManager/queue/${id}`);
    },
  },

  streamer: {
    /**
     * Останавливает плейлист (не пауза, полный сброс прогресса проигрывания)
     */
    stopPlaylist() {
      return post('/api/playlistsManager/stopPlaylist', {});
    },

    /**
     * Запускает проигрывание плейлиста
     */
    startPlaylist(id: string | number) {
      return post(`/api/playlistsManager/queue/${id}/stream`, {});
    },

    /**
     * Останавливает ffmpeg-стрим на icecast
     */
    stopStream() {
      return post('/api/playlistsManager/streamStop', {});
    },

    /**
     * Запускает ffmpeg-стрим на icecast
     */
    startStream() {
      return post('/api/playlistsManager/streamStart', {});
    },

    startAllPlaylists() {
      return post('/api/playlistManager/playAllPlaylists', {});
    }
  }
};
