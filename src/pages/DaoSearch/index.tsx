import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';
import ConnectWalletToast from '../../components/ConnectWalletToast';
import ContentBox from '../../components/ui/ContentBox';
import { PrimaryButton } from '../../components/ui/forms/Button';
import Input from '../../components/ui/forms/Input';
import InputBox from '../../components/ui/forms/InputBox';
import H1 from '../../components/ui/H1';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import useSearchDao from '../../hooks/useSearchDao';

function DAOSearch() {
  const {
    state: { account },
  } = useWeb3Provider();
  const navigate = useNavigate();

  const [searchAddressInput, setSearchAddressInput] = useState('');
  const [searchAddr, setSearchAddr] = useState<string>();
  const {
    errorMessage,
    loading,
    address,
    addressNodeType,
    validAddress,
    resetErrorState,
    updateSearchString,
  } = useSearchDao();

  const searchOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    resetErrorState();
    setSearchAddr(event.target.value);
  };

  /**
   * search string is set inside useSearchDao hook which checks for validity and
   * if it matches an existing DAO
   *
   * @dev event.preventDefault() is called after setting search string,
   * otherwise the search string will not correctly set
   *
   * @param event
   */
  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    updateSearchString(searchAddressInput!);
    event.preventDefault();
  };

  /**
   * handles navigation when valid address is submitted
   *
   */
  useEffect(() => {
    if (address && validAddress && addressNodeType !== undefined) {
      navigate(address!, { state: { validatedAddress: address } });
    }
  }, [navigate, address, validAddress, addressNodeType]);

  useEffect(() => {
    if (searchAddr === undefined) {
      setSearchAddressInput('');
      return;
    }
    setSearchAddressInput(searchAddr);
  }, [searchAddr]);

  const { t } = useTranslation(['common', 'dashboard']);

  return (
    <div>
      <ConnectWalletToast label="To search for a Fractal" />
      <H1>{t('titleSearch', { ns: 'dashboard' })}</H1>
      <ContentBox>
        <form onSubmit={handleSearchSubmit}>
          <InputBox>
            <div className="flex items-center">
              <div className="flex-grow">
                <Input
                  value={searchAddressInput}
                  onChange={searchOnChange}
                  label={t('address')}
                  subLabel={t('sublabelSearch', { ns: 'dashboard' })}
                  type="text"
                  errorMessage={errorMessage}
                />
              </div>

              <PrimaryButton
                type="submit"
                className="self-start mt-5 "
                label={t('search')}
                isLoading={loading}
                disabled={!!errorMessage || loading || !searchAddressInput || !account}
              />
            </div>
          </InputBox>
        </form>
      </ContentBox>
    </div>
  );
}

export default DAOSearch;
