
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
        if (req.body.price) {
            let price = req.body.price;
            if(typeof price !== "number") {
                res.status(400).json({
                    message: "Giá tiền phải là số"
                });
            }
            if(price < 0 || price > 100000){
                res.status(400).json({
                    message: "Nhập lại giá tiền"
                });
            }
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