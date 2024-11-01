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
      boxShadow="0px 0px 0px 1px #100414, inset 0px 0px 0px 1px rgba(248, 244, 252, 0.04), inset 0px 1px 0px rgba(248, 244, 252, 0.04)"
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
