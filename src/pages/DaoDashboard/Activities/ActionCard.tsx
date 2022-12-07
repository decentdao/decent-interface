import { Box, Flex, Text } from '@chakra-ui/react';
import { Calendar, Clock } from '@decent-org/fractal-ui';
import { ReactNode } from 'react';
import { ActivityBox } from '../../../components/ui/containers/AcitivityBox';
import { ActionBox } from '../../../components/ui/containers/ActionBox';

interface IAcitivityCard {
  eventDate: string;
  LeftElement?: ReactNode;
  RightElement?: ReactNode;
  Badge?: ReactNode;
  borderColor?: string;
}

export function ActionCard({
  Badge,
  eventDate,
  LeftElement,
  RightElement,
  borderColor,
}: IAcitivityCard) {
  return (
    <ActionBox borderColor={borderColor}>
      <Flex
        justifyContent="space-between"
        alignItems="center"
      >
        <Flex flexDirection="column">
          <Flex
            color="white"
            alignItems="center"
            gap="1rem"
          >
            {LeftElement}
            {Badge}
            <Flex
              alignItems="center"
              gap="0.5rem"
            >
              <Clock fill="sand.700" />
              <Text textStyle="text-base-sans-regular">{eventDate}</Text>
            </Flex>
          </Flex>
        </Flex>
        {RightElement}
      </Flex>
    </ActionBox>
  );
}
