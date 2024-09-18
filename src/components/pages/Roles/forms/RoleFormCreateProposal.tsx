import { Box, Button, Flex, FormControl, Show, useDisclosure, Text, Icon } from '@chakra-ui/react';
import { SquaresFour, ArrowsDownUp, Plus, Trash } from '@phosphor-icons/react';
import { Field, FieldProps, useFormikContext } from 'formik';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { formatUnits, getAddress, Hex } from 'viem';
import { CARD_SHADOW, DETAILS_BOX_SHADOW } from '../../../../constants/common';
import { DAO_ROUTES } from '../../../../constants/routes';
import useDisplayName from '../../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { Card } from '../../../ui/cards/Card';
import { CustomNonceInput } from '../../../ui/forms/CustomNonceInput';
import { InputComponent, TextareaComponent } from '../../../ui/forms/InputComponent';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import { ModalBase } from '../../../ui/modals/ModalBase';
import { SendAssetsData, SendAssetsModal } from '../../../ui/modals/SendAssetsModal';
import { RoleCardShort } from '../RoleCard';
import RolesDetailsDrawer from '../RolesDetailsDrawer';
import RolesDetailsDrawerMobile from '../RolesDetailsDrawerMobile';
import { EditedRole, RoleDetailsDrawerRoleHatProp, RoleFormValues } from '../types';

function SendAssetsAction({
  index,
  action,
  onRemove,
}: {
  index: number;
  action: SendAssetsData;
  onRemove: (index: number) => void;
}) {
  const { t } = useTranslation('common');
  const { displayName } = useDisplayName(action.destinationAddress);

  return (
    <Card my="1rem">
      <Flex justifyContent="space-between">
        <Flex
          alignItems="center"
          gap="0.5rem"
        >
          <Icon
            as={ArrowsDownUp}
            w="1.5rem"
            h="1.5rem"
            color="lilac-0"
          />
          <Text>{t('transfer')}</Text>
          <Text color="lilac-0">
            {formatUnits(action.transferAmount, action.asset.decimals)} {action.asset.symbol}
          </Text>
          <Text>{t('to').toLowerCase()}</Text>
          <Text color="lilac-0">{displayName}</Text>
        </Flex>
        <Button
          color="red-0"
          variant="tertiary"
          size="sm"
          onClick={() => {
            onRemove(index);
          }}
        >
          <Icon as={Trash} />
        </Button>
      </Flex>
    </Card>
  );
}

