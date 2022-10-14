import { useTranslation } from 'react-i18next';
import ContentBox from './ui/ContentBox';
import { PrimaryButton } from './ui/forms/Button';
import InputBox from './ui/forms/InputBox';
import Alert from './ui/svg/Alert';

interface ISentryErrorFallback {
  error: Error;
  componentStack: string | null;
  eventId: string | null;
  resetError(): void;
}

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
              <PrimaryButton
                label={t('reload')}
                className="my-2 w-full"
                onClick={() => window.location.reload()}
              />
            </div>
          </InputBox>
        </ContentBox>
      </div>
    </div>
  );
}
