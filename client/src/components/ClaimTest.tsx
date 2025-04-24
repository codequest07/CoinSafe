import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useClaimAsset } from '@/hooks/useClaimAsset';
import { CoinsafeDiamondContract, facetAbis } from '@/lib/contract';
import { toast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import SuccessfulTxModal from './Modals/SuccessfulTxModal';

// This is a test component to demonstrate the useClaimAsset hook
export default function ClaimTest() {
  const [safeId, setSafeId] = useState<number>(1);
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const account = useActiveAccount();
  
  const { claimAsset, claimAllAssets, isLoading, error } = useClaimAsset({
    account,
    safeId,
    token: tokenAddress as `0x${string}`,
    coinSafeAddress: CoinsafeDiamondContract.address as `0x${string}`,
    coinSafeAbi: facetAbis.targetSavingsFacet,
    onSuccess: () => {
      setShowSuccessModal(true);
    },
    onError: (error) => {
      console.error('Claim error:', error);
    },
    toast,
  });
  
  const handleClaimSingle = async (e: React.FormEvent) => {
    if (!tokenAddress) {
      toast({
        title: 'Please enter a token address',
        variant: 'destructive',
      });
      return;
    }
    
    await claimAsset(e);
  };
  
  const handleClaimAll = async (e: React.FormEvent) => {
    await claimAllAssets(e);
  };
  
  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white rounded-lg">
      <h2 className="text-xl font-bold">Claim Test Component</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Safe ID:</label>
          <input
            type="number"
            value={safeId}
            onChange={(e) => setSafeId(Number(e.target.value))}
            className="w-full p-2 bg-gray-800 rounded"
          />
        </div>
        
        <div>
          <label className="block mb-2">Token Address (for single token claim):</label>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="w-full p-2 bg-gray-800 rounded"
            placeholder="0x..."
          />
        </div>
        
        <div className="flex space-x-4">
          <Button
            onClick={handleClaimSingle}
            disabled={isLoading || !tokenAddress}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Claiming...' : 'Claim Single Token'}
          </Button>
          
          <Button
            onClick={handleClaimAll}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Claiming...' : 'Claim All Tokens'}
          </Button>
        </div>
        
        {error && (
          <div className="p-4 bg-red-900/30 text-red-300 rounded">
            <p className="font-bold">Error:</p>
            <p>{error.message}</p>
          </div>
        )}
      </div>
      
      <SuccessfulTxModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        transactionType="claim"
        amount={0}
        token="tokens"
        additionalDetails={{
          subText: "Assets will be available in your wallet.",
        }}
      />
    </div>
  );
}
