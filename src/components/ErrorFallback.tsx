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

export function ErrorFallback({ error }: ISentryErrorFallback) {
  return (
    <div className="flex flex-col bg-fixed bg-image-pattern bg-cover h-screen justify-center">
      <div className="container">
        <ContentBox>
          <div className="flex gap-2 items-center">
            <Alert />
            <div className="text-gray-25">Oops!</div>
          </div>
          <div className="text-sm text-gray-50 text-mono">There was an unexpected error</div>
          <InputBox>
            <div className="text-md text-gray-25 text-mono">{error.message}</div>
          </InputBox>
          <div>
            <PrimaryButton
              label="Reload"
              className="my-2"
              onClick={() => window.location.reload()}
            />
          </div>
        </ContentBox>
      </div>
    </div>
  );
}
