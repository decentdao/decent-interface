import { Avatar, Box, Divider, HStack, Text, VStack } from '@chakra-ui/react';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import { CreateIntegrationForm } from '../../types/createIntegration';

export default function IntegrationDetails({
  values: { integrationMetadata },
}: FormikProps<CreateIntegrationForm>) {
  const { t } = useTranslation(['integration']);
  return (
    <Box
      rounded="lg"
      p={4}
      bg={BACKGROUND_SEMI_TRANSPARENT}
    >
      <VStack
        spacing={3}
        align="left"
      >
        <Text textStyle="text-lg-mono-medium">{t('preview')}</Text>
        <Divider color="chocolate.700" />
        <HStack justifyContent="space-between">
          <Text color="chocolate.200">{t('previewTitle')}</Text>
          <Text>{integrationMetadata.title}</Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text color="chocolate.200">{t('previewThumnbail')}</Text>
          {integrationMetadata.title && (
            <Avatar
              size="sm"
              w="28px"
              h="28px"
              name={integrationMetadata.title}
              borderRadius="4px"
              getInitials={(title: string) => title.slice(0, 2)}
            />
          )}
        </HStack>
        <HStack justifyContent="space-between">
          <Text color="chocolate.200">{t('integrationDescription')}</Text>
          <Text textAlign="right">{integrationMetadata.description}</Text>
        </HStack>
        <Divider color="chocolate.700" />
      </VStack>
    </Box>
  );
}
