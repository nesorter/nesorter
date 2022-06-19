function createUrl(path: string, urlParams?: Record<string, string | number | string[] | number[]>): URL {
  const url = new URL(path);

  if (urlParams) {
    Object.entries(urlParams)
      .forEach(([paramKey, paramValue]) => {
        // TODO: обработка массивов
        url.searchParams.set(paramKey, String(paramValue));
      });
  }

  return url;
}

export async function get<Response>(path: string, urlParams?: Record<string, string | number | string[] | number[]>): Promise<Response> {
  const url = createUrl(path, urlParams);
  return fetch(url.toString()).then(_ => _.json() as unknown as Response);
}

export async function post<Response>(path: string, data: unknown, urlParams?: Record<string, string | number>): Promise<Response> {
  const url = createUrl(path, urlParams);
  return fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  }).then(_ => _.json() as unknown as Response);
}

export async function put<Response>(path: string, data: unknown, urlParams?: Record<string, string | number>): Promise<Response> {
  const url = createUrl(path, urlParams);
  return fetch(url.toString(), {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  }).then(_ => _.json() as unknown as Response);
}

// TODO: POST & PATCH
