import { Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ContentBox from './ui/ContentBox';
import InputBox from './ui/forms/InputBox';
import Alert from './ui/svg/Alert';

interface ISentryErrorFallback {
  error: Error;
  componentStack: string | null;
  eventId: string | null;
  resetError(): void;
}

// @todo replace classnames with chakra-ui component properties
export function ErrorFallback({}: ISentryErrorFallback) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col bg-fixed bg-image-pattern bg-cover h-screen items-center justify-center">
      <div className="w-fit">
        <ContentBox>
          <InputBox>
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2 items-center text-lg ">
                <Alert />
                <div className="text-gray-25 text-mono">Oops!</div>
              </div>
              <div className="text-gray-50 text-mono">{t('errorSentryFallback')}</div>
              <Button
                my="0.5rem"
                w="full"
                onClick={() => window.location.reload()}
              >
                {t('reload')}
              </Button>
            </div>
          </InputBox>
        </ContentBox>
      </div>
    </div>
  );
}
