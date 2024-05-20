import { Box, Flex, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { CONTENT_MAXW } from '../../../../constants/common';
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
    <Flex
      gap="1.5rem"
      flexWrap={{ base: 'wrap', md: 'nowrap' }}
    >
      {/* SETTINGS SECTION CONTENT */}
      <StyledBox
        maxH="fit-content"
        minH="6.25rem"
        minW={{ base: '100%', md: '65%' }}
        maxW={CONTENT_MAXW}
      >
        {/* TITLE AND OPTIONAL RIGHT COMPONENT */}
        <Flex justifyContent="space-between">
          <Text textStyle="display-lg">{title}</Text>
          {headerRight}
        </Flex>
        <Divider
          my="1rem"
          w={{ base: 'calc(100% + 1.5rem)', md: 'calc(100% + 3rem)' }}
          mx={{ base: '-0.75rem', md: '-1.5rem' }}
        />
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
            <Divider
              my="1rem"
              w={{ base: 'calc(100% + 1.5rem)', md: 'calc(100% + 3rem)' }}
              mx={{ base: '-0.75rem', md: '-1.5rem' }}
            />
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
