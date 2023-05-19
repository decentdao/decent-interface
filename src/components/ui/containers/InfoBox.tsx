import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { StyledBox } from './StyledBox';

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
    <StyledBox
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
    </StyledBox>
  );
}
