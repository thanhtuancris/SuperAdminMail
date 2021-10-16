function validateEmail(email) {
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
        return (true)
    }
    return (false)
}
module.exports = {
    editMail: function (req, res, next) {
        if (!req.body.token) {
            res.status(400).json({
                message: "Hết phiên đăng nhập"
            });
            return;
        }
        if (!req.body.id_mail) {
            res.status(400).json({
                message: "Thiếu trường id_mail"
            });
            return;
        }
        if(req.body.mail){
            let mail = req.body.mail
            if(validateEmail(mail) == false){
                res.status(400).json({
                    message: "Sai định dạng mail!"
                });
                return;
            }
        }
        next();
    },
    getMail: function (req, res, next) {
        if (!req.body.token) {
            res.status(400).json({
                message: "Hết phiên đăng nhập"
            });
            return;
        }
        if (req.body.start_date || req.body.stop_date) {
            let startDate = req.body.start_date + " 7:00"
            let stopDate = req.body.stop_date + " 7:00"
            let day_startDate = new Date(startDate)
            let day_stopDate = new Date(stopDate)
            if(day_startDate.getTime() > day_stopDate.getTime()){
                res.status(400).json({
                    message: "Ngày bắt đầu không được lớn hơn ngày kết thúc!"
                });
                return;
            }
        }
        next();

    },
    deleteMails: function (req, res, next) {
        if (!req.body.token) {
            res.status(400).json({
                message: "Hết phiên đăng nhập"
            });
            return;
        }
        if (!req.body.id_mails) {
            res.status(400).json({
                message: "Thiếu trường id_mails"
            });
            return;
        }
        next();
    },
    addMails: function (req, res, next) {
        if (!req.body.token) {
            res.status(400).json({
                message: "Hết phiên đăng nhập!"
            });
            return;
        }
        if (!req.body.mail) {
            res.status(400).json({
                message: "Thiếu dữ liệu đầu vào vui lòng thử lại"
            });
            return;
        }
        if (!req.body.type) {
            res.status(400).json({
                message: "Thiếu dữ liệu đầu vào vui lòng thử lại"
            });
            return;
        }
        if (!req.body.nation) {
            res.status(400).json({
                message: "Thiếu dữ liệu đầu vào vui lòng thử lại"
            });
            return;
        }
        next();
    },
    checkMails: function (req, res, next) {
        if (!req.body.token) {
            res.status(400).json({
                message: "Hết phiên đăng nhập"
            });
            return;
        }
        next();
    },
    deleteMail: function (req, res, next) {
        if (!req.body.token) {
            res.status(400).json({
                message: "Hết phiên đăng nhập!"
            });
            return;
        }
        if (!req.body.id_mail) {
            res.status(400).json({
                message: "Thiếu trường dữ liệu!"
            });
            return;
        }
        next();
    },
    editMails: function (req, res, next) {
        if (!req.body.token) {
            res.status(400).json({
                message: "Hết phiên đăng nhập"
            });
            return;
        }
        next();
    },
}