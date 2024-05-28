import { ComponentWithAs, createIcon, IconProps } from '@chakra-ui/react';

export const Check: ComponentWithAs<'svg', IconProps> = createIcon({
  displayName: 'Check',
  viewBox: '0 0 24 24',
  path: (
    <path
      d="m10 15.171 9.193-9.192 1.415 1.414L10 18l-6.364-6.364 1.414-1.414 4.95 4.95Z"
      fill="currentColor"
    />
  ),
});
