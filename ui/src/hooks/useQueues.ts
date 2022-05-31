import { useEffect, useState } from "react";
import { QueueItem, QueueType } from "./types";

export const useQueues = () => {
  const [queues, setQueues] = useState<QueueType[]>([]);
  const [items, setItems] = useState<Record<string, QueueItem[]>>({});

  const init = async () => {
    const queuesList = (
      await fetch('/api/queuesManager/queues')
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
        await fetch(`/api/queuesManager/queue/${queue.id}`).then(r => r.json() as unknown as QueueItem[])
      ]);
    }

    setItems(Object.fromEntries(result));
  };

  const createQueue = async (name: string, type: 'manual' | 'smart') => {
    await fetch('/api/queuesManager/queues', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, type }),
    }).then(console.log).catch(console.error);

    await init();
  };

  const addInQueue = async (id: number, filehash: string) => {
    await fetch(`/api/queuesManager/queue/${id}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...(items[id] || []), { queueId: id, filehash, order: items[id].at(-1)?.order || 0 }]),
    }).then(console.log).catch(console.error);

    await init();
  };

  const stream = async (queueId: number) => {
    await fetch(`/api/queuesManager/queue/${queueId}/stream`, {
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
