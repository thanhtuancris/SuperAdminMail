const fs = require('fs');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
let Account = require('../model/account')
module.exports = {
    login: async (req, res) => {
        let username = req.body.username;
        let password = req.body.password;
        let account = {
            username: username,
            password: md5(password)
        }
        let check = await Account.findOne(account);
        if(check !== null) {
            let newToken = jwt.sign({
                username: username,
                password: password
            }, fs.readFileSync('primary.key'));
            let filter = {
                username: username,
                password: md5(password),
                isdelete: false,
                status: true,
                $or: [{role:1}, {role:2}]
            }
            let update = {
                token: newToken
            }
            let result = await Account.findOneAndUpdate(filter, update, {new:true})
            if (result != null) {
                res.status(200).json({
                    message: "Đăng nhập thành công!",
                    data: result.token
                });
            } else {
                res.status(400).json({
                    message: "Đăng nhập thất bại, vui lòng liên hệ admin!"
                });
            }
        }else{
            res.status(400).json({
                message: "Sai tài khoản hoặc mật khẩu!"
            })
        }
        
    },
    logout: async (req, res) => {
        let token = req.body.token;
        try {
            let filter = {
                token: token
            }
            let update = {
                token: ""
            }
            let result = await Account.findOneAndUpdate(filter, update, {
                new: true
            });
            if (result != null) {
                res.status(200).json({
                    message: "Đăng xuất thành công!"
                });
            } else {
                res.status(400).json({
                    message: "Đăng xuất thất bại!"
                });
            }

        } catch (ex) {
            res.status(401).json({
                message: "Token lỗi vui lòng thử lại"
            });
        }
    },
    changePassword: async (req, res) => {
        let check = await Account.findOne({
            token: req.body.token
        });
        try {
            if (check.username) {
                let username = check.username;
                let password = req.body.password;
                let newpassword = req.body.newpassword;
                try {
                    let newToken = jwt.sign({
                        username: username,
                        password: md5(newpassword)
                    }, fs.readFileSync('primary.key'));
                    let filter = {
                        username: username,
                        password: md5(password)
                    }
                    let update = {
                        token: newToken,
                        date_edit: Date.now(),
                        // modified_by: check._id,
                        password: md5(newpassword),
                    }
                    let result1 = await Account.findOneAndUpdate(filter, update, {
                        new: true
                    });
                    if (result1 != null) {
                        result1.token = newToken;
                        res.status(200).json({
                            message: "Thay đổi mật khẩu thành công!",
                        });
                    } else {
                        res.status(400).json({
                            message: "Mật khẩu cũ sai, vui lòng thử lại"
                        });
                    }
                } catch (ex) {
                    res.status(400).json({
                        message: "Mật khẩu cũ sai, vui lòng thử lại"
                    });
                }
            } else {
                res.status(401).json({
                    message: "Token lỗi, vui lòng thử lại"
                });
            }
        } catch (ex) {
            res.status(401).json({
                message: "Token lỗi, vui lòng thử lại"
            });
        }
    },
    getUser: async function (req, res) {
        let token = req.body.token;
        let filterAdmin = {
            token: token,
            isdelete: false,
            status: true,
            role: 1
        }
        let filterUser = {
            isdelete: false,
            status: true,
            role: 2
        }
        let checkAdmin = await Account.findOne(filterAdmin)
        if(checkAdmin){
            let getUser = await Account.find(filterUser)
            res.status(200).json({
                message: "Lấy dữ liệu thành công!",
                data: getUser
            })
        }else{
            res.status(400).json({
                message: "Không có quyền thực thi"
            })
        }
        
    }
}