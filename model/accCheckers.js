const mongoose = require("mongoose")

const accCheckerSchema = new mongoose.Schema({
	username: String,
    password: String,
    user: String,
    date_reg: Date,
    date_expires: Date,
})

module.exports = mongoose.model("accCheckers", accCheckerSchema)