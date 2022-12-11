import React, { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
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
      let toastId: React.ReactText;
      try {
        toastId = toast(pendingMessage, {
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
          toast.dismiss(toastId);
        } else {
          toast.error(failedMessage);
          if (failedCallback) failedCallback();
        }
        if (completedCallback) completedCallback();
        setPending(false);
      } catch (e) {
        toast.dismiss();
        logError(e);
        setPending(false);
      }
    },
    []
  );

  return [asyncRequestFunc, pending] as const;
};
