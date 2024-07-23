import { Box, InputGroup, InputRightElement, IconButton, Grid } from '@chakra-ui/react';
import { FormEvent, useCallback, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { isAddress } from 'viem';
import { Search } from '../../assets/theme/custom/icons/Search';
import { EmptyBox } from '../../components/ui/containers/EmptyBox';
import { AddressInput } from '../../components/ui/forms/EthAddressInput';
import LabelWrapper from '../../components/ui/forms/LabelWrapper';
import { InfoBoxLoader } from '../../components/ui/loaders/InfoBoxLoader';
import PageHeader from '../../components/ui/page/Header/PageHeader';
import StreamCard from '../../components/ui/stream/StreamCard';
import useSablierStreams from '../../hooks/streams/useSablierStreams';

// @dev - potential place for claiming page
export default function StreamsPage() {
  const [searchAddress, setSearchAddress] = useState('');

  const { loading, data, error, handleSearchStreams } = useSablierStreams();

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (searchAddress && isAddress(searchAddress)) {
        await handleSearchStreams(searchAddress);
      } else {
        toast('Bruh, address provided is not a valid address!');
      }
    },
    [searchAddress, handleSearchStreams],
  );

  const emptyText = useMemo(() => {
    if (error) {
      return error.message;
    } else if (!searchAddress || !isAddress(searchAddress) || !data) {
      return 'Paste valid address into search box to find streams attached to that address, then hit that search button';
    } else if (!loading && data && data.streams.length == 0) {
      return 'No streams found for given address';
    }
  }, [data, error, loading, searchAddress]);

  return (
    <Box>
      <PageHeader
        title="Sablier Streams"
        breadcrumbs={[]}
      >
        <Box flex={1000}>
          <form onSubmit={handleSubmit}>
            <InputGroup
              h="full"
              flexDirection="column"
              justifyContent="center"
            >
              <Grid w="90%">
                <LabelWrapper
                  label="Search Streams"
                  subLabel="Paste address to find streams attached to this buddy"
                >
                  <AddressInput
                    value={searchAddress}
                    onChange={e => setSearchAddress(e.target.value)}
                  />
                </LabelWrapper>
              </Grid>

              <InputRightElement h="full">
                <IconButton
                  aria-label="search da sablier streams"
                  variant="primary"
                  size="icon-lg"
                  minW={16}
                  icon={
                    <Search
                      boxSize="1.5rem"
                      color="lilac--3"
                    />
                  }
                  type="submit"
                  isDisabled={!searchAddress || !isAddress(searchAddress)}
                />
              </InputRightElement>
            </InputGroup>
          </form>
        </Box>
      </PageHeader>
      {loading ? (
        <InfoBoxLoader />
      ) : emptyText ? (
        <EmptyBox emptyText={emptyText} />
      ) : data ? (
        data.streams.map(stream => (
          <StreamCard
            stream={stream}
            key={stream.id}
          />
        ))
      ) : null}
    </Box>
  );
}
