import { useCallback, useRef, useState } from 'react';
import { Id, toast } from 'react-toastify';
import { logError } from '../../helpers/errorLogging';

interface AsyncRequestParams {
  asyncFunc: () => Promise<any>;
  pendingMessage: string;
  failedMessage: string;
  successMessage: string;
  failedCallback?: () => void;
  successCallback?: (...arg: any) => void;
  completedCallback?: () => void;
}

export const useAsyncRequest = () => {
  const toastRef = useRef<Id>();
  const [pending, setPending] = useState(false);
  const asyncRequestFunc = useCallback(
    async ({
      asyncFunc,
      pendingMessage,
      failedMessage,
      successMessage,
      failedCallback,
      successCallback,
      completedCallback,
    }: AsyncRequestParams) => {
      try {
        toastRef.current = toast(pendingMessage, {
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false,
          progress: 1,
        });
        setPending(true);
        const response = await asyncFunc();
        if (!!response) {
          toast(successMessage);
          if (successCallback) successCallback(response);
          toast.dismiss(toastRef.current);
        } else {
          toast.error(failedMessage);
          if (failedCallback) failedCallback();
        }
        if (completedCallback) completedCallback();
        setPending(false);
      } catch (e) {
        toast.dismiss(toastRef.current);
        logError(e);
        setPending(false);
      }
    },
    []
  );

  return [asyncRequestFunc, pending] as const;
};
