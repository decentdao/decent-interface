import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Radio,
  RadioGroup,
  Show,
  Text,
} from '@chakra-ui/react';
import { AddPlus } from '@decent-org/fractal-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { useFractal } from '../../../providers/App/AppProvider';
import { DisplayAddress } from '../../ui/links/DisplayAddress';
import { ModalType } from '../../ui/modals/ModalProvider';
import { useFractalModal } from '../../ui/modals/useFractalModal';
import PageHeader from '../../ui/page/Header/PageHeader';
import DaoDetails from './DaoDetails';

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

function ManageSigners({}: {}) {
  const {
    node: { safe, daoName },
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
    <Box>
      <PageHeader
        title={t('headerTitle', {
          ns: 'breadcrumbs',
          daoName: daoName,
          subject: t('signers', { ns: 'common' }),
        })}
        hasDAOLink={true}
        buttonText={enableRemove ? '— ' + t('remove') : undefined}
        buttonClick={removeSigner}
        isButtonDisabled={!selectedSigner}
        breadcrumbs={[
          {
            terminus: t('manageSigners', { ns: 'breadcrumbs' }),
            path: '',
          },
        ]}
      >
        {userIsSigner && (
          <Button
            minW={0}
            onClick={addSigner}
          >
            <AddPlus />
            <Show above="sm">{t('add')}</Show>
          </Button>
        )}
      </PageHeader>
      <Flex
        mt="1rem"
        align="start"
        gap="1rem"
        flexWrap="wrap"
      >
        <Box
          minWidth={{ sm: '100%', xl: '55%' }}
          bg={BACKGROUND_SEMI_TRANSPARENT}
          rounded="md"
          px={8}
          py={8}
        >
          <Text
            textStyle="text-lg-mono-regular"
            color="grayscale.100"
          >
            {t('signers', { ns: 'common' })}
          </Text>
          <Divider
            marginTop="1rem"
            borderColor="chocolate.700"
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
        </Box>
        <DaoDetails
          threshold={safe?.threshold}
          signerCount={safe?.owners.length}
        />
      </Flex>
    </Box>
  );
}

export default ManageSigners;
