let Log = require('../model/dataLog')
let Admin = require('../model/superadmin')
module.exports = {
    getLogImport: async function(req, res) {
        try{
            let check = await Admin.findOne({
                token: req.body.token,
                isdelete: false,
                status: true,
                role: 10
            })
            let filter = {
                type: "Import"
            }
            if(check){
                let perPage = parseInt(req.body.limit);
                let page = parseInt(req.body.page || 1);
                let skip = (perPage * page) - perPage; 
                let result = await Log.find(filter).skip(skip).limit(perPage);
                let totalDocuments = await Log.countDocuments(filter);
                let totalPage = Math.ceil(totalDocuments / perPage);
                res.status(200).json({
                    message: "Lấy dữ liệu thành công!",
                    data: result,
                    page: page,
                    totalDocuments: totalDocuments,
                    totalPage: totalPage,
                    
                });
            }else{
                res.status(400).json({
                    message: "Không có quyền thực thi!"   
                })
            }
        }catch(ex){
            res.status(400).json({
                message: ex.message   
            })
        }
        
    },
    getLogExport: async function(req, res) {
        try{
            let check = await Admin.findOne({
                token: req.body.token,
                isdelete: false,
                status: true,
                role: 10
            })
            let filter = {
                type: "Export"
            }
            if(check){
                let perPage = parseInt(req.body.limit);
                let page = parseInt(req.body.page || 1);
                let skip = (perPage * page) - perPage; 
                let result = await Log.find(filter).skip(skip).limit(perPage);
                let totalDocuments = await Log.countDocuments(filter);
                let totalPage = Math.ceil(totalDocuments / perPage);
                res.status(200).json({
                    message: "Lấy dữ liệu thành công!",
                    data: result,
                    page: page,
                    totalDocuments: totalDocuments,
                    totalPage: totalPage,
                    
                });
            }else{
                res.status(400).json({
                    message: "Không có quyền thực thi!"   
                })
            }
        }catch(ex){
            res.status(400).json({
                message: ex.message   
            })
        }
        
    },
    deleteLog: async function(req, res){
        try{
            let check = await Admin.findOne({
                token: req.body.token,
                isdelete: false,
                status: true,
                role: 10
            });
            if(check){
                let idLog = req.body.id_Log;
                for(let i = 0; i < idLog.length; i++){
                    let filter = {
                        _id: idLog[i],
                    }
                    let deleteLog = await Log.deleteMany(filter)
                    if (i + 1 == idLog.length) {
                        res.status(200).json({
                            message: "Xóa log thành công!",
                        });
                    }
                }
            }else{
                res.status(400).json({
                    message: "Không có quyền thực thi!"   
                })
            }
        }catch(ex){
            res.status(400).json({
                message: ex.message   
            })
        }
    },
}