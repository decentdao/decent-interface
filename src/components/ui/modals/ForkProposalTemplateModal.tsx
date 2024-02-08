import { Box, Button, Divider } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { ChangeEventHandler, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNetwork } from 'wagmi';
import { DAO_ROUTES } from '../../../constants/routes';
import useSubmitProposal from '../../../hooks/DAO/proposal/useSubmitProposal';
import { useIsSafe } from '../../../hooks/safe/useIsSafe';
import { validateAddress } from '../../../hooks/schemas/common/useValidationAddress';
import { useEthersProvider } from '../../../hooks/utils/useEthersProvider';
import { useEthersSigner } from '../../../hooks/utils/useEthersSigner';
import { useFractal } from '../../../providers/App/AppProvider';
import { disconnectedChain } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalTemplate } from '../../../types/createProposalTemplate';
import { InputComponent } from '../forms/InputComponent';

interface IForkProposalTemplateModalProps {
  proposalTemplate: ProposalTemplate;
  templateIndex: number;
  onClose: () => void;
}

export default function ForkProposalTemplateModal({
  templateIndex,
  onClose,
}: IForkProposalTemplateModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [targetDAOAddress, setTargetDAOAddress] = useState('');
  const [isValidDAOAddress, setIsValidDAOAddress] = useState(false);
  const [error, setError] = useState('');

  const { t } = useTranslation('proposalTemplate');
  const { push } = useRouter();
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const signerOrProvider = signer || provider;
  const { chain } = useNetwork();
  const {
    node: { proposalTemplatesHash },
  } = useFractal();

  const { isSafe, isSafeLoading } = useIsSafe(targetDAOAddress);
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
    const {
      validation: { address, isValidAddress },
    } = await validateAddress({ address: inputValue, signerOrProvider });

    if (!isValidAddress) {
      setError(t('errorInvalidAddress', { ns: 'common' }));
    } else {
      setTargetDAOAddress(address);
      if (isSafe) {
        if (await getCanUserCreateProposal(address)) {
          setError('');
        } else {
          setError(t('errorNotProposer'));
          return false;
        }
      } else {
        setError(t('errorFailedSearch', { ns: 'dashboard', chain: chainName }));
        return false;
      }
    }

    return isValidAddress;
  }, [getCanUserCreateProposal, isSafe, t, inputValue, chain, isSafeLoading, signerOrProvider]);

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
        const isValidAddress = await validateDAOAddress();
        if (isValidDAOAddress !== isValidAddress) {
          setIsValidDAOAddress(isValidAddress);
        }
      }
    };

    validate();
  }, [isSafeLoading, validateDAOAddress, isValidDAOAddress]);

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
        disabled={!isValidDAOAddress}
        isDisabled={!isValidDAOAddress}
        width="100%"
      >
        {t('forkTemplateSubmitButton')}
      </Button>
    </Box>
  );
}
