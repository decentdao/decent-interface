import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { BaseBox } from './BaseBox';

export function InfoBox({
  minWidth = '100%',
  minHeight = '10.5rem',
  children,
  to,
  ...rest
}: {
  minHeight?: string;
  minWidth?: { [key: string]: string } | string;
  m?: string | number;
  to?: string;
  children: ReactNode;
}) {
  const { push } = useRouter();
  return (
    <BaseBox
      cursor={to ? 'pointer' : undefined}
      onClick={
        to
          ? () => {
              push(to);
            }
          : undefined
      }
      minWidth={minWidth}
      h="100%"
      minHeight={minHeight}
      {...rest}
    >
      {children}
    </BaseBox>
  );
}
