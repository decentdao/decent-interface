import { ComponentWithAs, createIcon, IconProps } from '@chakra-ui/react';

export const Alert: ComponentWithAs<'svg', IconProps> = createIcon({
  displayName: 'Alert',
  viewBox: '0 0 24 24',
  path: (
    <path
      d="m12.823 3.486 9.05 16.055a.991.991 0 0 1-.348 1.329.933.933 0 0 1-.475.13H2.95a.933.933 0 0 1-.475-.13.962.962 0 0 1-.348-.357.991.991 0 0 1 0-.973l9.05-16.054a.962.962 0 0 1 .348-.356.933.933 0 0 1 .95 0 .962.962 0 0 1 .348.356ZM4.595 19.054h14.81L12 5.919 4.595 19.054Zm6.455-2.919h1.9v1.946h-1.9v-1.946Zm0-6.81h1.9v4.864h-1.9V9.324Z"
      fill="currentColor"
    />
  ),
});
