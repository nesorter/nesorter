import { useEffect, useState } from "react";
import { QueueItem, QueueType } from "./types";

export const useQueues = () => {
  const [queues, setQueues] = useState<QueueType[]>([]);
  const [items, setItems] = useState<Record<string, QueueItem[]>>({});

  const init = async () => {
    const queuesList = (
      await fetch('/api/queues')
        .then(r => r.json() as unknown as QueueType[])
        .then(r => {
          setQueues(r);
          return r;
        })
        .catch(console.error)
    ) || [];

    const result = [];

    for (const queue of queuesList) {
      result.push([
        queue.id,
        await fetch(`/api/queue?id=${queue.id}`).then(r => r.json() as unknown as QueueItem[])
      ]);
    }

    setItems(Object.fromEntries(result));
  };

  const createQueue = async (name: string, type: 'manual' | 'smart') => {
    await fetch('/api/createQueue', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: name, name }),
    }).then(console.log).catch(console.error);

    await init();
  };

  const addInQueue = async (id: string, filename: string) => {
    await fetch('/api/addInQueue', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, filename }),
    }).then(console.log).catch(console.error);

    await init();
  };

  const stream = async (queueId: string) => {
    await fetch(`/api/queue/stream?queueId=${queueId}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: '',
    }).then(console.log).catch(console.error);
  };

  useEffect(() => {
    init();
  }, []);

  return { queues, items, createQueue, addInQueue, init, stream };
};
