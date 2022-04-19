import { useState, useEffect } from "react";
import { DAO, AccessControl } from "../typechain-types";

type ModuleActionRoleEvents = {
  address: string;
  addEventCount: number;
  removeEventCount: number;
};

const useModuleAddresses = (
  daoContract: DAO | undefined,
  accessControlContract: AccessControl | undefined
) => {
  const [addActionRoleTargets, setAddActionRoleTargets] = useState<string[]>([]);
  const [removeActionRoleTargets, setRemoveActionRoleTargets] =
    useState<string[]>([]);
  const [modulesActionRoleEvents, setModulesActionRoleEvents] =
    useState<ModuleActionRoleEvents[]>();
  const [moduleAddresses, setModuleAddresses] = useState<string[]>();

  // Get initial add action targets
  useEffect(() => {
    if (!daoContract || !accessControlContract) {
      return;
    }

    const filter = accessControlContract.filters.ActionRoleAdded();

    accessControlContract
      .queryFilter(filter)
      .then((events) => {
        setAddActionRoleTargets(
          events
            .filter(event => event.args.target !== daoContract.address)
            .map(event => event.args.target)
        );
      })
      .catch(console.error);
  }, [daoContract, accessControlContract]);

  // Setup add action targets event listener
  useEffect(() => {
    if (!daoContract || !accessControlContract) {
      return;
    }

    const filter = accessControlContract.filters.ActionRoleAdded();

    const listenerCallback = (target: string, functionDesc: string, encodedSig: string, role: string, _: any) => {
      if (target === daoContract.address) {
        return;
      }

      setAddActionRoleTargets([...addActionRoleTargets, target]);
    }

    accessControlContract.on(filter, listenerCallback);

    return () => { accessControlContract.off(filter, listenerCallback) };
  }, [daoContract, accessControlContract, addActionRoleTargets]);

  // Get initial remove action targets
  useEffect(() => {
    if (!daoContract || !accessControlContract) {
      return;
    }

    const filter = accessControlContract.filters.ActionRoleRemoved();

    accessControlContract
      .queryFilter(filter)
      .then((events) => {
        setRemoveActionRoleTargets(
          events
            .filter(event => event.args.target !== daoContract.address)
            .map(event => event.args.target)
        );
      })
      .catch(console.error);
  }, [daoContract, accessControlContract]);

  // Setup remove action targets event listener
  useEffect(() => {
    if (!daoContract || !accessControlContract) {
      return;
    }

    const filter = accessControlContract.filters.ActionRoleRemoved();

    const listenerCallback = (target: string, functionDesc: string, encodedSig: string, role: string, _: any) => {
      if (target === daoContract.address) {
        return;
      }

      setRemoveActionRoleTargets([...removeActionRoleTargets, target]);
    }

    accessControlContract.on(filter, listenerCallback);

    return () => { accessControlContract.off(filter, listenerCallback) };
  }, [daoContract, accessControlContract, removeActionRoleTargets]);

  // Get Module action role events
  useEffect(() => {
    const newModulesActionRoleEvents: ModuleActionRoleEvents[] = [];

    addActionRoleTargets.forEach((target) => {
      const index = newModulesActionRoleEvents.findIndex((module) => {
        return module.address === target;
      });

      if (index !== -1) {
        newModulesActionRoleEvents[index].addEventCount++;
      } else {
        const newModuleActionRoleEvents: ModuleActionRoleEvents = {
          address: target,
          addEventCount: 1,
          removeEventCount: 0,
        };

        newModulesActionRoleEvents.push(newModuleActionRoleEvents);
      }
    });

    removeActionRoleTargets.forEach((target) => {
      const index = newModulesActionRoleEvents.findIndex((module) => {
        return module.address === target;
      });

      if (index === -1) {
        console.error("shouldn't see this, trying to remove event that wasn't added")
        return;
      }

      newModulesActionRoleEvents[index].removeEventCount++;
    });

    setModulesActionRoleEvents(newModulesActionRoleEvents);
  }, [addActionRoleTargets, removeActionRoleTargets]);

  // Get Module addresses
  useEffect(() => {
    if(!modulesActionRoleEvents) {
      setModuleAddresses(undefined);
      return;
    }

    setModuleAddresses(
      modulesActionRoleEvents
        .filter(module => module.addEventCount > module.removeEventCount)
        .map(module => module.address)
    );
    
  }, [modulesActionRoleEvents]);

  return moduleAddresses;
};

export default useModuleAddresses;
