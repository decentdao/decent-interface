import { Box, Input, RadioGroup } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { URL_DOCS_GOV_TYPES } from '../../../constants/url';
import { createAccountSubstring } from '../../../hooks/utils/useGetAccountName';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useDaoInfoStore } from '../../../store/daoInfo/useDaoInfoStore';
import { GovernanceType, ICreationStepProps, VotingStrategyType } from '../../../types';
import { InputComponent, LabelComponent } from '../../ui/forms/InputComponent';
import LabelWrapper from '../../ui/forms/LabelWrapper';
import { RadioWithText } from '../../ui/forms/Radio/RadioWithText';
import ExternalLink from '../../ui/links/ExternalLink';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';

export enum DAOCreateMode {
  ROOTDAO,
  SUBDAO,
  EDIT,
}

export function EstablishEssentials(props: ICreationStepProps) {
  const { t } = useTranslation(['daoCreate', 'common']);
  const { values, setFieldValue, isSubmitting, transactionPending, isSubDAO, errors, mode } = props;

  const { daoName, daoSnapshotENS, safe } = useDaoInfoStore();

  const isEdit = mode === DAOCreateMode.EDIT;

  const safeAddress = safe?.address;

  useEffect(() => {
    if (isEdit) {
      setFieldValue('essentials.daoName', daoName, false);
      if (safeAddress && createAccountSubstring(safeAddress) !== daoName) {
        // Pre-fill the snapshot URL form field when editing
        setFieldValue('essentials.snapshotENS', daoSnapshotENS || '', false);
      }
    }
  }, [setFieldValue, mode, daoName, daoSnapshotENS, isEdit, safeAddress]);

  const daoNameDisabled =
    isEdit && !!daoName && !!safeAddress && createAccountSubstring(safeAddress) !== daoName;

  // If in governance edit mode and snapshot URL is already set, disable the field
  const snapshotENSDisabled = isEdit && !!daoSnapshotENS;

  const handleGovernanceChange = (value: string) => {
    if (value === GovernanceType.AZORIUS_ERC20) {
      setFieldValue('azorius.votingStrategyType', VotingStrategyType.LINEAR_ERC20);
    } else if (value === GovernanceType.AZORIUS_ERC721) {
      setFieldValue('azorius.votingStrategyType', VotingStrategyType.LINEAR_ERC721);
    }

    setFieldValue('essentials.governance', value);
  };

  const { createOptions } = useNetworkConfig();

  return (
    <>
      <StepWrapper
        mode={mode}
        isSubDAO={isSubDAO}
        isFormSubmitting={!!isSubmitting || transactionPending}
        titleKey="titleEssentials"
      >
        <InputComponent
          label={t('labelDAOName')}
          helper={t('helperDAOName')}
          isRequired
          value={values.essentials.daoName}
          id="essentials-daoName"
          onChange={cEvent => setFieldValue('essentials.daoName', cEvent.target.value, true)}
          onBlur={cEvent => setFieldValue('essentials.daoName', cEvent.target.value.trim(), true)}
          disabled={daoNameDisabled}
          placeholder={t('daoNamePlaceholder')}
          testId="essentials-daoName"
        />
        <Box
          mt="2rem"
          mb="1.5rem"
        >
          <LabelComponent
            label={t('labelChooseGovernance')}
            helper={t('helperChooseGovernance')}
            isRequired
          >
            <RadioGroup
              display="flex"
              flexDirection="column"
              name="governance"
              gap={4}
              mt="-0.5rem" // RadioGroup renders empty paragraph with margin, seems like this is only feasible way to align this group
              id="governance"
              value={values.essentials.governance}
              onChange={handleGovernanceChange}
            >
              {createOptions.includes(GovernanceType.AZORIUS_ERC20) && (
                <RadioWithText
                  label={t('labelAzoriusErc20Gov')}
                  description={t('descAzoriusErc20Gov')}
                  testId="choose-azorius"
                  value={GovernanceType.AZORIUS_ERC20}
                  tooltip={
                    <Trans
                      i18nKey="tooltipTokenVoting"
                      ns="daoCreate"
                    >
                      placeholder
                      <ExternalLink href={URL_DOCS_GOV_TYPES}>link</ExternalLink>
                    </Trans>
                  }
                />
              )}
              {createOptions.includes(GovernanceType.AZORIUS_ERC721) && (
                <RadioWithText
                  label={t('labelAzoriusErc721Gov')}
                  description={t('descAzoriusErc721Gov')}
                  testId="choose-azorius-erc721"
                  value={GovernanceType.AZORIUS_ERC721}
                  tooltip={
                    <Trans
                      i18nKey="tooltipNftVoting"
                      ns="daoCreate"
                    >
                      placeholder
                      <ExternalLink href={URL_DOCS_GOV_TYPES}>link</ExternalLink>
                    </Trans>
                  }
                />
              )}
              {createOptions.includes(GovernanceType.MULTISIG) && (
                <RadioWithText
                  label={t('labelMultisigGov')}
                  description={t('descMultisigGov')}
                  testId="choose-multisig"
                  value={GovernanceType.MULTISIG}
                  tooltip={
                    <Trans
                      i18nKey="tooltipMultisig"
                      ns="daoCreate"
                    >
                      placeholder
                      <ExternalLink href={URL_DOCS_GOV_TYPES}>link</ExternalLink>
                    </Trans>
                  }
                />
              )}
            </RadioGroup>
          </LabelComponent>
        </Box>
        <LabelComponent
          label={t('snapshot')}
          helper={t('snapshotHelper')}
          isRequired={false}
        >
          <LabelWrapper errorMessage={errors?.essentials?.snapshotENS}>
            <Input
              value={values.essentials.snapshotENS}
              onChange={cEvent =>
                setFieldValue('essentials.snapshotENS', cEvent.target.value.toLowerCase(), true)
              }
              isDisabled={snapshotENSDisabled}
              data-testid="essentials-snapshotENS"
              placeholder="example.eth"
              isInvalid={!!errors?.essentials?.snapshotENS}
            />
          </LabelWrapper>
        </LabelComponent>
      </StepWrapper>
      <StepButtons
        {...props}
        isNextDisabled={
          (!!errors.essentials && Object.keys(errors.essentials).length > 0) ||
          (isEdit && values.essentials.governance === GovernanceType.MULTISIG)
        }
        isEdit={isEdit}
      />
    </>
  );
}
