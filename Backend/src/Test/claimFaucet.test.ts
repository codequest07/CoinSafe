import { claimFaucet } from "../controllers/faucetClaim";
import { Request, Response } from "express";

describe("Faucet Claim Function", () => {
  it("should return a successful claim response", async () => {
    const req = {} as Request;
    const res = {
      json: jest.fn((data) => console.log("Response JSON:", data)),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await claimFaucet(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  it("should return an error when faucet has low balance", async () => {
    const req = {} as Request;
    const res = {
      json: jest.fn((data) => console.log("Error Response JSON:", data)),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await claimFaucet(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
