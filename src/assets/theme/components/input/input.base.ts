import { inputAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle } = createMultiStyleConfigHelpers(inputAnatomy.keys);

const disabled = {
  cursor: 'default',
  bg: 'rgba(22, 18, 25, 0.16)',
  border: '1px solid',
  borderColor: 'white-alpha-16',
  color: 'neutral-6',
  _placeholder: {
    color: 'neutral-5',
  },
  boxShadow: 'unset',
};

const invalid = {
  borderColor: 'red-0',
  bg: 'red--3',
  color: 'red-1',
  _placeholder: {
    color: 'red-0',
  },
};

const loading = {};

const baseStyle = definePartsStyle({
  field: {
    borderRadius: '4px',
    color: 'white-0',
    bg: 'neutral-1',
    boxShadow: '0px 1px 0px 0px rgba(255, 255, 255, 0.16), 0px 0px 0px 1px rgba(0, 0, 0, 0.68)',
    transitionDuration: 'normal',
    transitionProperty: 'common',
    width: '100%',
    _invalid: invalid,
    _placeholder: {
      color: 'neutral-5',
    },
    _active: {
      boxShadow:
        '0px 0px 0px 2px #534D58, 0px 1px 0px 0px rgba(255, 255, 255, 0.20), 0px 0px 0px 1px rgba(0, 0, 0, 0.80)',
      _disabled: {
        ...disabled,
        _loading: loading,
      },
    },
    _hover: {
      boxShadow: '0px 1px 0px 0px rgba(255, 255, 255, 0.24), 0px 0px 0px 1px rgba(0, 0, 0, 0.80)',
      _disabled: {
        ...disabled,
        _loading: loading,
      },
      _invalid: {
        ...invalid,
        borderColor: 'red-1',
      },
    },
    _disabled: {
      ...disabled,
      _loading: loading,
    },
    _focus: {
      outline: 'none',
      boxShadow:
        '0px 0px 0px 2px #534D58, 0px 1px 0px 0px rgba(255, 255, 255, 0.20), 0px 0px 0px 1px rgba(0, 0, 0, 0.80)',
      _invalid: invalid,
      _disabled: {
        ...disabled,
        _loading: loading,
      },
    },
  },
});

export default baseStyle;
