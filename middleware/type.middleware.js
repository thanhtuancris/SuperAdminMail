
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
            let parsePrice = parseInt(price)
            if(typeof parsePrice !== "number") {
                res.status(400).json({
                    message: "Giá tiền phải là số"
                });
                return;
            }
            if(parsePrice < 0 || parsePrice > 100000){
                res.status(400).json({
                    message: "Nhập lại giá tiền"
                });
                return;
            }
            
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
        if (!req.body.price) {
            res.status(400).json({
                message: "Thiếu trường price"
            });
            return;
        }
        if (req.body.price) {
            let price = req.body.price;
            let parsePrice = parseInt(price)
            if(typeof parsePrice !== "number") {
                res.status(400).json({
                    message: "Giá tiền phải là số"
                });
                return;
            }
            if(parsePrice < 0 || parsePrice > 100000){
                res.status(400).json({
                    message: "Nhập lại giá tiền"
                });
                return;
            }
        }
        next();
    }
}