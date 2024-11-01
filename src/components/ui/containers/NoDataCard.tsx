import { Box, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useCanUserCreateProposal } from '../../../hooks/utils/useCanUserSubmitProposal';

export default function NoDataCard({
  translationNameSpace,
  emptyText,
  emptyTextNotProposer,
}: {
  translationNameSpace: string;
  emptyText: string;
  emptyTextNotProposer?: string;
}) {
  const { t } = useTranslation(translationNameSpace);
  const { canUserCreateProposal } = useCanUserCreateProposal();
  return (
    <Box
      bg="neutral-2"
      boxShadow="layeredShadowBorder"
      borderRadius="0.75rem"
      p="1rem"
    >
      <Text
        textStyle="body-base"
        textAlign="center"
        color="neutral-6"
      >
        {t(
          emptyTextNotProposer
            ? canUserCreateProposal
              ? emptyText
              : emptyTextNotProposer
            : emptyText,
        )}
      </Text>
    </Box>
  );
}
