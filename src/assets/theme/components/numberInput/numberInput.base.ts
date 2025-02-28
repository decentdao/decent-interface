import { numberInputAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { DISABLED_INPUT } from '../../../../constants/common';

const { definePartsStyle } = createMultiStyleConfigHelpers(numberInputAnatomy.keys);

const disabled = {
  cursor: 'default',
  bg: DISABLED_INPUT,
  border: '1px solid',
  borderColor: 'white-alpha-16',
  color: 'neutral-6',
  _placeholder: {
    color: 'neutral-5',
  },
  boxShadow: 'unset',
};

const loading = {};

const invalid = {
  bg: 'red--3',
  color: 'red-1',
  _placeholder: {
    color: 'red-0',
  },
  boxShadow:
    '0px 0px 0px 2px #AF3A48, 0px 1px 0px 0px rgba(242, 161, 171, 0.30), 0px 0px 0px 1px rgba(0, 0, 0, 0.80)',
};

const baseStyle = definePartsStyle({
  root: {},
  stepperGroup: {},
  stepper: {},
  field: {
    borderRadius: '0.5rem',
    color: 'white-0',
    bg: 'neutral-1',
    boxShadow: '0px 1px 0px 0px rgba(255, 255, 255, 0.16), 0px 0px 0px 1px rgba(0, 0, 0, 0.68)',
    borderColor: 'neutral-3',
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
