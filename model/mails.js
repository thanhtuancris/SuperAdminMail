const mongoose = require("mongoose")

const mailSchema = new mongoose.Schema({
	mail: String,
    password: String,
    mailRecovery: String,
    type: String,
    nation: String,
    user: mongoose.Schema.Types.ObjectId,
    import_by: mongoose.Schema.Types.ObjectId,
    edit_by: mongoose.Schema.Types.ObjectId,
    date_import: Date,
    date_edit: Date,
    status: Number,
    isdelete: Boolean,
    ischeck: Boolean,
    note: String
    // modified_by: mongoose.Schema.Types.ObjectId,
    // sale_name: String,
    // date_sale: Date,
})

module.exports = mongoose.model("mails", mailSchema)