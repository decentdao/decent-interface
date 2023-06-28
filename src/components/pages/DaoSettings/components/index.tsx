import { Flex, Text, Divider } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { StyledBox } from '../../../ui/containers/StyledBox';

interface ISettingsSection {
  contentTitle: string;
  contentHeader?: ReactNode;
  descriptionTitle: string;
  descriptionHeader?: ReactNode;
  descriptionText: string;
  descriptionContent?: ReactNode;
  children: ReactNode;
}

export function SettingsSection({
  descriptionHeader,
  descriptionText,
  descriptionContent,
  descriptionTitle,
  contentTitle,
  contentHeader,
  children,
}: ISettingsSection) {
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
        {contentHeader || <Text textStyle="text-lg-mono-bold">{contentTitle}</Text>}
        <Divider
          marginTop="1rem"
          color="chocolate.400"
        />
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
        {descriptionContent || (
          <Text
            textStyle="text-sm-sans-regular"
            color="chocolate.200"
            mt={2}
          >
            {descriptionText}
          </Text>
        )}
      </StyledBox>
    </Flex>
  );
}
