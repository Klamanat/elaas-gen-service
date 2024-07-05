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
 *                 appPath:
 *                   type: string
 *                 modules:
 *                   type: array
 *                   items:
 *                     module:
 *                       type: string
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 */
const express = require('express')
const router = express.Router()
const { getService } = require('../service/getService')

router.post('/get-service', (req, res) => {
    const { appPath, modules } = req.body

    res.json({ list: getService(appPath, modules) })
})

module.exports = router