let Type = require('../model/typeMail')
let Account = require('../model/account')
let Admin = require('../model/superadmin')


module.exports = {
    addType: async function (req, res) {
        let check = await Admin.findOne({
            token: req.body.token,
            isdelete: false,
            status: true,
            role: 10
        })
        let newType = new Type({
            name: req.body.name.trim(),
            price: req.body.price.trim(),
            date: new Date(),
            isdelete: false,
        })
        if (check) {
            let checkExists = await Type.findOne({
                name: req.body.name.trim()
            })
            if (checkExists) {
                res.status(400).json({
                    message: 'Đã tồn tại thể loại mail!',
                });
            } else {
                let saveType = await newType.save()
                if (saveType) {
                    res.status(200).json({
                        message: 'Thêm thể loại mail thành công!',
                    });
                } else {
                    res.status(400).json({
                        message: 'Thêm thể loại mail thất bại!',
                    });
                }
            }
        } else {
            res.status(400).json({
                message: 'Không có quyền thực thi!',
            });
        }
    },
    getType: async function (req, res) {
        let check = await Admin.findOne({
            token: req.body.token,
            isdelete: false,
            status: true,
            role: 10
        })
        if (check) {
            let getType = await Type.find()
            if (getType) {
                res.status(200).json({
                    message: 'Lấy dữ liệu thành công!',
                    data: getType
                });
            } else {
                res.status(400).json({
                    message: 'Lấy dữ liệu thất bại!',
                });
            }
        } else {
            res.status(400).json({
                message: 'Không có quyền thực thi!',
            });
        }
    },
    editType: async function (req, res) {
        let check = await Admin.findOne({
            token: req.body.token,
            isdelete: false,
            status: true,
            role: 10
        })
        console.log(req.body.token);
        console.log(req.body);
        if (check) {
            let filter = {
                _id: req.body.id_Type,
                isdelete: false
            }
            let findType = await Type.findOne(filter)
            let update = {
                name: req.body.name ? req.body.name.trim() : findType.name,
                price: req.body.price ? parseInt(req.body.price) : findType.price,
            }
            let updateType = await Type.findOneAndUpdate(filter, update, {
                new: true
            })
            if (updateType) {
                res.status(200).json({
                    message: 'Sửa thể loại thành công!',
                });
            } else {
                res.status(400).json({
                    message: 'Sửa thể loại thất bại!',
                });
            }
        } else {
            res.status(400).json({
                message: 'Không có quyền thực thi!',
            });
        }
    },
    deleteType: async function (req, res) {
        try {
            let check = await Admin.findOne({
                token: req.body.token,
                isdelete: false,
                status: true,
                role: 10
            })
            let arr = req.body.id_Type;
            // arr = JSON.parse(arr);
            if (check) {
                for (let i = 0; i < arr.length; i++) {
                    let filter = {
                        _id: arr[i],
                        isdelete: false
                    }
                    let update = {
                        isdelete: true,
                    }
                    let deleteType = await Type.findOneAndDelete(filter)
                    if (i + 1 == arr.length) {
                        res.status(200).json({
                            message: "Xóa thể loại thành công!",
                        });
                    }
                }

            } else {
                res.status(400).json({
                    message: 'Không có quyền thực thi!',
                });
            }
        } catch (e) {
            res.status(400).json({
                message: e.message,
            });
        }
    },
    testType: async function (req, res) {
        var axios = require('axios');
        var qs = require('qs');
        var data = qs.stringify({
            'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicGFzc3dvcmQiOiJhZG1pbiIsImlhdCI6MTY0MDMzMzE4N30.4FLhM4gyeVMpMgxXQY8SQm2tKtF5BkQpJtFoNJlwMLk',
            'id_Type': '61c3fcb7e6456bde65d1e81b',
            'name': 'mail xịn',
        });
        var config = {
            method: 'post',
            url: 'http://localhost:3000/api/type/edit-type',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                res.status(200).json({
                    message: JSON.stringify(response.data)
                })
            })
            .catch(function (error) {
                console.log(error);
            });

    }
}