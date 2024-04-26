import { Button, Flex, HStack, Radio, RadioGroup, Show, Text } from '@chakra-ui/react';
import { PlusCircle, MinusCircle } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { DisplayAddress } from '../../../../ui/links/DisplayAddress';
import { ModalType } from '../../../../ui/modals/ModalProvider';
import { useFractalModal } from '../../../../ui/modals/useFractalModal';
import { SettingsSection } from '../SettingsSection';

function Signer({ signer, disabled }: { signer: string; disabled: boolean }) {
  return (
    <HStack
      key={signer}
      my="1rem"
    >
      {!disabled && (
        <Radio
          value={signer}
          color="lilac--3"
          bgColor="black-0"
          _checked={{
            bg: 'lilac--3',
            color: 'lilac--4',
            _hover: {
              bg: 'lilac--4',
              color: 'lilac--4',
            },
          }}
          borderRadius="0.13rem"
          _hover={{
            color: 'lilac--4',
            bgColor: 'black-0',
          }}
          _disabled={{
            color: 'neutral-5',
            bgColor: 'neutral-6',
          }}
        />
      )}
      <DisplayAddress
        address={signer}
        truncate={false}
      />
    </HStack>
  );
}

export function SignersContainer() {
  const {
    node: { safe },
  } = useFractal();
  const [signers, setSigners] = useState<string[]>();
  const [selectedSigner, setSelectedSigner] = useState<string>();
  const [userIsSigner, setUserIsSigner] = useState<boolean>();
  const removeSigner = useFractalModal(ModalType.REMOVE_SIGNER, {
    selectedSigner: selectedSigner,
    signers: signers,
    currentThreshold: safe?.threshold,
  });
  const addSigner = useFractalModal(ModalType.ADD_SIGNER, {
    signers: signers,
    currentThreshold: safe?.threshold,
  });
  const { t } = useTranslation(['common', 'breadcrumbs']);
  const { address: account } = useAccount();
  const enableRemove = userIsSigner && signers && signers?.length > 1;
  const removeButtonDisabled = !enableRemove || !selectedSigner;

  useEffect(() => {
    setSigners(safe?.owners.map(owner => owner));
  }, [safe?.owners]);

  useEffect(() => {
    if (!signers) {
      return;
    }

    setUserIsSigner(account && signers.includes(account));
  }, [account, signers]);

  return (
    <SettingsSection
      title={t('signers', { ns: 'common' })}
      headerRight={
        userIsSigner && (
          <Flex gap="0.5rem">
            <Button
              variant="secondary"
              size="sm"
              onClick={addSigner}
              leftIcon={<PlusCircle size="16" />}
              iconSpacing="0"
            >
              <Show above="sm">
                <Text>{t('add')}</Text>
              </Show>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={removeSigner}
              disabled={removeButtonDisabled}
              isDisabled={removeButtonDisabled}
              iconSpacing="0"
              leftIcon={<MinusCircle size="16" />}
            >
              <Show above="sm">{t('remove')}</Show>
            </Button>
          </Flex>
        )
      }
      descriptionHeader={
        <Flex justifyContent="space-between">
          <Text>{t('signersRequired', { ns: 'common' })}</Text>
          <Text>{`${safe?.threshold}/${safe?.owners.length}`}</Text>
        </Flex>
      }
      descriptionContent={t('signersDescription')}
    >
      <RadioGroup
        onChange={e => setSelectedSigner(e)}
        value={selectedSigner}
        mt={6}
      >
        {signers &&
          signers.map(signer => (
            <Signer
              key={signer}
              signer={signer}
              disabled={!enableRemove}
            />
          ))}
      </RadioGroup>
    </SettingsSection>
  );
}
