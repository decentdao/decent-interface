import { Box, Button, Divider } from '@chakra-ui/react';
import { utils } from 'ethers';
import { useRouter } from 'next/navigation';
import { ChangeEventHandler, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNetwork, useSigner } from 'wagmi';
import { DAO_ROUTES } from '../../../constants/routes';
import useSubmitProposal from '../../../hooks/DAO/proposal/useSubmitProposal';
import { useIsSafe } from '../../../hooks/safe/useIsSafe';
import { useFractal } from '../../../providers/App/AppProvider';
import { disconnectedChain } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalTemplate } from '../../../types/createProposalTemplate';
import { couldBeENS } from '../../../utils/url';
import { InputComponent } from '../forms/InputComponent';

interface ICopyProposalTemplateModalProps {
  proposalTemplate: ProposalTemplate;
  templateIndex: number;
  onClose: () => void;
}

export default function CopyProposalTemplateModal({
  templateIndex,
  onClose,
}: ICopyProposalTemplateModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [targetDAOAddress, setTargetDAOAddress] = useState('');
  const [error, setError] = useState('');
  const [isValidAddress, setIsValidDAOAddress] = useState(false);

  const { t } = useTranslation('proposalTemplate');
  const { push } = useRouter();
  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const {
    node: { proposalTemplatesHash },
  } = useFractal();

  const { isSafe, isSafeLoading } = useIsSafe(inputValue);
  const { getCanUserCreateProposal } = useSubmitProposal();

  const handleAddressChange: ChangeEventHandler<HTMLInputElement> = e => {
    setInputValue(e.target.value);
    setTargetDAOAddress(e.target.value);
  };

  const validateDAOAddress = useCallback(async () => {
    if (!inputValue || isSafeLoading) {
      setError('');
      return false;
    }

    const chainName = chain ? chain.name : disconnectedChain.name;
    if (!utils.isAddress(inputValue) && !couldBeENS(inputValue)) {
      setError(t('errorInvalidAddress', { ns: 'common' }));
      return false;
    } else if (couldBeENS(inputValue)) {
      const resolvedAddress = await signer!.resolveName(inputValue);
      if (isSafe) {
        if (await getCanUserCreateProposal(resolvedAddress)) {
          setError('');
          setTargetDAOAddress(resolvedAddress);
          return true;
        } else {
          setError(t('errorNotProposer'));
          return false;
        }
      } else {
        setError(t('errorFailedSearch', { ns: 'dashboard', chain: chainName }));
        return false;
      }
    } else {
      if (isSafe) {
        if (await getCanUserCreateProposal(inputValue)) {
          setError('');
          setTargetDAOAddress(inputValue);
          return true;
        } else {
          setError(t('errorNotProposer'));
          return false;
        }
      } else {
        setError(t('errorFailedSearch', { ns: 'dashboard', chain: chainName }));
        return false;
      }
    }
  }, [getCanUserCreateProposal, isSafe, signer, t, inputValue, chain, isSafeLoading]);

  const handleSubmit = () => {
    push(
      `${DAO_ROUTES.proposalTemplateNew.relative(
        targetDAOAddress
      )}?templatesHash=${proposalTemplatesHash}&templateIndex=${templateIndex}`
    );
    onClose();
  };

  useEffect(() => {
    const validate = async () => {
      if (!isSafeLoading) {
        const isValidDAO = await validateDAOAddress();
        if (isValidDAO !== isValidAddress) {
          setIsValidDAOAddress(isValidDAO);
        }
      }
    };

    validate();
  }, [isSafeLoading, validateDAOAddress, isValidAddress]);

  return (
    <Box>
      <InputComponent
        isRequired
        value={inputValue}
        onChange={handleAddressChange}
        testId="dao-address"
        placeholder="example.eth"
        label={t('targetDAOAddressLabel')}
        helper={t('targetDAOAddressHelper')}
        errorMessage={error}
        helperSlot="end"
        gridContainerProps={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          flex: '1',
          width: '100%',
        }}
        inputContainerProps={{
          width: '100%',
        }}
      />
      <Divider
        color="chocolate.700"
        my={4}
      />
      <Button
        onClick={handleSubmit}
        variant="primary"
        disabled={!isValidAddress}
        isDisabled={!isValidAddress}
        width="100%"
      >
        {t('copyTemplateSubmitButton')}
      </Button>
    </Box>
  );
}
