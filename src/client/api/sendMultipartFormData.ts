export type SendMultipartFormDataParams = {
  url: string;
  form: FormData;
  onUploadProgress?: (progressPercent: number) => void;
};

export type SendMultipartFormDataResponse<T> = Promise<{
  data: T | string;
  xhr: XMLHttpRequest;
}>;

const sendMultipartFormData = <T = unknown>(
  params: SendMultipartFormDataParams,
): SendMultipartFormDataResponse<T> => {
  const { url, form, onUploadProgress } = params;

  // Используем XHR вместо Fetch из-за невозможности последнего трекать прогресс аплоада
  const xhr = new XMLHttpRequest();

  // Сам трекинг прогресса аплоада
  xhr.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable && onUploadProgress) {
      onUploadProgress((event.loaded * 100) / event.total);
    } else if (onUploadProgress) {
      onUploadProgress(0);
    }
  });

  return new Promise((resolve) => {
    xhr.addEventListener('loadend', () => {
      if (xhr.readyState !== 4) {
        return;
      }

      const jsonType = 'application/json';
      const typeHeader = xhr.getResponseHeader('Content-Type');
      const parsedJson = (typeHeader?.includes(jsonType) && JSON.parse(xhr.responseText)) as T;
      resolve({
        data: parsedJson || xhr.responseText,
        xhr,
      });
    });

    xhr.open('POST', url);
    xhr.setRequestHeader('token', localStorage.getItem('nesorter-admin-token') || '');
    xhr.send(form);
  });
};

export default sendMultipartFormData;
