import { Flex, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { StyledBox } from '../../../ui/containers/StyledBox';
import Divider from '../../../ui/utils/Divider';

interface SettingsSectionProps {
  title: string;
  headerRight?: ReactNode;
  descriptionTitle: string;
  descriptionHeader?: ReactNode;
  descriptionText: string;
  descriptionContent?: ReactNode;
  children: ReactNode;
}

export function SettingsSection({
  title,
  headerRight,
  descriptionHeader,
  descriptionText,
  descriptionContent,
  descriptionTitle,
  children,
}: SettingsSectionProps) {
  return (
    <Flex
      gap={4}
      alignItems="flex-start"
    >
      <StyledBox
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
      <StyledBox
        maxHeight="fit-content"
        minHeight="6.25rem"
      >
        {descriptionHeader || (
          <Text
            textStyle="text-base-sans-regular"
            color="grayscale.100"
          >
            {descriptionTitle}
          </Text>
        )}
        {descriptionContent || <Text mt={2}>{descriptionText}</Text>}
      </StyledBox>
    </Flex>
  );
}
