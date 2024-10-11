import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
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
  const toastRef = useRef<string | number>();
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
        toastRef.current = toast.loading(pendingMessage, {
          duration: Infinity,
        });
        setPending(true);
        const response = await asyncFunc();
        if (!!response) {
          toast.success(successMessage, { id: toastRef.current });
          if (successCallback) successCallback(response);
        } else {
          toast.error(failedMessage, { id: toastRef.current });
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
    [],
  );

  return [asyncRequestFunc, pending] as const;
};
