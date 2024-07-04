/**
 * @swagger
 * /api/app/get-service:
 *   post:
 *     requestBody:
 *         required: true
 *         content:
 *           application/json:
 *              schema:
 *               type: object
 *               properties:
 *                 rootPath:
 *                   type: string
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 */
const express = require('express');
const router = express.Router();
const { getService } = require('../service/getService')

router.post('/get-service', (req, res) => {
    res.json({ list: getService() });
});

module.exports = router;