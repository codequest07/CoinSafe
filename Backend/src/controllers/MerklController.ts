import { Request, Response } from "express";
import { MerklService, MerklOpportunity } from "../services/MerklService";
import MerklAPRModel, { IMerklAPR } from "../Models/MerklAPRModel";
import { APRSigningService } from "../services/APRSigningService";
import { ethers } from "ethers";

export class MerklController {
  private merklService: MerklService;
  private aprSigningService: APRSigningService;

  constructor() {
    this.merklService = new MerklService();
    this.aprSigningService = new APRSigningService();
  }

  /**
   * Fetch and store current APR data for a specific opportunity
   * @param req - Express request object
   * @param res - Express response object
   */
  async fetchAndStoreAPR(req: Request, res: Response): Promise<void> {
    try {
      const { opportunityName, chainId } = req.body;

      if (!opportunityName) {
        res.status(400).json({
          success: false,
          error: "Opportunity name is required",
        });
        return;
      }

      console.log(`🔍 Fetching APR data for opportunity: ${opportunityName}`);

      // Fetch opportunity data from Merkl API
      const opportunity: MerklOpportunity | null =
        await this.merklService.fetchOpportunityByName(
          opportunityName,
          chainId,
        );

      if (!opportunity) {
        res.status(404).json({
          success: false,
          error: `Opportunity '${opportunityName}' not found`,
        });
        return;
      }

      // Check if we already have data for this opportunity today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingRecords = await MerklAPRModel.find({
        opportunityName: opportunity.name,
        chainId: opportunity.chainId,
        timestamp: {
          $gte: today,
          $lt: tomorrow,
        },
      });

      if (existingRecords.length > 0) {
        console.log(
          `📊 APR data already exists for ${opportunity.name} today (${existingRecords.length} tokens)`,
        );
        res.json({
          success: true,
          message: "APR data already exists for today",
          data: existingRecords,
        });
        return;
      }

      // Define the specific tokens we want to track
      const targetTokens = [
        "LSK",
        "USDC",
        "USDC.e",
        "USDT0",
        "USD₮0",
        "Re7USDT0",
        "Re7USDC",
      ];

      // Extract and store APR data for specific tokens only
      const savedRecords = [];

      if (opportunity.tokens && opportunity.tokens.length > 0) {
        for (const token of opportunity.tokens) {
          // Only process tokens we're interested in
          if (targetTokens.includes(token.symbol)) {
            // Calculate APR for this specific token
            // For now, we'll use the opportunity's overall APR
            // In the future, this could be calculated per token based on TVL breakdown
            const tokenAPR = opportunity.apr; // This could be calculated differently per token

            const aprRecord = new MerklAPRModel({
              opportunityName: opportunity.name,
              chainId: opportunity.chainId,
              tokenSymbol: token.symbol,
              tokenName: token.name || "Unknown Token",
              tokenAddress: token.address || "",
              apr: tokenAPR,
              timestamp: new Date(),
              rawData: {
                token: token,
                opportunity: opportunity,
              },
            });

            const savedRecord = await aprRecord.save();
            savedRecords.push(savedRecord);

            console.log(
              `✅ APR data stored for ${token.symbol} (${token.name}): ${tokenAPR}%`,
            );
          } else {
            console.log(
              `⏭️ Skipping ${
                token.symbol
              } - not in target tokens (${targetTokens.join(", ")})`,
            );
          }
        }
      } else {
        console.log(`⚠️ No tokens found in opportunity: ${opportunity.name}`);
      }

      if (savedRecords.length === 0) {
        console.log(
          `⚠️ No target tokens found in opportunity: ${opportunity.name}`,
        );
        res.json({
          success: true,
          message: `No target tokens (${targetTokens.join(
            ", ",
          )}) found in this opportunity`,
          data: [],
        });
        return;
      }

