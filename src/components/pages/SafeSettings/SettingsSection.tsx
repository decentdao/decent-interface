import { Flex, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { StyledBox } from '../../ui/containers/StyledBox';
import Divider from '../../ui/utils/Divider';

interface SettingsSectionProps {
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
}

export function SettingsSection({ title, headerRight, children }: SettingsSectionProps) {
  return (
    <StyledBox
      maxH="fit-content"
      minH="6.25rem"
      width="100%"
    >
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
    </StyledBox>
  );
}
