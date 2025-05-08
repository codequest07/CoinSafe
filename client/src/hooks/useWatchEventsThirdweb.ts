// import { useEffect, useMemo } from "react";
import {
  getContract,
  watchContractEvents,
} from "thirdweb";
// import { useContractEvents } from "thirdweb/react";
import { client, liskSepolia } from "@/lib/config";

import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { Abi } from "viem";
import { fundingFacetEvents, targetedSavingsFacetEvents } from "@/lib/contract-events";

// type EventHandler = (amountInUsd: number) => void;

// interface UseContractEventsProps {
//   onDeposit?: EventHandler;
//   onWithdraw?: EventHandler;
//   onSave?: EventHandler;
// }

export const useWatchEvents = async () => {
  const fundingFacet = getContract({
    client,
    address: CoinsafeDiamondContract.address,
    chain: liskSepolia,
    abi: facetAbis.fundingFacet as unknown as Abi,
  });

//   const emergencySavingsFacet = getContract({
//     client,
//     address: CoinsafeDiamondContract.address,
//     chain: liskSepolia,
//     abi: facetAbis.emergencySavingsFacet as Abi,
//   });

//   const automatedSavingsFacet = getContract({
//     client,
//     chain: liskSepolia,
//     address: CoinsafeDiamondContract.address,
//     abi: facetAbis.automatedSavingsFacet as Abi,
//   });

  const targetedSavingsFacet = getContract({
    client,
    address: CoinsafeDiamondContract.address,
    chain: liskSepolia,
    abi: facetAbis.targetSavingsFacet as Abi,
  });

  // const targetedSavingsContractEvents = useContractEvents({
  //   contract: targetedSavingsFacet,
  //   events: targetedSavingsFacetEvents,
  //   blockRange: 200,
  //   watch: true,
  // });

  // const emergencySavingsContractEvents = useContractEvents({
  //   contract: emergencySavingsFacet,
  //   events: emergencySavingsFacetEvents,
  //   blockRange: 200,
  //   watch: true,
  // });

  // const fundingContractEvents = useContractEvents({
  //   contract: fundingFacet,
  //   events: fundingFacetEvents,
  //   blockRange: 200,
  //   watch: true,
  // });

  // const automatedSavingsContractEvents = useContractEvents({
  //   contract: automatedSavingsFacet,
  //   events: automatedSavingsFacetEvents,
  //   blockRange: 200,
  //   watch: true,
  // });

  // console.log(targetedSavingsContractEvents, automatedSavingsContractEvents, fundingContractEvents, emergencySavingsContractEvents);

  const unwatchTargetSavings = await watchContractEvents({
    contract: targetedSavingsFacet,
    events: targetedSavingsFacetEvents,
    onEvents: (events) => {
      // do something with the events
      console.log("Target Savings events triggered", events);
    },
  });

  const unwatchFundingSavings = await watchContractEvents({
    contract: fundingFacet,
    events: fundingFacetEvents,
    onEvents: (events: any) => {
      // do something with the events
      console.log("Funding Facet events", events);
    },
  });

  return ()=> {
    unwatchFundingSavings();
    unwatchTargetSavings();
    console.log("watch events hook cleanup")
  }

//   // Main event handler function
//   const createEventHandler = (callback?: EventHandler) => {
//     return async (logs: any) => {
//       try {
//         const log = logs[0];
//         const { token, amount } = log.args;

//         const amountInUsd = await convertTokenAmountToUsd(token, amount);
//         if (amountInUsd === 0) return;

//         callback?.(amountInUsd);
//       } catch (error) {
//         console.error("Error processing event logs:", error);
//       }
//     };
//   };

//   const saveEventHandler = useMemo(() => createEventHandler(onSave), [onSave]);
//   const withdrawEventHandler = useMemo(
//     () => createEventHandler(onWithdraw),
//     [onWithdraw]
//   );
//   const depositEventHandler = useMemo(
//     () => createEventHandler(onDeposit),
//     [onDeposit]
//   );

//   const handleDeposited = (user: string, token: string, amount: string) => {
//     console.log(user);
//     const logs = [{ args: { token, amount } }];

//     depositEventHandler(logs);
//   };

//   const handleWithdrawn = (user: string, tokenType: string, amount: number) => {
//     console.log(user);

//     const logs = [{ args: { token: tokenType, amount } }];

//     withdrawEventHandler(logs);
//   };

//   const handleSaved = (
//     user: string,
//     token: string,
//     amount: number,
//     duration: number
//   ) => {
//     console.log(user, duration);

//     const logs = [{ args: { token, amount } }];

//     saveEventHandler(logs);
//   };

//   useEffect(() => {
//     const contract = new Contract(
//       CoinSafeContract.address as `0x${string}`, // Address of the contract
//       CoinSafeContract.abi.abi,
//       jsonRpcProvider
//     );

//     contract.on("DepositSuccessful", handleDeposited);

//     return () => {
//       contract.off("DepositSuccessful", handleDeposited);
//     };
//   }, []);

//   useEffect(() => {
//     const contract = new Contract(
//       CoinSafeContract.address as `0x${string}`, // Address of the contract
//       CoinSafeContract.abi.abi,
//       jsonRpcProvider
//     );

//     contract.on("SavedSuccessfully", handleSaved);

//     return () => {
//       contract.off("SavedSuccessfully", handleSaved);
//     };
//   }, []);

//   useEffect(() => {
//     const contract = new Contract(
//       CoinSafeContract.address as `0x${string}`, // Address of the contract
//       CoinSafeContract.abi.abi,
//       jsonRpcProvider
//     );

//     contract.on("Withdrawn", handleWithdrawn);

//     return () => {
//       contract.off("Withdrawn", handleWithdrawn);
//     };
//   }, []);
};
