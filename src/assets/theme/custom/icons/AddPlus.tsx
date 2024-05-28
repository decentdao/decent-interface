import { ComponentWithAs, createIcon, IconProps } from '@chakra-ui/react';

export const AddPlus: ComponentWithAs<'svg', IconProps> = createIcon({
  displayName: 'AddPlus',
  path: (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#cpAddPlus)">
        <path
          d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="cpAddPlus">
          <path
            fill="#fff"
            d="M0 0h24v24H0z"
          />
        </clipPath>
      </defs>
    </svg>
  ),
  viewBox: '0 0 24 24',
});
