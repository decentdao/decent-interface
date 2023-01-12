import { VetoGuard__factory } from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { Dispatch, useEffect, useCallback, useMemo } from 'react';
import { useProvider, useSigner } from 'wagmi';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { GnosisAction } from '../constants';
import { IGnosis, GnosisActions, SafeInfoResponseWithGuard, ChildNode } from '../types';

export default function useNodes({
  gnosis,
  gnosisDispatch,
}: {
  gnosis: IGnosis;
  gnosisDispatch: Dispatch<GnosisActions>;
}) {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);
  const { fractalRegistryContract } = useSafeContracts();

  const { modules, safe, safeService } = gnosis;

  const fetchSubDAOs = useCallback(
    async (parentDAOAddress: string) => {
      const filter = fractalRegistryContract!.filters.FractalSubDAODeclared(parentDAOAddress);
      const events = await fractalRegistryContract!.queryFilter(filter);
      const subDAOsAddresses = events.map(({ args }) => args.subDAOAddress);

      return subDAOsAddresses;
    },
    [fractalRegistryContract]
  );

  const getDAOOwner = useCallback(
    async (safeInfo?: Partial<SafeInfoResponseWithGuard>) => {
      if (safeInfo && safeInfo.guard && signerOrProvider) {
        if (safeInfo.guard !== ethers.constants.AddressZero) {
          const guard = VetoGuard__factory.connect(safeInfo.guard, signerOrProvider);
          const guardOwner = await guard.owner();
          if (guardOwner !== safeInfo.address) {
            return guardOwner;
          }
        }
      }
      return undefined;
    },
    [signerOrProvider]
  );

  const mapSubDAOsToOwnedSubDAOs = useCallback(
    async (subDAOsAddresses: string[], parentDAOAddress: string): Promise<ChildNode[]> => {
      const controlledNodes: ChildNode[] = [];

      for (const safeAddress of subDAOsAddresses) {
        const safeInfo = (await safeService!.getSafeInfo(safeAddress)) as SafeInfoResponseWithGuard;

        if (safeInfo.guard) {
          if (safeInfo.guard === ethers.constants.AddressZero) {
            // Guard is not attached - seems like just gap in Safe API Service indexisng.
            // Still, need to cover this case
            const node: ChildNode = {
              address: safeAddress,
              childNodes: await mapSubDAOsToOwnedSubDAOs(
                (await fetchSubDAOs(safeAddress)) || [],
                safeAddress
              ),
            };
            controlledNodes.push(node);
          } else {
            const owner = await getDAOOwner(safeInfo);
            if (owner && owner === parentDAOAddress) {
              const node: ChildNode = {
                address: safeAddress,
                childNodes: await mapSubDAOsToOwnedSubDAOs(
                  (await fetchSubDAOs(safeAddress)) || [],
                  safeAddress
                ),
              };
              controlledNodes.push(node);
            }
          }
        }
      }

      return controlledNodes;
    },
    [safeService, fetchSubDAOs, getDAOOwner]
  );

  useEffect(() => {
    const loadDaoParent = async () => {
      if (safe && safe.guard && signerOrProvider) {
        const owner = await getDAOOwner(safe);
        if (owner) {
          gnosisDispatch({ type: GnosisAction.SET_DAO_PARENT, payload: owner });
        }
      } else {
        // Clearing the state
        gnosisDispatch({ type: GnosisAction.SET_DAO_PARENT, payload: '' });
      }
    };

    const loadDaoNodes = async () => {
      if (safe.address && signerOrProvider && safeService && fractalRegistryContract) {
        const declaredSubDAOs = await fetchSubDAOs(safe.address);
        const controlledNodes = await mapSubDAOsToOwnedSubDAOs(declaredSubDAOs, safe.address);

        gnosisDispatch({ type: GnosisAction.SET_DAO_CHILDREN, payload: controlledNodes });
      }
    };

    loadDaoParent();
    loadDaoNodes();
  }, [
    safe,
    modules,
    gnosisDispatch,
    signerOrProvider,
    safeService,
    fetchSubDAOs,
    getDAOOwner,
    mapSubDAOsToOwnedSubDAOs,
    fractalRegistryContract,
  ]);
}
