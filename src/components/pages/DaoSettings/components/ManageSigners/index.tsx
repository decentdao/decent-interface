import { Button, Divider, Flex, HStack, Radio, RadioGroup, Show, Text } from '@chakra-ui/react';
import { AddPlus } from '@decent-org/fractal-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { StyledBox } from '../../../../ui/containers/StyledBox';
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
          colorScheme="gold"
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

function ManageSigners() {
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
    <Flex
      gap={4}
      alignItems="flex-start"
    >
      <StyledBox minWidth="65%">
        <Flex justifyContent="space-between">
          <Text
            textStyle="text-lg-mono-medium"
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
                disabled={!enableRemove}
                isDisabled={!enableRemove}
                variant="tertiary"
              >
                {/* {TODO: add Remove icon} */}
                <Show above="sm">{t('remove')}</Show>
              </Button>
            </Flex>
          )}
        </Flex>
        <Divider
          marginTop="1rem"
          color="chocolate.700"
        />
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
      </StyledBox>
      <StyledBox flexGrow={1}>
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
        <Text
          textStyle="text-sm-sans-regular"
          color="chocolate.200"
          mt={2}
        >
          {t('signersDescription')}
        </Text>
      </StyledBox>
    </Flex>
  );
}

export default ManageSigners;
