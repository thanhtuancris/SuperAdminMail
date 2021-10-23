const fs = require('fs');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
let Account = require('../model/account')
let Admin = require('../model/superadmin')
module.exports = {
    login: async (req, res) => {
        let username = req.body.username.trim();
        let password = req.body.password.trim();
        let acc = {
            username: username,
            password: md5(password)
        }
        let check = await Admin.findOne(acc);
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
                role: 10
            }
            let update = {
                token: newToken
            }
            let result = await Admin.findOneAndUpdate(filter, update, {new:true})
            if (result != null) {
                res.status(200).json({
                    message: "Đăng nhập thành công!",
                    data: result.token
                });
            } else {
                res.status(400).json({
                    message: "Đăng nhập thất bại"
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
                token: token,
                isdelete: false,
                status: true,
                role: 10
            }
            let update = {
                token: ""
            }
            let result = await Admin.findOneAndUpdate(filter, update, {
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
        let check = await Admin.findOne({
            token: req.body.token,
            isdelete: false,
            status: true,
            role: 10
        });
        try {
            if (check) {
                let username = check.username;
                let password = req.body.password.trim();
                let newpassword = req.body.newpassword.trim();
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
                    date_edit: new Date(),
                    password: md5(newpassword),
                }
                let result1 = await Admin.findOneAndUpdate(filter, update, {
                    new: true
                });
                if (result1 != null) {
                    // result1.token = newToken;
                    res.status(200).json({
                        message: "Đổi mật khẩu thành công!",
                    });
                } else {
                    res.status(400).json({
                        message: "Mật khẩu cũ sai, vui lòng thử lại"
                    });
                }
            } else {
                res.status(401).json({
                    message: "Không có quyền thực thi!"
                });
            }
        } catch (ex) {
            res.status(401).json({
                message: ex.message,
            });
        }
    },
    getAllUser: async function (req, res) {
        let token = req.body.token;
        let filterAdmin = {
            token: token,
            isdelete: false,
            status: true,
            role: 10
        }
        let filterUser = {
            isdelete: false,
            status: true,
            $or: [{role:1}, {role:2}]
        }
        let checkAdmin = await Admin.findOne(filterAdmin)
        if(checkAdmin){
            const perPage = parseInt(req.body.limit);
            const page = parseInt(req.body.page || 1);
            const skip = (perPage * page) - perPage;
            let getUser = await Account.find(filterUser).skip(skip).limit(perPage);
            const totalDocuments = await Account.countDocuments(filterUser);
            const totalPage = Math.ceil(totalDocuments / perPage);
            res.status(200).json({
                message: "Lấy dữ liệu thành công!",
                data: getUser,
                page: page,
                totalDocuments: totalDocuments,
                totalPage: totalPage,
            })
        }else{
            res.status(400).json({
                message: "Không có quyền thực thi"
            })
        }
        
    },
    addUser : async function(req, res) {
        try{
            let token = req.body.token;
            let filterAccount = {
                token: token,
                isdelete: false,
                status: true,
                role: 10
            }
            let checkAdmin = await Admin.findOne(filterAccount)
            if(checkAdmin){
                let newacc = new Account({
                    username: req.body.username.trim(),
                    password: md5(req.body.password.trim()),
                    full_name: req.body.full_name.trim(),
                    email: req.body.email.trim(),
                    birth_day: req.body.birthday.trim(),
                    phone: req.body.phone.trim(),
                    team: req.body.team.trim(),
                    role: req.body.role.trim(),
                    status: true,
                    isdelete: false,
                    date_reg: new Date(),
                    date_edit: new Date(),
                })
                let checkExists = await Account.findOne({username: req.body.username.trim()})
                if(checkExists){
                    res.status(400).json({
                        message: "Tài khoản đã tồn tại!"
                    })
                }else{
                    let addUser = await newacc.save()
                    res.status(200).json({
                        message: "Thêm tài khoản thành công!"
                    })
                }   
            }else{
                res.status(400).json({
                    message: "Không có quyền thực thi!"
                })
            }
        }catch(e){
            res.status(400).json({
                message: e.message,
            })
        }
    },
    editUser: async function(req, res){
        try{
            let token = req.body.token;
            let filterAccount = {
                token: token,
                isdelete: false,
                status: true,
                role: 10
            }
            let checkAdmin = await Admin.findOne(filterAccount)
            if(checkAdmin){
                let filter = {
                    _id: req.body.id_user,
                    isdelete: false,
                }
                let findUser = await Account.findOne(filter)
                if(findUser){
                    let update = {
                        email: req.body.email ? req.body.email.trim() : findUser.email,
                        full_name: req.body.full_name ? req.body.full_name.trim() : findUser.full_name,
                        birth_day: req.body.birth_day ? req.body.birth_day.trim() : findUser.birth_day,
                        phone: req.body.phone ? req.body.phone.trim() : check.phone,
                        username: req.body.username ? req.body.username.trim() : findUser.username,
                        password: req.body.password ? req.body.password.trim() : findUser.password,
                        role: req.body.role ? req.body.role.trim() : findUser.role,
                        team: req.body.team ? req.body.team.trim() : findUser.team,
                        status: req.body.status ? req.body.status.trim() : findUser.status,
                        isdelete: req.body.isdelete ? req.body.isdelete.trim() : findUser.isdelete,
                        date_reg: req.body.date_reg ? req.body.date_reg.trim() : findUser.date_reg,
                        date_edit: new Date()
                    }
                    let updateInfo = await Account.findOneAndUpdate(filter, update, {new: true})
                    if(updateInfo){
                        res.status(200).json({
                            message: "Cập nhật thành công!"
                        })
                    }else{
                        res.status(400).json({
                            message: "Cập nhật thất bại!"
                        })
                    }
                }else{
                    res.status(400).json({
                        message: "Không tồn tại tài khoản này!"
                    })
                }
                
            }else{
                res.status(400).json({
                    message: "Không có quyền thực thi!"
                })
            }
        }catch(e){
            res.status(400).json({
                message: e.message
            })
        }
    },
    deleteUser: async function(req, res) {
        let token = req.body.token;
        let filterAccount = {
            token: token,
            isdelete: false,
            status: true,
            role: 10
        }
        let checkAdmin = await Admin.findOne(filterAccount)
        if(checkAdmin){
            let filter = {
                _id: req.body.id_user,
                isdelete: false
            }
            let update = {
                isdelete: true
            }
            let deleteUser = await Account.findOneAndUpdate(filter, update, {new: true})
            if(deleteUser){
                res.status(200).json({
                    message: "Xóa tài khoản thành công!"
                })
            }else{
                res.status(400).json({
                    message: "Xóa tài khoản thất bại!"
                })
            }
        }else{
            res.status(400).json({
                message: "Không có quyền thực thi!"
            })
        }
    }
}