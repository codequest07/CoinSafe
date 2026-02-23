import { ethers } from "ethers";

export type SignedAprPayload = {
  tokenAddress: string; // can be 0x000.. for claimAll
  aprBasisPoints: number; // e.g. 1890 = 18.90%
  nonce: number; // milliseconds
  signature: string; // 65-byte hex signature
  signer: string; // signer address
};

/**
 * Signs APR data in the exact format expected by the on-chain APRValidator:
 * messageHash = keccak256(abi.encodePacked(token, aprBps, nonce))
 * signature = signMessage(bytes(messageHash))  // EIP-191 prefix
 */
export class APRSigningService {
  private wallet: ethers.Wallet;

  constructor(privateKey?: string) {
    const pk =
      privateKey ||
      process.env.APR_SIGNER_PRIVATE_KEY ||
      process.env.PRIVATE_KEY ||
      process.env.WALLET_PRIVATE_KEY;
    if (!pk) {
      throw new Error(
        "APR signer private key is not set (set APR_SIGNER_PRIVATE_KEY or PRIVATE_KEY or WALLET_PRIVATE_KEY)",
      );
    }
    this.wallet = new ethers.Wallet(pk);
  }

  getSignerAddress(): string {
    return this.wallet.address;
  }

  async signApr(params: {
    tokenAddress: string;
    aprBasisPoints: number;
    nonce: number;
  }): Promise<SignedAprPayload> {
    const tokenAddress = ethers.getAddress(params.tokenAddress);
    const aprBasisPoints = Math.floor(params.aprBasisPoints);
    const nonce = Math.floor(params.nonce);

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "uint256", "uint256"],
      [tokenAddress, aprBasisPoints, nonce],
    );

    // signMessage(bytes32) => prefixes "\x19Ethereum Signed Message:\n32" then keccak256
    const signature = await this.wallet.signMessage(
      ethers.getBytes(messageHash),
    );

    return {
      tokenAddress,
      aprBasisPoints,
      nonce,
      signature,
      signer: this.wallet.address,
    };
  }
}