function ActionCard({
  title,
  subtitle,
  icon,
  onClick,
  isDisabled,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  onClick: () => void;
  isDisabled: boolean;
}) {
  return (
    <Button
      variant="unstyled"
      height="auto"
      onClick={onClick}
      isDisabled={isDisabled}
      padding={0}
      w="full"
    >
      <Box
        boxShadow={DETAILS_BOX_SHADOW}
        _hover={{ bg: 'neutral-3' }}
        _active={{ bg: 'neutral-2', border: '1px solid', borderColor: 'neutral-3' }}
        transition="all ease-out 300ms"
        p="1.5rem"
        borderRadius="0.5rem"
      >
        <Icon
          as={icon}
          w="2rem"
          h="2rem"
          color="lilac-0"
        />
        <Text textStyle="display-lg">{title}</Text>
        <Text color="neutral-7">{subtitle}</Text>
      </Box>
    </Button>
  );
}
export default function RoleFormCreateProposal({ close }: { close: () => void }) {
  const [drawerViewingRole, setDrawerViewingRole] = useState<RoleDetailsDrawerRoleHatProp>();
  const { t } = useTranslation(['modals', 'common', 'proposal']);
  const {
    values,
    setFieldValue: setFieldValueTopLevel,
    isSubmitting,
    submitForm,
  } = useFormikContext<RoleFormValues>();
  const editedRoles = useMemo<
    (RoleDetailsDrawerRoleHatProp & {
      editedRole: EditedRole;
    })[]
  >(() => {
    return values.hats
      .filter(hat => !!hat.editedRole)
      .map(roleHat => {
        if (!roleHat.wearer || !roleHat.name || !roleHat.description || !roleHat.editedRole) {
          throw new Error('Role missing data', {
            cause: roleHat,
          });
        }
        return {
          ...roleHat,
          editedRole: roleHat.editedRole,
          prettyId: roleHat.id,
          name: roleHat.name,
          description: roleHat.description,
          wearer: getAddress(roleHat.wearer),
          payments: roleHat.payments
            ? roleHat.payments.map(payment => {
                if (!payment.startDate || !payment.endDate || !payment.amount || !payment.asset) {
                  throw new Error('Payment missing data', {
                    cause: payment,
                  });
                }
                return {
                  ...payment,
                  startDate: payment.startDate,
                  endDate: payment.endDate,
                  amount: payment.amount,
                  asset: payment.asset,
                  cliffDate: payment.cliffDate,
                  withdrawableAmount: 0n,
                  isCancelled: false,
                };
              })
            : [],
        };
      });
  }, [values.hats]);

  const {
    node: { daoAddress },
    treasury: { assetsFungible },
  } = useFractal();
  const navigate = useNavigate();
  const { addressPrefix } = useNetworkConfig();

  const handleEditRoleClick = useCallback(
    (hatId: Hex) => {
      if (!!daoAddress) {
        navigate(DAO_ROUTES.rolesEditDetails.relative(addressPrefix, daoAddress, hatId));
      }
    },
    [navigate, addressPrefix, daoAddress],
  );

  const handleCloseDrawer = () => setDrawerViewingRole(undefined);

  const { isOpen: isOpenAction, onOpen: onOpenAction, onClose: onCloseAction } = useDisclosure();
  const { isOpen: isOpenAssets, onOpen: onOpenAssets, onClose: onCloseAssets } = useDisclosure();

  const addSendAssetsAction = (sendAssetsAction: SendAssetsData) => {
    setFieldValueTopLevel('actions', [...values.actions, sendAssetsAction]);
  };

  const hasAnyBalanceOfAnyFungibleTokens =
    assetsFungible.reduce((p, c) => p + BigInt(c.balance), 0n) > 0n;

  return (
    <Box maxW="736px">
      <Flex
        flexDir="column"
        gap="1rem"
        p="1rem"
        bg="neutral-2"
        maxW="736px"
        boxShadow={CARD_SHADOW}
        borderRadius="0.5rem"
      >
        <FormControl>
          <Field name="proposalMetadata.title">
            {({
              field,
              form: { setFieldValue, setFieldTouched },
            }: FieldProps<string, RoleFormValues>) => (
              <LabelWrapper label={t('proposalTitle', { ns: 'proposal' })}>
                <InputComponent
                  value={field.value}
                  onChange={e => {
                    setFieldValue(field.name, e.target.value);
                    setFieldTouched(field.name, true);
                  }}
                  testId={field.name}
                  placeholder="Proposal Title"
                  isRequired={false}
                  gridContainerProps={{
                    gridTemplateColumns: { base: '1fr', md: '1fr' },
                  }}
                />
              </LabelWrapper>
            )}
          </Field>
        </FormControl>
        <FormControl>
          <Field name="proposalMetadata.description">
            {({
              field,
              form: { setFieldValue, setFieldTouched },
            }: FieldProps<string, RoleFormValues>) => (
              <LabelWrapper label={t('proposalDescription', { ns: 'proposal' })}>
                <TextareaComponent
                  value={field.value}
                  onChange={e => {
                    setFieldValue(field.name, e.target.value);
                    setFieldTouched(field.name, true);
                  }}
                  isRequired={false}
                  placeholder={t('proposalDescriptionPlaceholder', { ns: 'proposal' })}
                  gridContainerProps={{
                    gridTemplateColumns: { base: '1fr', md: '1fr' },
                  }}
                />
              </LabelWrapper>
            )}
          </Field>
        </FormControl>

        <FormControl>
          <Field name="customNonce">
            {({ form: { setFieldValue } }: FieldProps<string, RoleFormValues>) => (
              <Flex
                w="100%"
                justifyContent="flex-end"
              >
                <CustomNonceInput
                  nonce={values.customNonce}
                  onChange={newNonce => setFieldValue('customNonce', newNonce)}
                />
              </Flex>
            )}
          </Field>
        </FormControl>
      </Flex>

      <Flex
        mt={4}
        mb={2}
        alignItems="center"
      >
        <Icon
          as={SquaresFour}
          w="1.5rem"
          h="1.5rem"
        />
        <Text
          textStyle="display-lg"
          ml={2}
        >
          {t('actions', { ns: 'actions' })}
        </Text>
      </Flex>
      {editedRoles.map((role, index) => {
        return (
          <RoleCardShort
            key={index}
            name={role.name}
            handleRoleClick={() => {
              setDrawerViewingRole(role);
            }}
            editStatus={role.editedRole?.status}
          />
        );
      })}
      {values.actions.map((action, index) => (
        <SendAssetsAction
          action={action}
          key={index}
          index={index}
          onRemove={idx => {
            setFieldValueTopLevel(
              'actions',
              values.actions.filter((_, i) => i !== idx),
            );
          }}
        />
      ))}
      <Button
        variant="secondary"
        mt="1rem"
        size="sm"
        onClick={onOpenAction}
      >
        <Icon as={Plus} />
        {t('addAction', { ns: 'actions' })}
      </Button>
      <ModalBase
        size="xl"
        isOpen={isOpenAction}
        onClose={onCloseAction}
        title={t('addAction', { ns: 'actions' })}
        isSearchInputModal={false}
      >
        <Flex
          gap="2"
          justifyContent="space-between"
        >
          <ActionCard
            title={t('transferAssets', { ns: 'actions' })}
            subtitle={t('transferAssetsSub', { ns: 'actions' })}
            icon={ArrowsDownUp}
            onClick={() => {
              onCloseAction();
              onOpenAssets();
            }}
            isDisabled={!hasAnyBalanceOfAnyFungibleTokens}
          />

          <ActionCard
            title={t('comingSoon', { ns: 'actions' })}
            subtitle={t('comingSoonSub', { ns: 'actions' })}
            icon={SquaresFour}
            onClick={() => {}}
            isDisabled
          />
        </Flex>
      </ModalBase>
      <ModalBase
        isOpen={isOpenAssets}
        onClose={onCloseAssets}
        title={t('transferAssets', { ns: 'actions' })}
        isSearchInputModal={false}
      >
        <SendAssetsModal
          submitButtonText={t('add')}
          showNonceInput={false}
          close={onCloseAssets}
          sendAssetsData={addSendAssetsAction}
        />
      </ModalBase>
      <Flex
        gap="1rem"
        mt="1rem"
        justifyContent="flex-end"
      >
        <Button
          variant="tertiary"
          onClick={close}
        >
          {t('cancel', { ns: 'common' })}
        </Button>
        <Button
          onClick={submitForm}
          isDisabled={isSubmitting}
        >
          {t('submitProposal')}
        </Button>
      </Flex>
      {drawerViewingRole !== undefined && (
        <>
          <Show below="md">
            <RolesDetailsDrawerMobile
              roleHat={drawerViewingRole}
              isOpen={drawerViewingRole !== undefined}
              onClose={handleCloseDrawer}
              onEdit={handleEditRoleClick}
            />
          </Show>
          <Show above="md">
            <RolesDetailsDrawer
              roleHat={drawerViewingRole}
              isOpen={drawerViewingRole !== undefined}
              onClose={handleCloseDrawer}
              onEdit={handleEditRoleClick}
            />
          </Show>
        </>
      )}
    </Box>
  );
}
