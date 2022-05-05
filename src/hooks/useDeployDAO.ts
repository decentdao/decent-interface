import { useCallback, useEffect } from "react";
import { useTransaction } from "../contexts/web3Data/transactions";
import { useNavigate } from "react-router";
import { useWeb3 } from "../contexts/web3Data";
import { BigNumber, ethers } from "ethers";
import { useAddresses } from "../contexts/web3Data/chains";
import { MetaFactory, MetaFactory__factory } from "../typechain-types";

export type TokenAllocation = {
  address: string;
  amount: number;
  addressError?: string;
};

const useDeployDAO = ({
  daoName,
  tokenName,
  tokenSymbol,
  tokenSupply,
  tokenAllocations,
  proposalThreshold,
  quorum,
  executionDelay,
  setPending,
  clearState,
}: {
  daoName: string | undefined;
  tokenName: string | undefined;
  tokenSymbol: string | undefined;
  tokenSupply: number | undefined;
  tokenAllocations: TokenAllocation[] | undefined;
  proposalThreshold: number | undefined;
  quorum: number | undefined;
  executionDelay: number | undefined;
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
  clearState: () => void;
}) => {
  const [{ signerOrProvider, chainId }] = useWeb3();
  const addresses = useAddresses(chainId);

  const [contractCallDeploy, contractCallPending] = useTransaction();
  const navigate = useNavigate();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  let deployDao = useCallback(() => {
    if (
      !signerOrProvider ||
      !daoName ||
      !tokenName ||
      !tokenSymbol ||
      !tokenSupply ||
      !tokenAllocations ||
      (!proposalThreshold && proposalThreshold !== 0) ||
      !quorum ||
      !executionDelay ||
      !setPending ||
      !addresses.metaFactory?.address ||
      !addresses.daoFactory?.address ||
      !addresses.dao?.address ||
      !addresses.accessControl?.address ||
      !addresses.treasuryModuleFactory?.address ||
      !addresses.treasuryModule?.address ||
      !addresses.tokenFactory?.address ||
      !addresses.governorFactory?.address ||
      !addresses.governorModule?.address ||
      !addresses.timelockUpgradeable?.address
    ) {
      return;
    }

    const factory: MetaFactory = MetaFactory__factory.connect(
      addresses.metaFactory?.address,
      signerOrProvider
    );
    const abiCoder = new ethers.utils.AbiCoder();

    const createDAOParams = {
      daoImplementation: addresses.dao?.address,
      accessControlImplementation: addresses.accessControl?.address,
      daoName: daoName,
      roles: [
        "EXECUTE_ROLE",
        "UPGRADE_ROLE",
        "WITHDRAWER_ROLE",
        "GOVERNOR_ROLE",
      ],
      rolesAdmins: ["DAO_ROLE", "DAO_ROLE", "DAO_ROLE", "DAO_ROLE"],
      members: [[], [], [], []],
      daoFunctionDescs: [
        "execute(address[],uint256[],bytes[])",
        "upgradeTo(address)",
      ],
      daoActionRoles: [["EXECUTE_ROLE"], ["UPGRADE_ROLE"]],
    };

    const moduleFactoriesCalldata = [
      {
        factory: addresses.treasuryModuleFactory?.address, // Treasury Factory
        data: [
          abiCoder.encode(["address"], [addresses.treasuryModule?.address]),
        ],
        value: 0,
        newContractAddressesToPass: [1],
        addressesReturned: 1,
      },
      {
        factory: addresses.tokenFactory?.address, // Token Factory
        data: [
          abiCoder.encode(["string"], [tokenName]),
          abiCoder.encode(["string"], [tokenSymbol]),
          abiCoder.encode(
            ["address[]"],
            [tokenAllocations.map((tokenAllocation) => tokenAllocation.address)]
          ),
          abiCoder.encode(
            ["uint256[]"],
            [
              tokenAllocations.map((tokenAllocation) =>
                ethers.utils.parseUnits(tokenAllocation.amount.toString(), 18)
              ),
            ]
          ),
          abiCoder.encode(
            ["uint256"],
            [ethers.utils.parseUnits(tokenSupply.toString(), 18)]
          ),
        ],
        value: 0,
        newContractAddressesToPass: [2],
        addressesReturned: 1,
      },
      {
        factory: addresses.governorFactory?.address, // Governor Factory
        data: [
          abiCoder.encode(["address"], [addresses.governorModule?.address]), // Governor Impl
          abiCoder.encode(
            ["address"],
            [addresses.timelockUpgradeable?.address]
          ), // Timelock Impl
          abiCoder.encode(["string"], [""]),
          abiCoder.encode(["uint64"], [BigNumber.from("0")]), // vote extension
          abiCoder.encode(["uint256"], [BigNumber.from("0")]), // Todo: change voteDelay back to 6545 blocks for prod
          abiCoder.encode(["uint256"], [BigNumber.from("10")]), // Todo: change votingPeriod back to 45818 blocks (1 week)
          abiCoder.encode(
            ["uint256"],
            [BigNumber.from(proposalThreshold.toString())]
          ), // Threshold
          abiCoder.encode(["uint256"], [BigNumber.from(quorum.toString())]), // Quorum
          abiCoder.encode(["uint256"], [BigNumber.from("1")]), // Access Control Index
        ],
        value: 0,
        newContractAddressesToPass: [0, 1, 3],
        addressesReturned: 2,
      },
    ];

    const moduleActionCalldata = {
      contractIndexes: [2, 2, 2, 2, 2, 2, 4, 5, 5, 5, 5, 5],
      functionDescs: [
        "withdrawEth(address[],uint256[])",
        "depositERC20Tokens(address[],address[],uint256[])",
        "withdrawERC20Tokens(address[],address[],uint256[])",
        "depositERC721Tokens(address[],address[],uint256[])",
        "withdrawERC721Tokens(address[],address[],uint256[])",
        "upgradeTo(address)",
        "upgradeTo(address)",
        "upgradeTo(address)",
        "updateDelay(uint256)",
        "scheduleBatch(address[],uint256[],bytes[],bytes32,bytes32,uint256)",
        "cancel(bytes32)",
        "executeBatch(address[],uint256[],bytes[],bytes32,bytes32)",
      ],
      roles: [
        ["WITHDRAWER_ROLE"],
        ["WITHDRAWER_ROLE"],
        ["WITHDRAWER_ROLE"],
        ["WITHDRAWER_ROLE"],
        ["WITHDRAWER_ROLE"],
        ["UPGRADE_ROLE"],
        ["UPGRADE_ROLE"],
        ["UPGRADE_ROLE"],
        ["GOVERNOR_ROLE"],
        ["GOVERNOR_ROLE"],
        ["GOVERNOR_ROLE"],
        ["GOVERNOR_ROLE"],
      ],
    };
    contractCallDeploy({
      contractFn: () =>
        factory.createDAOAndModules(
          addresses.daoFactory?.address!,
          0,
          createDAOParams,
          moduleFactoriesCalldata,
          moduleActionCalldata,
          [[5], [0], [0], [4]]
        ),
      pendingMessage: "Deploying Fractal...",
      failedMessage: "Deployment Failed",
      successMessage: "DAO Created",
      successCallback: (receipt) => {
        const event = receipt.events?.filter((x) => {
          return x.address === addresses.daoFactory?.address;
        });
        if (event === undefined || event[0].topics[1] === undefined) {
          return "";
        } else {
          const daoAddress = abiCoder.decode(["address"], event[0].topics[1]);
          clearState();
          navigate(`/daos/${daoAddress}`);
        }
      },
      rpcErrorCallback: (error: any) => {
        console.error(error);
      },
    });
  }, [
    signerOrProvider,
    daoName,
    tokenName,
    tokenSymbol,
    tokenSupply,
    tokenAllocations,
    proposalThreshold,
    quorum,
    executionDelay,
    setPending,
    clearState,
    addresses.metaFactory?.address,
    addresses.daoFactory?.address,
    addresses.dao?.address,
    addresses.accessControl?.address,
    addresses.treasuryModuleFactory?.address,
    addresses.treasuryModule?.address,
    addresses.tokenFactory?.address,
    addresses.governorFactory?.address,
    addresses.governorModule?.address,
    addresses.timelockUpgradeable?.address,
    contractCallDeploy,
    navigate,
  ]);
  return deployDao;
};

export default useDeployDAO;
