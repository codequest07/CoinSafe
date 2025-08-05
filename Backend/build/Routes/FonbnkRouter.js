"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FonbnkController_1 = require("../controllers/FonbnkController");
const router = (0, express_1.Router)();
const fonbnkController = new FonbnkController_1.FonbnkController();
/**
 * @route POST /api/fonbnk/payment-url
 * @desc Create a payment URL for on-ramp
 * @access Public
 */
router.post('/payment-url', (req, res) => {
    fonbnkController.createPaymentUrl(req, res);
});
/**
 * @route POST /api/fonbnk/webhook
 * @desc Handle webhook from Fonbnk
 * @access Public
 */
router.post('/webhook', (req, res) => {
    fonbnkController.handleWebhook(req, res);
});
/**
 * @route GET /api/fonbnk/countries
 * @desc Get supported countries
 * @access Public
 */
router.get('/countries', (req, res) => {
    fonbnkController.getSupportedCountries(req, res);
});
/**
 * @route GET /api/fonbnk/currencies
 * @desc Get supported currencies
 * @access Public
 */
router.get('/currencies', (req, res) => {
    fonbnkController.getSupportedCurrencies(req, res);
});
/**
 * @route GET /api/fonbnk/order/:orderId
 * @desc Get order status
 * @access Public
 */
router.get('/order/:orderId', (req, res) => {
    fonbnkController.getOrderStatus(req, res);
});
/**
 * @route GET /api/fonbnk/generate-signature
 * @desc Generate JWT signature for Fonbnk
 * @access Public
 */
router.get('/generate-signature', (req, res) => {
    fonbnkController.generateSignature(req, res);
});
exports.default = router;
//# sourceMappingURL=FonbnkRouter.js.map