import { Flex, keyframes, Text } from '@chakra-ui/react';
import { InfoBox } from '../containers/InfoBox';
import { motion } from 'framer-motion';

const animationKeyframes = keyframes`
  0% { background-position: 0px 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0px 50%; }
`;

const animation = `${animationKeyframes} 1s infinite`;

export function InfoCardLoader() {
  return (
    <InfoBox minHeight="auto">
      <Flex
        alignItems="center"
        justifyContent="center"
      >
        <Text
          as={motion.p}
          background="linear-gradient(-45deg, #403824 0%, #FABD2E 25%, #272520 75%, #FFD36E 100%)"
          backgroundSize="300%"
          textStyle="text-2xl-mono-bold"
          letterSpacing="0.125rem"
          animation={animation}
          sx={{
            '&': {
              'text-transform': 'uppercase',
              '-webkit-background-clip': 'text',
              '-webkit-text-fill-color': 'transparent',
            },
          }}
        >
          Loading...
        </Text>
      </Flex>
    </InfoBox>
  );
}
