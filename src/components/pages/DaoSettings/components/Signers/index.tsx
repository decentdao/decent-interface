import { Button, Flex, HStack, Radio, RadioGroup, Show, Text } from '@chakra-ui/react';
import { AddPlus, Minus } from '@decent-org/fractal-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { SettingsSection } from '..';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { DisplayAddress } from '../../../../ui/links/DisplayAddress';
import { ModalType } from '../../../../ui/modals/ModalProvider';
import { useFractalModal } from '../../../../ui/modals/useFractalModal';

function Signer({ signer, disabled }: { signer: string; disabled: boolean }) {
  return (
    <HStack
      key={signer}
      my={3}
    >
      {!disabled && (
        <Radio
          value={signer}
          colorScheme="blackAlpha"
          textColor="gold.500"
          borderColor="gold.500"
          size="md"
        />
      )}
      <DisplayAddress
        address={signer}
        truncate={false}
      />
    </HStack>
  );
}

export default function SignersContainer() {
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
      contentTitle={''}
      contentHeader={
        <Flex justifyContent="space-between">
          <Text
            textStyle="text-lg-mono-bold"
            color="grayscale.100"
          >
            {t('signers', { ns: 'common' })}
          </Text>
          {userIsSigner && (
            <Flex gap={4}>
              <Button
                minW={0}
                px={2}
                onClick={addSigner}
              >
                <AddPlus />
                <Show above="sm">{t('add')}</Show>
              </Button>
              <Button
                minW={0}
                px={2}
                onClick={removeSigner}
                disabled={removeButtonDisabled}
                isDisabled={removeButtonDisabled}
                variant="tertiary"
              >
                <Minus />
                <Show above="sm">{t('remove')}</Show>
              </Button>
            </Flex>
          )}
        </Flex>
      }
      descriptionTitle={t('signersRequired', { ns: 'common' })}
      descriptionHeader={
        <Flex justifyContent="space-between">
          <Text
            textStyle="text-base-sans-regular"
            color="grayscale.100"
          >
            {t('signersRequired', { ns: 'common' })}
          </Text>
          <Text
            textStyle="text-base-sans-regular"
            color="grayscale.100"
          >{`${safe?.threshold}/${safe?.owners.length}`}</Text>
        </Flex>
      }
      descriptionText={t('signersDescription')}
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
