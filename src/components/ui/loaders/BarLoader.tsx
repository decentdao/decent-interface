import { Box, Flex, keyframes } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const waveKeyframes = keyframes`
  0%   { transform: translateY(0px);     opacity: .4; }
  50%  { transform: translateY(30px);  opacity: .08; }
  100% { transform: translateY(0px);     opacity: .4; }
`;

const blockAnimation = [
  `${waveKeyframes} 2s ease .0s infinite`,
  `${waveKeyframes} 2s ease .2s infinite`,
  `${waveKeyframes} 2s ease .4s infinite`,
  `${waveKeyframes} 2s ease .6s infinite`,
];

// @dev Not changing the name of this component to WaveLoader, to avoid diffs across the entire codebase + this is a temporary update pending custom shimmer loader design.
export function BarLoader() {
  const blocks = Array.from({ length: 16 }, (_, i) => (
    <Box
      as={motion.div}
      key={i}
      w="8px"
      h="8px"
      bg="white"
      opacity={0.4}
      borderRadius="2px"
      m={(i + 1) % 4 ? '0 5px 5px 0' : ''}
      animation={blockAnimation[i % 4]}
      display="inline-block"
    />
  ));

  return (
    <Flex
      mb="70px"
      flexWrap="wrap"
      w="50px"
      h="10px"
    >
      {blocks}
    </Flex>
  );
}
