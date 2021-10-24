const mongoose = require("mongoose")

const dataLogSchema = new mongoose.Schema({
    total: Number,
    success: Number,
    failed: Number,
    buyer: String,
    date_export: Date
})

module.exports = mongoose.model("datalogs", dataLogSchema)