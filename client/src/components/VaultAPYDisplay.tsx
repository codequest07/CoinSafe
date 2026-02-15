import React from "react";
import { useVaultApy } from "@/hooks/useVaultApy";
import { useChainConfig } from "@/hooks/useChainConfig";

export const VaultAPYDisplay: React.FC<{
  vaultAddress: `0x${string}`;
  morphoBlueAddress: `0x${string}`;
}> = ({ vaultAddress, morphoBlueAddress }) => {
  const { chain } = useChainConfig();
  const { nativeApy, totalApr, fees, loading, error } = useVaultApy(
    vaultAddress,
    morphoBlueAddress,
    chain.id
  );

  if (loading) return <div>Loading APY...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Vault APY</h2>
      <p>
        {(
          Number(totalApr) +
          Number(nativeApy) -
          Number(nativeApy) * Number(fees)
        ).toFixed(2)}
        %
      </p>

      <p>{Number(fees)}%</p>
      <p>{nativeApy}%</p>
      <p>{totalApr}%</p>
    </div>
  );
};

// In App.tsx: <VaultDisplay vaultAddress="0xD92f564A29992251297980187a6B74FAa3D50699" />
