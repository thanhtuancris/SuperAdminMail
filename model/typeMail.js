const mongoose = require("mongoose")

const typemailSchema = new mongoose.Schema({
    name: String,
    price: Number,
    isdelete: Boolean,
    date: Date
})

module.exports = mongoose.model("types", typemailSchema)