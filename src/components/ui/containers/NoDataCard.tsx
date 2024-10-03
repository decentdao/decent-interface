import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useCanUserCreateProposal } from '../../../hooks/utils/useCanUserSubmitProposal';
import { Card } from '../cards/Card';

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
    <Card my="0.5rem">
      <Text
        textStyle="body-base"
        textAlign="center"
        color="white-alpha-16"
      >
        {t(
          emptyTextNotProposer
            ? canUserCreateProposal
              ? emptyText
              : emptyTextNotProposer
            : emptyText,
        )}
      </Text>
    </Card>
  );
}
