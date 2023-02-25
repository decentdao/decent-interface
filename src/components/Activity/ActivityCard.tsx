import { Box, Flex, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { ActivityBox } from '../ui/containers/ActivityBox';

interface IActivityCard {
  eventDate?: string;
  eventDateLabel?: string;
  description: ReactNode;
  RightElement?: ReactNode;
  Badge?: ReactNode;
  boxBorderColor?: string;
}

export function ActivityCard({
  Badge,
  eventDate,
  eventDateLabel,
  description,
  RightElement,
  boxBorderColor,
}: IActivityCard) {
  return (
    <ActivityBox borderColor={boxBorderColor}>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={4}
      >
        <Flex flexDirection="column">
          <Flex
            color="sand.700"
            alignItems="center"
            gap="1rem"
            mb="1rem"
          >
            {Badge}
          </Flex>
          <Box>{description}</Box>
          {eventDate && (
            <Flex
              alignItems="center"
              gap="0.5rem"
            >
              <Text
                textStyle="text-base-sans-regular"
                color="chocolate.300"
              >
                {eventDateLabel} {eventDate}
              </Text>
            </Flex>
          )}
        </Flex>
        {RightElement}
      </Flex>
    </ActivityBox>
  );
}
