let Admin = require('../model/superadmin')
let Note = require('../model/note')
module.exports = {
    addNote: async function (req, res) {
        let check = await Admin.findOne({
            token: req.body.token,
            isdelete: false,
            status: true,
            role: 10
        })
        let newNote= new Note({
            name: req.body.name.trim(),
            date_import: new Date(),
        })
        if(check){
            let checkExists = await Note.findOne({name: req.body.name.trim()})
            if(checkExists){
                res.status(400).json({
                    message: 'Đã tồn tại note!',
                });
            }else{
                let saveNote = await newNote.save()
                if(saveNote){
                    res.status(200).json({
                        message: 'Thêm note thành công!',
                    });
                }else{
                    res.status(400).json({
                        message: 'Thêm note thất bại!',
                    });
                }
            }
        }else{
            res.status(400).json({
                message: 'Không có quyền thực thi!',
            });
        }
    },
    editNote: async function (req, res) {
        let check = await Admin.findOne({
            token: req.body.token,
            isdelete: false,
            status: true,
            role: 10
        })
        if(check){
            let filter = {
                _id: req.body.id_Note,
            }
            let findNote = await Note.findOne(filter)
            let update = {
                name: req.body.name ? req.body.name.trim(): findNote.name,
            }
            let updateNote = await Note.findOneAndUpdate(filter, update, {new: true})
            if(updateNote){
                res.status(200).json({
                    message: 'Sửa note thành công!',
                });
            }else{
                res.status(400).json({
                    message: 'Sửa note thất bại!',
                });
            }
        }else{
            res.status(400).json({
                message: 'Không có quyền thực thi!',
            });
        }
    },
    getNote: async function (req, res) {
        let check = await Admin.findOne({
            token: req.body.token,
            isdelete: false,
            status: true,
            role: 10
        })
        if(check){
            let getNote = await Note.find();
            if(getNote){
                res.status(200).json({
                    message: 'Lấy dữ liệu thành công!',
                    data: getNote
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
    deleteNote: async function (req, res) {
        try{
            let check = await Admin.findOne({
                token: req.body.token,
                isdelete: false,
                status: true,
                role: 10
            })
            let arr = req.body.id_Note;
                // arr = JSON.parse(arr);
            if(check){
                for(let i = 0; i < arr.length; i++){
                    let filter = {
                        _id: arr[i],
                    }
                    let deleteNote = await Note.findOneAndDelete(filter)
                    if (i + 1 == arr.length) {
                        res.status(200).json({
                            message: "Xóa note thành công!",
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