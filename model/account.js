const mongoose = require("mongoose")

const accountSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: Number, //1 admin 2 user
    token: String,
    status: Boolean,
    isdelete: Boolean,
    date_reg: Date,
    date_edit: Date,
})

module.exports = mongoose.model("accounts", accountSchema)