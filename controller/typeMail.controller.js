let Type = require('../model/typeMail')
let Account = require('../model/account')


module.exports = {
    addType: async function (req, res) {
        let check = await Account.findOne({
            token: req.body.token,
            isdelete: false,
            status: true,
            role: 2
        })
        let newType = new Type({
            name: req.body.name.trim(),
            date: new Date(),
            isdelete: false,
        })
        if(check){
            let checkExists = await Type.findOne({name: req.body.name.trim()})
            if(checkExists){
                res.status(400).json({
                    message: 'Đã tồn tại thể loại mail!',
                });
            }else{
                let saveType = await newType.save()
                if(saveType){
                    res.status(200).json({
                        message: 'Thêm thể loại mail thành công!',
                    });
                }else{
                    res.status(400).json({
                        message: 'Thêm thể loại mail thành công!',
                    });
                }
            }
        }else{
            res.status(400).json({
                message: 'Không có quyền thực thi!',
            });
        }
    },
    getType: async function (req, res){
        let check = await Account.findOne({
            token: req.body.token,
            isdelete: false,
            status: true,
            role: 2
        })
        if(check){
            let getType = await Type.find()
            if(getType){
                res.status(200).json({
                    message: 'Lấy dữ liệu thành công!',
                    data: getType
                });
            }else{
                res.status(400).json({
                    message: 'Lấy dữ liệu thất bại!',
                });
            }
        }else{
            res.status(400).json({
                message: 'Không có quyền thực thi!',
            });
        }
    },
    editType: async function (req, res){
        let check = await Account.findOne({
            token: req.body.token,
            isdelete: false,
            status: true,
            role: 2
        })
        if(check){
            let filter = {
                _id: req.body.id_Type,
                isdelete: false
            }
            let findType = await Type.findOne(filter)
            let update = {
                name: req.body.name ? req.body.name.trim(): findType.name
            }
            let updateType = await Type.findOneAndUpdate(filter, update, {new: true})
            if(updateType){
                res.status(200).json({
                    message: 'Sửa thể loại thành công!',
                });
            }else{
                res.status(400).json({
                    message: 'Sửa thể loại thất bại!',
                });
            }
        }else{
            res.status(400).json({
                message: 'Không có quyền thực thi!',
            });
        }
    },
    deleteType: async function (req, res){
        try{
            let check = await Account.findOne({
                token: req.body.token,
                isdelete: false,
                status: true,
                role: 2
            })
            let arr = req.body.id_Type;
                // arr = JSON.parse(arr);
            if(check){
                for(let i = 0; i < arr.length; i++){
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
                
            }else{
                res.status(400).json({
                    message: 'Không có quyền thực thi!',
                });
            }
        }catch(e){
            res.status(400).json({
                message: e.message,
            });
        }
    },
}