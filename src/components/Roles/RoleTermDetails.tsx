import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Icon,
  Text,
} from '@chakra-ui/react';
import { CaretDown, CaretRight } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Address, Hex } from 'viem';
import { createRoleTermViewProps } from '../../services/roles/roleTerms';
import { useRolesStore } from '../../store/roles/useRolesStore';
import { RoleFormTermStatus } from '../../types/roles';
import NoDataCard from '../ui/containers/NoDataCard';
import { RoleTerm } from './RoleTerm';

type RoleTermDetailProp = {
  nominee: Address;
  termEndDate: Date;
  termNumber: number;
};

type CurrentTermProp = RoleTermDetailProp & { isActive: boolean | undefined };

function RoleTermRenderer({
  roleTerm,
  termStatus,
  displayLightContainer,
  hatId,
}: {
  hatId: Hex | undefined;
  roleTerm?: RoleTermDetailProp;
  termStatus: RoleFormTermStatus;
  displayLightContainer: boolean;
}) {
  const { getHat, hatsTree } = useRolesStore();

  if (!hatId || !hatsTree) {
    return null;
  }

  const roleHat = getHat(hatId);

  if (!roleTerm?.nominee || !roleTerm?.termEndDate || !roleHat) {
    return null;
  }

  const termProps = createRoleTermViewProps(
    roleTerm,
    termStatus,
    {
      adminHatWearer: hatsTree.adminHat.wearer!,
      roleHatId: hatId,
      roleHatWearer: roleHat.wearerAddress,
      roleTermActive: roleHat.roleTerms.currentTerm?.isActive ?? false,
      roleEligibilityAddress: roleHat.eligibility!,
      currentTermNominee: roleHat.roleTerms.currentTerm?.nominee!,
      previousTermNominee: roleHat.roleTerms.previousTerm?.nominee!,
    },
    displayLightContainer,
  );
  return <RoleTerm {...termProps} />;
}

function RoleTermExpiredTerms({
  hatId,
  roleTerms,
}: {
  hatId: Hex | undefined;
  roleTerms?: RoleTermDetailProp[];
}) {
  const { t } = useTranslation('roles');
  if (!roleTerms?.length) {
    return null;
  }
  return (
    <Box
      borderRadius="0.5rem"
      boxShadow="layeredShadowBorder"
    >
      <Accordion allowToggle>
        <AccordionItem
          borderTop="none"
          borderBottom="none"
          borderTopRadius="0.5rem"
          borderBottomRadius="0.5rem"
        >
          {({ isExpanded }) => (
            <>
              <AccordionButton
                borderTopRadius="0.5rem"
                borderBottomRadius="0.5rem"
                p="1rem"
              >
                <Flex
                  alignItems="center"
                  gap={2}
                >
                  <Icon
                    as={!isExpanded ? CaretDown : CaretRight}
                    boxSize="1.25rem"
                    color="lilac-0"
                  />
                  <Text
                    textStyle="button-base"
                    color="lilac-0"
                  >
                    {t('showPreviousTerms')}
                  </Text>
                </Flex>
              </AccordionButton>
              <Flex
                flexDir="column"
                gap={4}
              >
                {roleTerms.map((term, index) => {
                  return (
                    <AccordionPanel
                      key={index}
                      px="1rem"
                    >
                      <RoleTermRenderer
                        key={index}
                        hatId={hatId}
                        roleTerm={term}
                        termStatus={RoleFormTermStatus.Expired}
                        displayLightContainer={true}
                      />
                    </AccordionPanel>
                  );
                })}
              </Flex>
            </>
          )}
        </AccordionItem>
      </Accordion>
    </Box>
  );
}

export default function RoleTermDetails({
  hatId,
  currentTerm,
  nextTerm,
  expiredTerms,
}: {
  hatId: Hex | undefined;
  nextTerm: RoleTermDetailProp | undefined;
  currentTerm: CurrentTermProp | undefined;
  expiredTerms: RoleTermDetailProp[];
}) {
  const currentTermStatus = useMemo(() => {
    if (!!currentTerm) {
      if (!currentTerm.isActive) {
        return RoleFormTermStatus.ReadyToStart;
      }
      return RoleFormTermStatus.Current;
    }
    return RoleFormTermStatus.Pending;
  }, [currentTerm]);

  return (
    <Flex
      flexDir="column"
      gap={4}
    >
      {!currentTerm && (
        <NoDataCard
          translationNameSpace="roles"
          emptyText="noActiveTerms"
          emptyTextNotProposer="noActiveTermsNotProposer"
        />
      )}
      {/* Next Term */}
      <RoleTermRenderer
        hatId={hatId}
        roleTerm={nextTerm}
        termStatus={nextTerm ? RoleFormTermStatus.Queued : RoleFormTermStatus.Pending}
        displayLightContainer={false}
      />
      {/* Current Term */}
      <RoleTermRenderer
        hatId={hatId}
        roleTerm={currentTerm}
        termStatus={currentTermStatus}
        displayLightContainer={false}
      />
      <RoleTermExpiredTerms
        roleTerms={expiredTerms}
        hatId={hatId}
      />
    </Flex>
  );
}
