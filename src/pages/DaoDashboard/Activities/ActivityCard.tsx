import { Box, Flex, Text } from '@chakra-ui/react';
import { Calendar } from '@decent-org/fractal-ui';
import { ReactNode } from 'react';
import { ActivityBox } from '../../../components/ui/containers/AcitivityBox';

interface IAcitivityCard {
  eventDate: string;
  description: ReactNode;
  RightElement?: ReactNode;
  Badge?: ReactNode;
}

export function AcitivityCard({
  Badge,
  eventDate = '2022-10-03',
  description,
  RightElement,
}: IAcitivityCard) {
  return (
    <ActivityBox>
      <Flex
        justifyContent="space-between"
        alignItems="center"
      >
        <Flex flexDirection="column">
          <Flex
            color="sand.700"
            alignItems="center"
            gap="1rem"
            mb="1rem"
          >
            {Badge}
            <Flex
              alignItems="center"
              gap="0.5rem"
            >
              <Calendar />
              <Text textStyle="text-base-sans-regular">{eventDate}</Text>
            </Flex>
          </Flex>
          <Box>{description}</Box>
        </Flex>
        {RightElement}
      </Flex>
    </ActivityBox>
  );
}
