const mongoose = require("mongoose")

const CookiesSchema = new mongoose.Schema({
	cookie: String,
    Xtoken: String,
    user: String
})

module.exports = mongoose.model("cookies", CookiesSchema)