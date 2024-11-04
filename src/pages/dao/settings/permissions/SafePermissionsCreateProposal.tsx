import { Button, Flex, IconButton, Show, Text } from '@chakra-ui/react';
import { ArrowLeft, Trash, X } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { zeroAddress } from 'viem';
import { SettingsPermissionsStrategyForm } from '../../../../components/SafeSettings/SettingsPermissionsStrategyForm';
import { Card } from '../../../../components/ui/cards/Card';
import { ModalBase } from '../../../../components/ui/modals/ModalBase';
import { ModalType } from '../../../../components/ui/modals/ModalProvider';
import { useDecentModal } from '../../../../components/ui/modals/useDecentModal';
import NestedPageHeader from '../../../../components/ui/page/Header/NestedPageHeader';
import Divider from '../../../../components/ui/utils/Divider';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { AzoriusGovernance, BigIntValuePair } from '../../../../types';

export function SafePermissionsCreateProposal() {
  const { t } = useTranslation(['settings', 'common', 'modals']);
  const { addressPrefix } = useNetworkConfig();
  const [searchParams] = useSearchParams();
  const votingStrategyAddress = searchParams.get('votingStrategy');
  const navigate = useNavigate();
  const {
    node: { safe },
    governance,
  } = useFractal();
  const azoriusGovernance = governance as AzoriusGovernance;
  const openSelectAddPermissionModal = useDecentModal(ModalType.ADD_PERMISSION);

  const [proposerThreshold, setProposerThreshold] = useState<BigIntValuePair>({
    bigintValue: BigInt(azoriusGovernance.votingStrategy?.proposerThreshold?.value ?? 0),
    value: azoriusGovernance.votingStrategy?.proposerThreshold?.formatted ?? '0',
  });

  useEffect(() => {
    if (azoriusGovernance.votingStrategy?.proposerThreshold) {
      setProposerThreshold({
        bigintValue: BigInt(azoriusGovernance.votingStrategy.proposerThreshold.value),
        value: azoriusGovernance.votingStrategy.proposerThreshold.formatted ?? '0',
      });
    }
  }, [azoriusGovernance.votingStrategy?.proposerThreshold]);

  if (!safe) return null;

  const settingsPermissionsPath = DAO_ROUTES.settingsPermissions.relative(
    addressPrefix,
    safe.address,
  );

  const handleClose = () => {
    navigate(settingsPermissionsPath);
  };

  const handleGoBack = () => {
    openSelectAddPermissionModal();
    handleClose();
  };

  const handleDelete = () => {
    // @todo: handle deleting permission
    handleClose();
  };

  const handleSubmit = () => {
    // @todo: handle proceeding with proposal creation
    handleClose();
  };

  return (
    <>
      <Show below="md">
        <NestedPageHeader
          title={t('permissionCreateProposalsTitle')}
          onGoBack={votingStrategyAddress ? undefined : handleGoBack}
          backButtonText={t('back', { ns: 'common' })}
          backButtonHref={settingsPermissionsPath}
        >
          {votingStrategyAddress && votingStrategyAddress !== zeroAddress && (
            <Flex
              width="25%"
              justifyContent="flex-end"
            >
              <Button
                variant="ghost"
                rightIcon={<Trash size={24} />}
                padding={0}
                onClick={handleDelete}
                color="red-1"
              >
                {t('delete', { ns: 'common' })}
              </Button>
            </Flex>
          )}
        </NestedPageHeader>
      </Show>
      <Show below="md">
        <Card>
          <SettingsPermissionsStrategyForm
            proposerThreshold={proposerThreshold}
            setProposerThreshold={setProposerThreshold}
          />
        </Card>
        <Flex justifyContent="flex-end">
          <Button
            variant="primary"
            onClick={handleSubmit}
            mt={6}
          >
            {t('createProposal', { ns: 'modals' })}
          </Button>
        </Flex>
      </Show>
      <Show above="md">
        <ModalBase
          isOpen
          onClose={handleClose}
        >
          <Flex
            height="376px" // @dev - fixed height from design
            flexDirection="column"
            justifyContent="space-between"
          >
            <Flex justifyContent="space-between">
              {!votingStrategyAddress ||
                (votingStrategyAddress === zeroAddress && (
                  <IconButton
                    size="button-md"
                    variant="ghost"
                    color="lilac-0"
                    aria-label={t('back', { ns: 'common' })}
                    onClick={handleGoBack}
                    icon={<ArrowLeft size={24} />}
                  />
                ))}
              <Text>{t('permissionCreateProposalsTitle')}</Text>
              {votingStrategyAddress && votingStrategyAddress !== zeroAddress ? (
                <IconButton
                  size="button-md"
                  variant="ghost"
                  color="red-1"
                  icon={<Trash size={24} />}
                  aria-label={t('delete', { ns: 'common' })}
                />
              ) : (
                <IconButton
                  size="button-md"
                  variant="ghost"
                  color="lilac-0"
                  aria-label={t('close', { ns: 'common' })}
                  onClick={handleClose}
                  icon={<X size={24} />}
                />
              )}
            </Flex>
            <Divider
              variant="darker"
              mx="-1.5rem"
              width="calc(100% + 3rem)"
            />
            <SettingsPermissionsStrategyForm
              proposerThreshold={proposerThreshold}
              setProposerThreshold={setProposerThreshold}
            />
            <Button
              variant="primary"
              onClick={handleSubmit}
              width="full"
              mt={6}
            >
              {t('createProposal', { ns: 'modals' })}
            </Button>
          </Flex>
        </ModalBase>
      </Show>
    </>
  );
}
