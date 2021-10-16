const mongoose = require("mongoose")

const nationMailSchema = new mongoose.Schema({
    name: String,
    isdelete: Boolean,
    date: Date
})

module.exports = mongoose.model("nations", nationMailSchema)