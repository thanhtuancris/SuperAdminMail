const mongoose = require("mongoose")

const superadminSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: Number, 
    token: String,
    status: Boolean,
    isdelete: Boolean,
    date_reg: Date,
})

module.exports = mongoose.model("superadmins", superadminSchema)