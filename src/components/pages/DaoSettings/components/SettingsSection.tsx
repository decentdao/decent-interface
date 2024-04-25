import { Box, Flex, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { StyledBox } from '../../../ui/containers/StyledBox';
import Divider from '../../../ui/utils/Divider';

interface SettingsSectionProps {
  title: string;
  headerRight?: ReactNode;
  descriptionHeader: ReactNode;
  descriptionContent: ReactNode;
  children: ReactNode;
}

export function SettingsSection({
  title,
  headerRight,
  descriptionHeader,
  descriptionContent,
  children,
}: SettingsSectionProps) {
  return (
    <Flex
      gap="1.5rem"
      alignItems="flex-start"
    >
      {/* SETTINGS SECTION CONTENT */}
      <StyledBox
        bg="neutral-2"
        maxHeight="fit-content"
        minHeight="6.25rem"
        minWidth="65%"
      >
        <Flex justifyContent="space-between">
          <Text>{title}</Text>

          {/* OPTIONAL HEADER RIGHT COMPONENT */}
          {headerRight}
        </Flex>
        <Divider my="1rem" />
        {children}
      </StyledBox>

      {/* SETTINGS SECTION DESCRIPTION */}
      <Flex
        gap="0.5rem"
        flexDir="column"
        justifyContent="flex-start"
      >
        <Box
          color="white-0"
          textStyle="display-lg"
        >
          {descriptionHeader}
        </Box>

        <Box
          color="neutral-7"
          textStyle="body-base"
        >
          {descriptionContent}
        </Box>
      </Flex>
    </Flex>
  );
}
