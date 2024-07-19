import { Flex, Icon, Box, Text } from '@chakra-ui/react';
import { Info, ArrowUpRight } from '@phosphor-icons/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TOOLTIP_MAXW } from '../../../../constants/common';
import ExternalLink from '../../../ui/links/ExternalLink';
import ModalTooltip from '../../../ui/modals/ModalTooltip';

export function SectionTitle({
  title,
  subTitle,
  externalLink,
}: {
  title: string;
  subTitle: string;
  externalLink?: string;
}) {
  const { t } = useTranslation(['common']);
  const titleRef = useRef<HTMLDivElement>(null);
  return (
    <Flex flexDir="column">
      <Flex
        justifyContent="space-between"
        alignItems="center"
      >
        <Box ref={titleRef}>
          <ModalTooltip
            containerRef={titleRef}
            maxW={TOOLTIP_MAXW}
            // @todo add COPY
            label="I need copy"
          >
            <Flex
              alignItems="center"
              gap="0.25rem"
            >
              <Text
                textStyle="display-lg"
                color="white-0"
              >
                {title}
              </Text>
              <Icon as={Info} />
            </Flex>
          </ModalTooltip>
        </Box>
        {externalLink && (
          <ExternalLink href={externalLink}>
            <Flex
              alignItems="center"
              gap="0.25rem"
            >
              {t('learnMore')}
              <Icon
                as={ArrowUpRight}
                boxSize="1rem"
              />
            </Flex>
          </ExternalLink>
        )}
      </Flex>
      <Text
        textStyle="label-base"
        color="neutral-7"
      >
        {subTitle}
      </Text>
    </Flex>
  );
}
