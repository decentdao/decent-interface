import { useState, useEffect, useCallback } from 'react';
import { GnosisWrapper } from '../../../assets/typechain-types/gnosis-wrapper';

const useGnosisEvents = (gnosisWrapperContract?: GnosisWrapper) => {
  // TODO: Get Transaction & Proposal events, make this hook more modular - just as useTreasuryEvents
  const [allEvents, setAllEvents] = useState<any>([]);

  const getPastEvents = useCallback(
    async (filter: any) => {
      if (gnosisWrapperContract) {
        const events = await gnosisWrapperContract.queryFilter(filter);
        return events;
      }
      return [];
    },
    [gnosisWrapperContract]
  );

  useEffect(() => {
    const getData = async () => {
      if (gnosisWrapperContract) {
        const events = await getPastEvents(gnosisWrapperContract.filters);
        setAllEvents(events);
      }
    };
    getData();
  }, [gnosisWrapperContract, getPastEvents]);
  return {
    events: allEvents,
  };
};

export default useGnosisEvents;
