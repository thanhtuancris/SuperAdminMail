const mongoose = require("mongoose")

const dataLogSchema = new mongoose.Schema({
    totalImport: Number,
    successImport: Number,
    failedImport: Number,
    totalExport: Number,
    successExport: Number,
    failedExport: Number,
    buyer: String,
    date_export: Date,
    date_import: Date,
    type: String
})

module.exports = mongoose.model("datalogs", dataLogSchema)