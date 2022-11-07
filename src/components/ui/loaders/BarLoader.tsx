import { Box, keyframes } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const animationKeyframes = keyframes`
  0%   { height: 48px} 
  100% { height: 4px}
`;

const animation = `${animationKeyframes} 0.75s 1s linear infinite alternate`;

export function BarLoader() {
  return (
    <Box
      as={motion.span}
      animation={animation}
      width="8px"
      height="40px"
      borderRadius="4px"
      background="currentColor"
      color="#FFF"
      position="relative"
      boxSizing="border-box"
      margin="20px auto"
      sx={{
        '&::after, &::before': {
          content: '""',
          width: '8px',
          height: '40px',
          borderRadius: '4px',
          background: 'currentColor',
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          left: '20px',
          boxSizing: 'border-box',
          animation: animation,
          animationDelay: '250ms',
        },
        '&::before': {
          left: '-20px',
        },
      }}
    ></Box>
  );
}
