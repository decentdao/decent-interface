import { cssVar } from '@chakra-ui/theme-tools';

const $arrowBg = cssVar('popper-arrow-bg');

export default {
  baseStyle: {
    maxW: '20rem',
    borderRadius: '4px',
    backgroundColor: 'neutral-9',
    padding: '0.25rem 0.5rem',
    color: 'black-0',
    [$arrowBg.variable]: 'black-0',
  },
};
