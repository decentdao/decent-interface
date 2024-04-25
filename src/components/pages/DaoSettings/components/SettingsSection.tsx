import { Box, Flex, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { StyledBox } from '../../../ui/containers/StyledBox';
import Divider from '../../../ui/utils/Divider';

type NestedSettingsSectionProps = Omit<
  SettingsSectionProps,
  'nestedSection' | 'descriptionHeader' | 'descriptionContent'
>;

interface SettingsSectionProps {
  title: string;
  headerRight?: ReactNode;
  descriptionHeader: ReactNode;
  descriptionContent: ReactNode;
  children: ReactNode;
  nestedSection?: NestedSettingsSectionProps;
}

export function SettingsSection({
  title,
  headerRight,
  descriptionHeader,
  descriptionContent,
  children,
  nestedSection,
}: SettingsSectionProps) {
  return (
    <Flex gap="1.5rem">
      {/* SETTINGS SECTION CONTENT */}
      <StyledBox
        bg="neutral-2"
        maxHeight="fit-content"
        minHeight="6.25rem"
        minWidth="65%"
      >
        {/* TITLE AND OPTIONAL RIGHT COMPONENT */}
        <Flex justifyContent="space-between">
          <Text textStyle="display-lg">{title}</Text>
          {headerRight}
        </Flex>
        <Divider my="1rem" />
        {children}

        {/* NESTED SETTINGS SECTION, for when a section has an extra header-content content */}
        {nestedSection && (
          <Flex
            flexDir="column"
            mt="2rem"
          >
            <Flex justifyContent="space-between">
              <Text textStyle="display-lg">{nestedSection.title}</Text>
              {nestedSection.headerRight}
            </Flex>
            <Divider my="1rem" />
            {nestedSection.children}
          </Flex>
        )}
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
