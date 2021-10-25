module.exports = {
    getLogImport: function(req, res, next) {
        if(!req.body.token){
            res.status(400).json({
                message: "Thiếu token"
            });
            return;
        }
        next();
    },
    deleteLog: function(req, res, next) {
        if(!req.body.token){
            res.status(400).json({
                message: "Thiếu token"
            });
            return;
        }
        if(!req.body.id_Log){
            res.status(400).json({
                message: "Thiếu id_Log"
            });
            return;
        }
        next();
    },
}