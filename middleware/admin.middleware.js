module.exports = {
    login: function(req, res, next) {
        if(!req.body.username){
            res.status(400).json({
                message: "Thiếu trường thông tin tài khoản"
            });
            return;
        }
        if(!req.body.password){
            res.status(400).json({
                message: "Mật khẩu không được để trống"
            });
            return;
        }
        next();
    },

    changePassword: function(req, res, next) {
        if (!req.body.token) {
            res.status(400).json({
                message: "Hết phiên đăng nhập"
            });
            return;
        }
        if(!req.body.password){
            res.status(400).json({
                message: "Mật khẩu không được để trống"
            });
            return;
        }
        if(!req.body.newpassword){
            res.status(400).json({
                message: "Mật khẩu không được để trống"
            });
            return;
        }
        if(req.body.newpassword){
            let a = req.body.newpassword;
            if(a.length < 6 || a.length > 50){
                res.status(400).json({
                    message: "Mật khẩu tối thiểu là 6 ký tự và tối đa là 50 ký tự"
                });
                return;
            }
        }
        next();
    },
    getAllUser: function (req, res, next) {
        if (!req.body.token) {
            res.status(400).json({
                message: "Hết phiên đăng nhập"
            });
            return;
        }
        next();
    },
    addUser: function (req, res, next) {
        if (!req.body.token) {
            res.status(400).json({
                message: "Hết phiên đăng nhập"
            });
            return;
        }
        if (!req.body.username) {
            res.status(400).json({
                message: "Thiếu username"
            });
            return;
        }
        if (!req.body.password) {
            res.status(400).json({
                message: "Thiếu password"
            });
            return;
        }
        if (!req.body.full_name) {
            res.status(400).json({
                message: "Thiếu full name"
            });
            return;
        }
        if (!req.body.email) {
            res.status(400).json({
                message: "Thiếu email"
            });
            return;
        }
        if (!req.body.birth_day) {
            res.status(400).json({
                message: "Thiếu birthday"
            });
            return;
        }
        if (!req.body.phone) {
            res.status(400).json({
                message: "Thiếu phone"
            });
            return;
        }
        if (!req.body.role) {
            res.status(400).json({
                message: "Thiếu role"
            });
            return;
        }
        next();
    }
   
}