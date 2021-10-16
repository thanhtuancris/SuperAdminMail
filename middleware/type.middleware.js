
module.exports = {

    editType: function (req, res, next) {
        if (!req.body.token) {
            res.status(400).json({
                message: "Hết phiên đăng nhập"
            });
            return;
        }
        if (!req.body.id_Type) {
            res.status(400).json({
                message: "Thiếu trường id_Type"
            });
            return;
        }
        if (!req.body.name) {
            res.status(400).json({
                message: "Thiếu trường name"
            });
            return;
        }
        next();
    },
    getType: function (req, res, next) {
        if (!req.body.token) {
            res.status(400).json({
                message: "Hết phiên đăng nhập"
            });
            return;
        }
        next();
    },
    deleteType: function (req, res, next) {
        if (!req.body.token) {
            res.status(400).json({
                message: "Hết phiên đăng nhập"
            });
            return;
        }
        if (!req.body.id_Type) {
            res.status(400).json({
                message: "Thiếu trường id_Type"
            });
            return;
        }
        next();
    },
    addType: function (req, res, next) {
        if (!req.body.token) {
            res.status(400).json({
                message: "Hết phiên đăng nhập"
            });
            return;
        }
        if (!req.body.name) {
            res.status(400).json({
                message: "Thiếu trường name"
            });
            return;
        }
        next();
    }
}