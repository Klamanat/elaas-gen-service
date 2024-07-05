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
const excel = require("exceljs");
const router = express.Router()
const { getService } = require('../service/getService')

router.post('/get-service', (req, res) => {
    const { appPath, modules } = req.body

    let workbook = new excel.Workbook();

    modules.forEach(module => {
        const list = getService(`${appPath}/${module}`)
        let worksheet = workbook.addWorksheet(module.toUpperCase());

        worksheet.columns = [
            { header: "MENU", key: "folder", width: 25 },
            { header: "URL", key: "url", width: 100 }
        ];

        // Add Array Rows
        worksheet.addRows(list);
    })


    // res is a Stream object
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "Service_url.xlsx"
    );

    return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
    });
})

module.exports = router