import { Flex } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import ContentBoxTitle from '../../../ui/containers/ContentBox/ContentBoxTitle';
import { IInputSection } from '../../presenters/CreateDAOPresenter';

export function InputSection({ label }: IInputSection, { children }: PropsWithChildren<{}>) {
  const { t } = useTranslation('daoCreate');
  return (
    <Flex
      flexDirection="column"
      gap={8}
    >
      {label && <ContentBoxTitle>{t('titleTokenParams')}</ContentBoxTitle>}
      {children}
    </Flex>
  );
}
