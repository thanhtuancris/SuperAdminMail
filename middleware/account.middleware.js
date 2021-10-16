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
    getUser: function (req, res, next) {
        if (!req.body.token) {
            res.status(400).json({
                message: "Hết phiên đăng nhập"
            });
            return;
        }
        next();
    }
   
}