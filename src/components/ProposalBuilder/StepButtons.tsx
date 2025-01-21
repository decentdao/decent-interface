import { Button, Flex, Icon } from '@chakra-ui/react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useDaoInfoStore } from '../../store/daoInfo/useDaoInfoStore';
import { CreateProposalSteps } from '../../types';

interface StepButtonsProps {
  metadataStepButtons: JSX.Element;
  transactionsStepButtons: JSX.Element;
}

export function PreviousButton({ prevStepUrl }: { prevStepUrl: string }) {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'proposal']);

  return (
    <Button
      px="2rem"
      variant="text"
      color="lilac-0"
      onClick={() => navigate(prevStepUrl)}
    >
      <Icon
        bg="transparent"
        aria-label="Back"
        as={CaretLeft}
        color="lilac-0"
      />
      {t('back', { ns: 'common' })}
    </Button>
  );
}

export function NextButton({
  nextStepUrl,
  isDisabled,
}: {
  nextStepUrl: string;
  isDisabled: boolean;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'proposal']);

  return (
    <Button
      onClick={() => navigate(nextStepUrl)}
      isDisabled={isDisabled}
      px="2rem"
    >
      {t('next', { ns: 'common' })}
      <CaretRight />
    </Button>
  );
}

export function CreateProposalButton({ isDisabled }: { isDisabled: boolean }) {
  const { t } = useTranslation(['common', 'proposal']);

  return (
    <Button
      px="2rem"
      type="submit"
      isDisabled={isDisabled}
    >
      {t('createProposal', { ns: 'proposal' })}
    </Button>
  );
}

export default function StepButtons(props: StepButtonsProps) {
  const { safe } = useDaoInfoStore();
  const { metadataStepButtons, transactionsStepButtons } = props;

  if (!safe?.address) {
    return null;
  }

  return (
    <Flex
      mt="1.5rem"
      gap="0.75rem"
      alignItems="center"
      justifyContent="flex-end"
      width="100%"
    >
      <Routes>
        <Route
          path={CreateProposalSteps.METADATA}
          element={metadataStepButtons}
        />
        <Route
          path={CreateProposalSteps.TRANSACTIONS}
          element={transactionsStepButtons}
        />
      </Routes>
    </Flex>
  );
}