      res.json({
        success: true,
        message: `APR data fetched and stored successfully for ${savedRecords.length} tokens`,
        data: savedRecords,
      });
    } catch (error) {
      console.error("❌ Error fetching and storing APR data:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  /**
   * Get historical APR data for a specific opportunity
   * @param req - Express request object
   * @param res - Express response object
   */
  async getHistoricalAPR(req: Request, res: Response): Promise<void> {
    try {
      const {
        opportunityName,
        chainId,
        tokenSymbol,
        tokenAddress,
        startDate,
        endDate,
        limit = 100,
      } = req.query;

      if (!opportunityName) {
        res.status(400).json({
          success: false,
          error: "Opportunity name is required",
        });
        return;
      }

      // Build query filter
      const filter: any = {
        opportunityName: opportunityName as string,
      };

      if (chainId) {
        filter.chainId = parseInt(chainId as string);
      }

      if (tokenSymbol) {
        filter.tokenSymbol = tokenSymbol as string;
      }

      if (tokenAddress) {
        filter.tokenAddress = tokenAddress as string;
      }

      // Add date range filter
      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) {
          filter.timestamp.$gte = new Date(startDate as string);
        }
        if (endDate) {
          filter.timestamp.$lte = new Date(endDate as string);
        }
      }

      // Fetch historical data
      const historicalData = await MerklAPRModel.find(filter)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit as string))
        .select(
          "opportunityName chainId tokenSymbol tokenName tokenAddress apr timestamp createdAt",
        );

      // Calculate statistics
      const aprValues = historicalData.map((record) => record.apr);
      const stats = {
        count: historicalData.length,
        latest: historicalData.length > 0 ? historicalData[0].apr : null,
        average:
          aprValues.length > 0
            ? aprValues.reduce((a, b) => a + b, 0) / aprValues.length
            : 0,
        min: aprValues.length > 0 ? Math.min(...aprValues) : 0,
        max: aprValues.length > 0 ? Math.max(...aprValues) : 0,
      };

      res.json({
        success: true,
        data: historicalData,
        statistics: stats,
        query: {
          opportunityName,
          chainId,
          tokenSymbol,
          tokenAddress,
          startDate,
          endDate,
          limit,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching historical APR data:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  /**
   * Get all tracked opportunities
   * @param req - Express request object
   * @param res - Express response object
   */
  async getTrackedOpportunities(req: Request, res: Response): Promise<void> {
    try {
      const opportunities = await MerklAPRModel.aggregate([
        {
          $group: {
            _id: {
              opportunityName: "$opportunityName",
              chainId: "$chainId",
              tokenSymbol: "$tokenSymbol",
            },
            tokenName: { $first: "$tokenName" },
            tokenAddress: { $first: "$tokenAddress" },
            latestAPR: { $first: "$apr" },
            latestTimestamp: { $first: "$timestamp" },
            recordCount: { $sum: 1 },
            firstRecord: { $last: "$timestamp" },
          },
        },
        {
          $project: {
            opportunityName: "$_id.opportunityName",
            chainId: "$_id.chainId",
            tokenSymbol: "$_id.tokenSymbol",
            tokenName: 1,
            tokenAddress: 1,
            latestAPR: 1,
            latestTimestamp: 1,
            recordCount: 1,
            firstRecord: 1,
          },
        },
        {
          $sort: { latestTimestamp: -1 },
        },
      ]);

      res.json({
        success: true,
        data: opportunities,
      });
    } catch (error) {
      console.error("❌ Error fetching tracked opportunities:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  /**
   * Health check endpoint
   * @param req - Express request object
   * @param res - Express response object
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const merklApiHealthy = await this.merklService.healthCheck();

      // Check database connection
      const dbHealthy = await MerklAPRModel.countDocuments()
        .then(() => true)
        .catch(() => false);

      res.json({
        success: true,
        health: {
          merklApi: merklApiHealthy,
          database: dbHealthy,
          overall: merklApiHealthy && dbHealthy,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Health check failed:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Health check failed",
      });
    }
  }

  /**
   * Batch fetch and store APR data for multiple opportunities
   * @param req - Express request object
   * @param res - Express response object
   */
  async batchFetchAPR(req: Request, res: Response): Promise<void> {
    try {
      const { opportunities } = req.body;

      if (!opportunities || !Array.isArray(opportunities)) {
        res.status(400).json({
          success: false,
          error: "Opportunities array is required",
        });
        return;
      }

      const results = [];
      const errors = [];
      const targetTokens = [
        "LSK",
        "USDC",
        "USDC.e",
        "USDT0",
        "USD₮0",
        "Re7USDT0",
        "Re7USDC",
      ];

      for (const opp of opportunities) {
        try {
          const opportunity = await this.merklService.fetchOpportunityByName(
            opp.opportunityName,
            opp.chainId,
          );

          if (opportunity) {
            // Check if records exist for today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const existingRecords = await MerklAPRModel.find({
              opportunityName: opportunity.name,
              chainId: opportunity.chainId,
              timestamp: {
                $gte: today,
                $lt: tomorrow,
              },
            });

            if (existingRecords.length === 0) {
              // Process tokens and save only target tokens
              const savedTokens = [];

              if (opportunity.tokens && opportunity.tokens.length > 0) {
                for (const token of opportunity.tokens) {
                  if (targetTokens.includes(token.symbol)) {
                    const aprRecord = new MerklAPRModel({
                      opportunityName: opportunity.name,
                      chainId: opportunity.chainId,
                      tokenSymbol: token.symbol,
                      tokenName: token.name || "Unknown Token",
                      tokenAddress: token.address || "",
                      apr: opportunity.apr,
                      timestamp: new Date(),
                      rawData: {
                        token: token,
                        opportunity: opportunity,
                      },
                    });

                    const savedRecord = await aprRecord.save();
                    savedTokens.push({
                      tokenSymbol: token.symbol,
                      tokenName: token.name,
                      apr: opportunity.apr,
                      recordId: savedRecord._id,
                    });
                  }
                }
              }

              results.push({
                opportunityName: opportunity.name,
                chainId: opportunity.chainId,
                status: "stored",
                tokensSaved: savedTokens.length,
                tokens: savedTokens,
              });
            } else {
              results.push({
                opportunityName: opportunity.name,
                chainId: opportunity.chainId,
                status: "already_exists",
                tokensCount: existingRecords.length,
              });
            }
          } else {
            errors.push({
              opportunityName: opp.opportunityName,
              chainId: opp.chainId,
              error: "Opportunity not found",
            });
          }
        } catch (error) {
          errors.push({
            opportunityName: opp.opportunityName,
            chainId: opp.chainId,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      res.json({
        success: true,
        message: `Processed ${opportunities.length} opportunities`,
        results,
        errors,
        summary: {
          total: opportunities.length,
          successful: results.length,
          failed: errors.length,
        },
      });
    } catch (error) {
      console.error("❌ Error in batch fetch APR:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  /**
   * Get all tracked tokens across all opportunities
   * @param req - Express request object
   * @param res - Express response object
   */
  async getTrackedTokens(req: Request, res: Response): Promise<void> {
    try {
      const { chainId, tokenSymbol } = req.query;

      const filter: any = {};
      if (chainId) {
        filter.chainId = parseInt(chainId as string);
      }
      if (tokenSymbol) {
        filter.tokenSymbol = tokenSymbol as string;
      }

      const tokens = await MerklAPRModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              tokenSymbol: "$tokenSymbol",
              tokenAddress: "$tokenAddress",
            },
            tokenName: { $first: "$tokenName" },
            chainId: { $first: "$chainId" },
            latestAPR: { $first: "$apr" },
            latestTimestamp: { $first: "$timestamp" },
            recordCount: { $sum: 1 },
            firstRecord: { $last: "$timestamp" },
            opportunities: { $addToSet: "$opportunityName" },
          },
        },
        {
          $project: {
            tokenSymbol: "$_id.tokenSymbol",
            tokenName: 1,
            tokenAddress: "$_id.tokenAddress",
            chainId: 1,
            latestAPR: 1,
            latestTimestamp: 1,
            recordCount: 1,
            firstRecord: 1,
            opportunities: 1,
          },
        },
        {
          $sort: { latestTimestamp: -1 },
        },
      ]);

      res.json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      console.error("❌ Error fetching tracked tokens:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  /**
   * Get historical APR data for a specific token
   * @param req - Express request object
   * @param res - Express response object
   */
  async getTokenHistoricalAPR(req: Request, res: Response): Promise<void> {
    try {
      const { tokenSymbol } = req.params;
      const { chainId, startDate, endDate, limit = 100 } = req.query;

      const filter: any = {
        tokenSymbol: tokenSymbol,
      };

      if (chainId) {
        filter.chainId = parseInt(chainId as string);
      }

      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) {
          filter.timestamp.$gte = new Date(startDate as string);
        }
        if (endDate) {
          filter.timestamp.$lte = new Date(endDate as string);
        }
      }

      const historicalData = await MerklAPRModel.find(filter)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit as string))
        .select(
          "opportunityName chainId tokenSymbol tokenName tokenAddress apr timestamp createdAt",
        );

      const aprValues = historicalData.map((record) => record.apr);
      const stats = {
        count: historicalData.length,
        latest: historicalData.length > 0 ? historicalData[0].apr : null,
        average:
          aprValues.length > 0
            ? aprValues.reduce((a, b) => a + b, 0) / aprValues.length
            : 0,
        min: aprValues.length > 0 ? Math.min(...aprValues) : 0,
        max: aprValues.length > 0 ? Math.max(...aprValues) : 0,
      };

      res.json({
        success: true,
        data: historicalData,
        statistics: stats,
        query: {
          tokenSymbol,
          chainId,
          startDate,
          endDate,
          limit,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching token historical APR data:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  /**
   * Get comprehensive statistics for a specific token
   * @param req - Express request object
   * @param res - Express response object
   */
  async getTokenStats(req: Request, res: Response): Promise<void> {
    try {
      const { tokenSymbol } = req.params;
      const { chainId, startDate, endDate } = req.query;

      const filter: any = {
        tokenSymbol: tokenSymbol,
      };

      if (chainId) {
        filter.chainId = parseInt(chainId as string);
      }

      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) {
          filter.timestamp.$gte = new Date(startDate as string);
        }
        if (endDate) {
          filter.timestamp.$lte = new Date(endDate as string);
        }
      }

      const records = await MerklAPRModel.find(filter)
        .sort({ timestamp: -1 })
        .select("apr timestamp opportunityName");

      if (records.length === 0) {
        res.json({
          success: true,
          data: {
            tokenSymbol,
            chainId: chainId ? parseInt(chainId as string) : null,
            recordCount: 0,
            message: "No data found for this token",
          },
        });
        return;
      }

      const aprValues = records.map((record) => record.apr);
      const timestamps = records.map((record) => record.timestamp);

      const stats = {
        tokenSymbol,
        chainId: chainId ? parseInt(chainId as string) : null,
        recordCount: records.length,
        dateRange: {
          first: timestamps[timestamps.length - 1],
          last: timestamps[0],
        },
        apr: {
          latest: aprValues[0],
          average: aprValues.reduce((a, b) => a + b, 0) / aprValues.length,
          min: Math.min(...aprValues),
          max: Math.max(...aprValues),
          median: aprValues.sort((a, b) => a - b)[
            Math.floor(aprValues.length / 2)
          ],
        },
        trends: {
          sevenDayAverage:
            records.length >= 7
              ? aprValues.slice(0, 7).reduce((a, b) => a + b, 0) / 7
              : null,
          thirtyDayAverage:
            records.length >= 30
              ? aprValues.slice(0, 30).reduce((a, b) => a + b, 0) / 30
              : null,
        },
        opportunities: [...new Set(records.map((r) => r.opportunityName))],
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("❌ Error fetching token statistics:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  /**
   * Get current APR data for all tracked tokens
   * @param req - Express request object
   * @param res - Express response object
   */
  async getCurrentAPR(req: Request, res: Response): Promise<void> {
    try {
      const { chainId, tokenSymbol } = req.query;

      const filter: any = {};
      if (chainId) {
        filter.chainId = parseInt(chainId as string);
      }
      if (tokenSymbol) {
        filter.tokenSymbol = tokenSymbol as string;
      }

      // Get the latest APR data for each token
      const latestAPRData = await MerklAPRModel.aggregate([
        { $match: filter },
        {
          $sort: { timestamp: -1 },
        },
        {
          $group: {
            _id: {
              tokenSymbol: "$tokenSymbol",
              tokenAddress: "$tokenAddress",
            },
            tokenName: { $first: "$tokenName" },
            chainId: { $first: "$chainId" },
            latestAPR: { $first: "$apr" },
            latestTimestamp: { $first: "$timestamp" },
            opportunityName: { $first: "$opportunityName" },
            recordCount: { $sum: 1 },
          },
        },
        {
          $project: {
            tokenSymbol: "$_id.tokenSymbol",
            tokenName: 1,
            tokenAddress: "$_id.tokenAddress",
            chainId: 1,
            apr: "$latestAPR",
            timestamp: "$latestTimestamp",
            opportunityName: 1,
            recordCount: 1,
          },
        },
        {
          $sort: { apr: -1 }, // Sort by APR descending
        },
      ]);

      // Calculate summary statistics
      const aprValues = latestAPRData.map((record) => record.apr);
      const summary = {
        totalTokens: latestAPRData.length,
        averageAPR:
          aprValues.length > 0
            ? aprValues.reduce((a, b) => a + b, 0) / aprValues.length
            : 0,
        highestAPR: aprValues.length > 0 ? Math.max(...aprValues) : 0,
        lowestAPR: aprValues.length > 0 ? Math.min(...aprValues) : 0,
        totalRecords: latestAPRData.reduce(
          (sum, record) => sum + record.recordCount,
          0,
        ),
      };

      res.json({
        success: true,
        data: latestAPRData,
        summary,
        query: {
          chainId: chainId ? parseInt(chainId as string) : null,
          tokenSymbol: tokenSymbol || null,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching current APR data:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  /**
   * Get APR data for each token by time period
   * @param req - Express request object
   * @param res - Express response object
   */
  async getAPRByPeriod(req: Request, res: Response): Promise<void> {
    try {
      const {
        chainId,
        startDate,
        endDate,
        groupBy = "day",
        tokenSymbol,
      } = req.query;

      const filter: any = {};
      if (chainId) {
        filter.chainId = parseInt(chainId as string);
      }
      if (tokenSymbol) {
        filter.tokenSymbol = tokenSymbol as string;
      }

      // Add date range filter
      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) {
          filter.timestamp.$gte = new Date(startDate as string);
        }
        if (endDate) {
          filter.timestamp.$lte = new Date(endDate as string);
        }
      }

      // Determine grouping interval
      let groupFormat: string;
      switch (groupBy) {
        case "hour":
          groupFormat = "%Y-%m-%d %H:00:00";
          break;
        case "day":
          groupFormat = "%Y-%m-%d";
          break;
        case "week":
          groupFormat = "%Y-%U";
          break;
        case "month":
          groupFormat = "%Y-%m";
          break;
        default:
          groupFormat = "%Y-%m-%d";
      }

      // Get APR data grouped by token and time period
      const aprDataByPeriod = await MerklAPRModel.aggregate([
        { $match: filter },
        {
          $addFields: {
            period: {
              $dateToString: {
                format: groupFormat,
                date: "$timestamp",
              },
            },
          },
        },
        {
          $group: {
            _id: {
              tokenSymbol: "$tokenSymbol",
              tokenAddress: "$tokenAddress",
              period: "$period",
            },
            tokenName: { $first: "$tokenName" },
            chainId: { $first: "$chainId" },
            latestAPR: { $first: "$apr" },
            averageAPR: { $avg: "$apr" },
            minAPR: { $min: "$apr" },
            maxAPR: { $max: "$apr" },
            recordCount: { $sum: 1 },
            firstTimestamp: { $min: "$timestamp" },
            lastTimestamp: { $max: "$timestamp" },
            opportunityName: { $first: "$opportunityName" },
            aprValues: { $push: "$apr" },
          },
        },
        {
          $addFields: {
            mean: "$averageAPR",
            variance: {
              $reduce: {
                input: "$aprValues",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    {
                      $pow: [{ $subtract: ["$$this", "$averageAPR"] }, 2],
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $addFields: {
            standardDeviation: {
              $cond: {
                if: { $gt: ["$recordCount", 1] },
                then: {
                  $sqrt: {
                    $divide: ["$variance", { $subtract: ["$recordCount", 1] }],
                  },
                },
                else: 0,
              },
            },
          },
        },
        {
          $project: {
            tokenSymbol: "$_id.tokenSymbol",
            tokenName: 1,
            tokenAddress: "$_id.tokenAddress",
            chainId: 1,
            period: "$_id.period",
            apr: {
              latest: { $round: ["$latestAPR", 4] },
              mean: { $round: ["$averageAPR", 4] },
              average: { $round: ["$averageAPR", 4] },
              min: { $round: ["$minAPR", 4] },
              max: { $round: ["$maxAPR", 4] },
              standardDeviation: { $round: ["$standardDeviation", 4] },
            },
            statistics: {
              mean: { $round: ["$averageAPR", 4] },
              range: { $round: [{ $subtract: ["$maxAPR", "$minAPR"] }, 4] },
              variance: { $round: ["$variance", 4] },
              stdDev: { $round: ["$standardDeviation", 4] },
              coefficientOfVariation: {
                $cond: {
                  if: { $gt: ["$averageAPR", 0] },
                  then: {
                    $round: [
                      {
                        $multiply: [
                          { $divide: ["$standardDeviation", "$averageAPR"] },
                          100,
                        ],
                      },
                      2,
                    ],
                  },
                  else: 0,
                },
              },
            },
            aprValues: 1,
            recordCount: 1,
            firstTimestamp: 1,
            lastTimestamp: 1,
            opportunityName: 1,
          },
        },
        {
          $sort: {
            tokenSymbol: 1,
            period: 1,
          },
        },
      ]);

      // Group data by token for easier consumption
      const tokensData: { [key: string]: any } = {};

      aprDataByPeriod.forEach((record) => {
        // Calculate median in JavaScript
        const sortedValues = (record.aprValues || []).sort(
          (a: number, b: number) => a - b,
        );
        const median =
          sortedValues.length > 0
            ? sortedValues.length % 2 === 0
              ? (sortedValues[sortedValues.length / 2 - 1] +
                  sortedValues[sortedValues.length / 2]) /
                2
              : sortedValues[Math.floor(sortedValues.length / 2)]
            : 0;

        const tokenKey = record.tokenSymbol;
        if (!tokensData[tokenKey]) {
          tokensData[tokenKey] = {
            tokenSymbol: record.tokenSymbol,
            tokenName: record.tokenName,
            tokenAddress: record.tokenAddress,
            chainId: record.chainId,
            opportunityName: record.opportunityName,
            periods: [],
          };
        }

        tokensData[tokenKey].periods.push({
          period: record.period,
          apr: {
            ...record.apr,
            median: Math.round(median * 10000) / 10000,
          },
          statistics: {
            ...record.statistics,
            median: Math.round(median * 10000) / 10000,
          },
          recordCount: record.recordCount,
          firstTimestamp: record.firstTimestamp,
          lastTimestamp: record.lastTimestamp,
        });
      });

      // Convert to array and calculate summary
      const tokensArray = Object.values(tokensData);

      // Calculate overall statistics for the queried data only
      const allAPRValues = aprDataByPeriod.flatMap(
        (record) => record.aprValues || [],
      );
      const overallMean =
        allAPRValues.length > 0
          ? allAPRValues.reduce((a, b) => a + b, 0) / allAPRValues.length
          : 0;

      const overallVariance =
        allAPRValues.length > 0
          ? allAPRValues.reduce(
              (sum, val) => sum + Math.pow(val - overallMean, 2),
              0,
            ) /
            (allAPRValues.length - 1)
          : 0;

      const overallStdDev = Math.sqrt(overallVariance);

      const summary = {
        totalTokens: tokensArray.length,
        totalPeriods: aprDataByPeriod.length,
        totalRecords: allAPRValues.length,
        dateRange: {
          start: startDate ? new Date(startDate as string) : null,
          end: endDate ? new Date(endDate as string) : null,
        },
        groupBy: groupBy as string,
        overallStatistics: {
          mean: Math.round(overallMean * 10000) / 10000,
          median:
            allAPRValues.length > 0
              ? Math.round(
                  allAPRValues.sort((a, b) => a - b)[
                    Math.floor(allAPRValues.length / 2)
                  ] * 10000,
                ) / 10000
              : 0,
          min: allAPRValues.length > 0 ? Math.min(...allAPRValues) : 0,
          max: allAPRValues.length > 0 ? Math.max(...allAPRValues) : 0,
          range:
            allAPRValues.length > 0
              ? Math.max(...allAPRValues) - Math.min(...allAPRValues)
              : 0,
          variance: Math.round(overallVariance * 10000) / 10000,
          standardDeviation: Math.round(overallStdDev * 10000) / 10000,
          coefficientOfVariation:
            overallMean > 0
              ? Math.round((overallStdDev / overallMean) * 10000) / 100
              : 0,
        },
      };

      res.json({
        success: true,
        data: tokensArray,
        summary,
        query: {
          chainId: chainId ? parseInt(chainId as string) : null,
          startDate: startDate || null,
          endDate: endDate || null,
          groupBy: groupBy as string,
          tokenSymbol: tokenSymbol || null,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching APR data by period:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  /**
   * Get a short-lived signed APR payload for on-chain APRValidator checks.
   *
   * Contract expects:
   * - nonce: milliseconds
   * - signature over keccak256(abi.encodePacked(tokenAddress, aprBasisPoints, nonce))
   *
   * @route GET /api/merkl/apr/signed
   * @query tokenAddress?: string (0x..; if omitted, uses 0x000.. for claimAll-style signature)
   * @query tokenSymbol?: string (e.g. "USDC.e") optional helper for lookup
   * @query chainId?: number optional filter
   */
  async getSignedAPR(req: Request, res: Response): Promise<void> {
    try {
      const { tokenAddress, tokenSymbol, chainId } = req.query as {
        tokenAddress?: string;
        tokenSymbol?: string;
        chainId?: string;
      };

      const chainIdNum = chainId ? parseInt(chainId, 10) : undefined;

      // If not provided, allow signing "global" APR for claimAll() which uses token=address(0)
      const resolvedTokenAddress = tokenAddress
        ? tokenAddress
        : "0x0000000000000000000000000000000000000000";

      if (!ethers.isAddress(resolvedTokenAddress)) {
        res.status(400).json({
          success: false,
          error: "Invalid tokenAddress",
        });
        return;
      }

      // Resolve APR percent from DB (stored as % like 12.34). Then convert to basis points.
      // For claimAll-style signature (token=0x0), we use the overall average across latest token APRs.
      let aprPercent: number | null = null;

      if (ethers.getAddress(resolvedTokenAddress) === ethers.ZeroAddress) {
        const filter: any = {};
        if (chainIdNum) filter.chainId = chainIdNum;

        const latest = await MerklAPRModel.aggregate([
          { $match: filter },
          { $sort: { timestamp: -1 } },
          {
            $group: {
              _id: {
                tokenSymbol: "$tokenSymbol",
                tokenAddress: "$tokenAddress",
              },
              latestAPR: { $first: "$apr" },
            },
          },
        ]);

        const aprValues = latest
          .map((r: any) => Number(r.latestAPR))
          .filter((n: number) => Number.isFinite(n));
        aprPercent =
          aprValues.length > 0
            ? aprValues.reduce((a: number, b: number) => a + b, 0) /
              aprValues.length
            : 0;
      } else {
        const addr = ethers.getAddress(resolvedTokenAddress);

        const or: any[] = [{ tokenAddress: addr }];
        if (tokenSymbol) or.push({ tokenSymbol });

        const filter: any = { $or: or };
        if (chainIdNum) filter.chainId = chainIdNum;

        const latestRecord = await MerklAPRModel.findOne(filter)
          .sort({ timestamp: -1 })
          .select("apr tokenSymbol tokenAddress chainId timestamp");

        if (!latestRecord) {
          res.status(404).json({
            success: false,
            error:
              "No APR data found for token. Run /api/merkl/fetch (or wait for daily cron) to populate data.",
          });
          return;
        }

        aprPercent = Number(latestRecord.apr);
      }

      if (aprPercent === null || !Number.isFinite(aprPercent)) {
        res.status(500).json({ success: false, error: "APR lookup failed" });
        return;
      }

      // Convert % to basis points (e.g. 18.90% => 1890 bps)
      let aprBasisPoints = Math.round(aprPercent * 100);
      if (aprBasisPoints < 0) aprBasisPoints = 0;
      if (aprBasisPoints > 5000) aprBasisPoints = 5000; // contract MAX_APR

      const nonce = Date.now(); // ms (contract expects ms, then converts /1000)

      const signed = await this.aprSigningService.signApr({
        tokenAddress: resolvedTokenAddress,
        aprBasisPoints,
        nonce,
      });

      res.json({
        success: true,
        data: {
          ...signed,
          aprPercent,
          chainId: chainIdNum ?? null,
          tokenSymbol: tokenSymbol ?? null,
        },
      });
    } catch (error) {
      console.error("❌ Error generating signed APR:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
}
