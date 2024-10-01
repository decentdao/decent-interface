import { defineStyle } from '@chakra-ui/react';

const primaryDisabled = {
  track: {
    backgroundColor: 'neutral-5',
    _checked: {
      backgroundColor: 'neutral-5',
    },
  },
  thumb: {
    backgroundColor: 'neutral-6',
    _checked: {
      backgroundColor: 'neutral-6',
    },
  },
};

const primary = defineStyle({
  track: {
    backgroundColor: 'neutral-6',
    _checked: {
      backgroundColor: 'lilac--3',
    },
  },
  _hover: {
    thumb: {
      backgroundColor: 'lilac--1',
    },
    _disabled: {
      ...primaryDisabled,
    },
  },
  thumb: {
    backgroundColor: 'lilac--2',
  },
  _disabled: {
    ...primaryDisabled,
  },
});

const secondaryDisabled = {
  track: {
    backgroundColor: 'neutral-3',
    _checked: {
      backgroundColor: 'neutral-3',
    },
  },
  thumb: {
    backgroundColor: 'neutral-4',
    _checked: {
      backgroundColor: 'neutral-4',
    },
  },
};

const secondary = defineStyle({
  track: {
    backgroundColor: 'black-0',
    _checked: {
      backgroundColor: 'celery--3',
    },
  },
  thumb: {
    backgroundColor: 'neutral-10',
  },
  _hover: {
    _disabled: {
      ...secondaryDisabled,
    },
    thumb: {
      backgroundColor: 'white-0',
    },
  },
  _disabled: {
    ...secondaryDisabled,
  },
});

const switchVariants = {
  primary,
  secondary,
};

export default switchVariants;
