import * as Sentry from '@sentry/react';
import { JSXElementConstructor, ReactElement } from 'react';

export function ErrorBoundary({
  children,
  fallback,
  showDialog,
}: {
  children: React.ReactNode;
  fallback?: ReactElement<any, string | JSXElementConstructor<any>> | Sentry.FallbackRender;
  showDialog?: boolean;
}) {
  return (
    <Sentry.ErrorBoundary
      fallback={fallback}
      showDialog={showDialog}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
