const Mail = require('../model/mails');
let Account = require('../model/account')
let Admin = require('../model/superadmin')
let Cookies = require('../model/cookie')
const sanitizer = require('sanitizer');
const fs = require('fs');
const puppeteer = require('puppeteer');
let request = require('request');
let accChecker = require('../model/accCheckers')
let Log = require('../model/dataLog')
let support = require('./support')
let DeviceDetector = require("device-detector-js");
const deviceDetector  = new DeviceDetector();
var useragent = require('express-useragent');
const {
    Storage
} = require('@google-cloud/storage');
module.exports = {
    addMail: async function (req, res) {
        let check = await Admin.findOne({
            token: req.body.token,
            isdelete: false,
            status: true,
            role: 10
        });
        if (check) {
            try {
                let arrExist = []
                let arrFailed = []
                let arr = req.body.mail;
                for (let i = 0; i < arr.length; i++) {
                    let arrMail = arr[i].split("|");
                    if (arrMail[0] && arrMail[1] && arrMail[2]) {
                        let checkMails = await Mail.findOne({
                            mail: arrMail[0],
                            isdelete: false,
                        });
                        console.log(checkMails);
                        if (checkMails == null) {
                            if (support.validateEmail(arrMail[0]) == true) {
                                let newMails = new Mail({
                                    mail: sanitizer.escape(arrMail[0].trim()),
                                    password: sanitizer.escape(arrMail[1].trim()),
                                    mailRecovery: sanitizer.escape(arrMail[2].trim()),
                                    type: sanitizer.escape(req.body.type),
                                    nation: sanitizer.escape(req.body.nation),
                                    // user: sanitizer.escape(req.body.buyer),
                                    import_by: check._id,
                                    edit_by: check._id,
                                    note: arrMail[3] ? sanitizer.escape(arrMail[3].trim()) : "",
                                    date_import: new Date(),
                                    date_edit: new Date(),
                                    status: 1,
                                    isdelete: false,
                                    ischeck: false,
                                });
                                let importMail = await newMails.save();
                                if (i + 1 == arr.length) {
                                    res.status(200).json({
                                        message: 'Thêm mail thành công!',
                                        data: arr.length
                                    });
                                    let newLog = new Log({
                                        type: "Import",
                                        totalImport: arr.length,
                                        successImport: arr.length,
                                        failedImport: 0,
                                        buyer: req.body.buyer ? req.body.buyer.trim() : "",
                                        date_import: new Date()
                                    })
                                    let saveLog = await newLog.save()
                                    if(saveLog){
                                        console.log("Save log succes");
                                    }
                                }
                            } else {
                                let mail = (arrMail[0]) ? arrMail[0] : "null";
                                let password = (arrMail[1]) ? arrMail[1] : "null";
                                let recovered = (arrMail[2]) ? arrMail[2] : "null";
                                let note = (arrMail[3]) ? arrMail[3] : "null";
                                let mailFailed = mail + "|" + password + "|" + recovered + "|" + note + "|" + "Sai định dạng Mail"
                                arrFailed.push(mailFailed)
                                if (i + 1 == arr.length) {
                                    res.status(400).json({
                                        message: 'Sai định dạng mail!',
                                        data: arrFailed,
                                        totalImport: arr.length,
                                        failed: arrFailed.length,
                                        success: arr.length - arrFailed.length
                                    });
                                    let newLog = new Log({
                                        type: "Import",
                                        totalImport: arr.length,
                                        successImport: arr.length - arrFailed.length,
                                        failedImport: arrFailed.length,
                                        buyer: req.body.buyer ? req.body.buyer.trim() : "",
                                        date_import: new Date()
                                    })
                                    let saveLog = await newLog.save()
                                    if(saveLog){
                                        console.log("Save log succes");
                                    }
                                }
                            }
                        } else {
                            let mail = (arrMail[0]) ? arrMail[0] : "null";
                            let password = (arrMail[1]) ? arrMail[1] : "null";
                            let recovered = (arrMail[2]) ? arrMail[2] : "null";
                            let note = (arrMail[3]) ? arrMail[3] : "null";
                            let mailExist = mail + "|" + password + "|" + recovered + "|" + note + "|" + "Trùng Mail"
                            arrExist.push(mailExist) 
                            if (i + 1 == arr.length) {
                                res.status(400).json({
                                    message: 'Mail bị trùng, Hãy thử lại!',
                                    data: arrExist,
                                    totalImport: arr.length,
                                    failed: arrExist.length,
                                    success: arr.length - arrExist.length
                                });
                                let newLog = new Log({
                                    type: "Import",
                                    totalImport: arr.length,
                                    successImport: arr.length - arrExist.length,
                                    failedImport: arrExist.length,
                                    buyer: req.body.buyer ? req.body.buyer.trim() : "",
                                    date_import: new Date()
                                })
                                let saveLog = await newLog.save()
                                if(saveLog){
                                    console.log("Save log succes");
                                }
                            }
                        }
                    }
                }
            } catch (ex) {
                console.log(ex);
                res.status(400).json({
                    message: ex.message
                });
            }
        } else {
            res.status(400).json({
                message: "Không có quyền thực thi!"
            })
        }
    },
    getAllMail: async function (req, res) {
        try {
            var checkBody = ["type", "nation"];
            let token = req.body.token
            // let buyer = req.body.buyer
            let filterAdmin = {
                token: token,
                isdelete: false,
                status: true,
                role: 10
            }
            let totalLive = 0;
            let totalDisabled = 0;
            let totalVerified = 0;
            let totalNotExist = 0;
            let totalUnknown = 0;
            let totalSale = 0;
            let checkUser = await Admin.findOne(filterAdmin)
            let filter = {
                isdelete: false,
                status: {
                    $ne: 6
                }
            }
            if (checkUser) {
                for (var k in req.body) {
                    if (checkBody.indexOf(k) != -1 && req.body[k]) {
                        filter[k] = new RegExp(req.body[k].trim(), 'i')
                    }
                }
                if (req.body.ischeck) {
                    filter.ischeck = req.body.ischeck;
                }
                if (req.body.mail) {
                    filter.mail = new RegExp(req.body.mail.trim(), 'i');
                }
                if (req.body.note) {
                    filter.note = new RegExp(req.body.note.trim(), 'i');
                }
                // if(req.body.buyer){
                //     filter.user = new RegExp(req.body.buyer.trim(), 'i');
                // }
                // if (req.body.start_date && req.body.stop_date) {
                //     let start_date = new Date(req.body.start_date + " 07:00")
                //     let stop_date = new Date(req.body.stop_date + " 07:00")
                //     filter.date_import = {
                //         "$gte": start_date,
                //         "$lte": stop_date
                //     }
                // }
                if(req.body.start_date){
                    let start_date = new Date(req.body.start_date + " 07:00")
                    let stop_date = new Date(req.body.start_date + " 07:00")
                    stop_date.setDate(start_date.getDate() + 1)
                    filter.date_import = {
                        "$gte": start_date,
                        "$lt": stop_date
                    }
                }
                // if(req.body.stop_date){
                //     let stop_date = new Date(req.body.stop_date + " 07:00")
                //     filter.date_import = {
                //         "$lte": stop_date,
                //     }
                // }
                if (req.body.status) {
                    filter.status = req.body.status.trim();
                    let a = req.body.status;
                    if (a == 1) {
                        totalLive = await Mail.countDocuments(filter);
                    }
                    if (a == 2) {
                        totalDisabled = await Mail.countDocuments(filter);
                    }
                    if (a == 3) {
                        totalVerified = await Mail.countDocuments(filter);
                    }
                    if (a == 4) {
                        totalNotExist = await Mail.countDocuments(filter);
                    }
                    if (a == 5) {
                        totalUnknown = await Mail.countDocuments(filter);
                    }
                    if (a == 6) {
                        totalSale = await Mail.countDocuments(filter);
                    }
                }
                const perPage = parseInt(req.body.limit);
                const page = parseInt(req.body.page || 1);
                const skip = (perPage * page) - perPage;
                const result = await Mail.find(filter).skip(skip).limit(perPage);
                const totalDocuments = await Mail.countDocuments(filter);
                const totalPage = Math.ceil(totalDocuments / perPage);
                if (!req.body.status) {
                    filter.status = 1;
                    totalLive = await Mail.countDocuments(filter);
                    filter.status = 2;
                    totalDisabled = await Mail.countDocuments(filter);
                    filter.status = 3;
                    totalVerified = await Mail.countDocuments(filter);
                    filter.status = 4;
                    totalNotExist = await Mail.countDocuments(filter);
                    filter.status = 5;
                    totalUnknown = await Mail.countDocuments(filter);
                    filter.status = 6;
                    totalSale = await Mail.countDocuments(filter);
                }
                res.status(200).json({
                    message: "Lấy dữ liệu thành công!",
                    data: result,
                    page: page,
                    totalDocuments: totalDocuments,
                    totalPage: totalPage,
                    totalLive: totalLive,
                    totalDisabled: totalDisabled,
                    totalVerified: totalVerified,
                    totalNotExist: totalNotExist,
                    totalUnknown: totalUnknown,
                    totalSale: totalSale,

                });
            } else {
                res.status(400).json({
                    message: "Không có quyền thực thi!"
                })
            }
        } catch (ex) {
            res.status(400).json({
                message: "Không có quyền thực thi!",
                data: ex.message
            })
        }

    },
    deleteMail: async function (req, res) {
        try {
            let filterAdmin = {
                token: req.body.token,
                isdelete: false,
                status: true,
                role: 10
            }
            let checkAdmin = await Admin.findOne(filterAdmin)
            if (checkAdmin) {
                let filter = {
                    _id: req.body.id_mail,
                    isdelete: false,
                }
                let update = {
                    isdelete: true,
                }
                let delMail = await Mail.findOneAndUpdate(filter, update, {
                    new: true
                })
                if (delMail) {
                    res.status(200).json({
                        message: "Xóa mail thành công!"
                    })
                } else {
                    res.status(400).json({
                        message: "Xóa mail thất bại. Vui lòng thử lại!"
                    })
                }
            } else {
                res.status(400).json({
                    message: "Không có quyền thực thi!"
                })
            }
        } catch (ex) {
            res.status(400).json({
                message: ex.message
            })
        }
    },
    deleteMails: async function (req, res) {
        try {
            let arr = req.body.id_mails;
            let check = await Admin.findOne({
                token: req.body.token,
                isdelete: false,
                status: true,
                role: 10
            });
            try {
                if (check) {
                    for (let i = 0; i < arr.length; i++) {
                        let update = {
                            isdelete: true,
                        };
                        try {
                            let filter = {
                                _id: arr[i],
                                isdelete: false,
                            }
                            let result = await Mail.findOneAndUpdate(filter, update, {
                                new: true
                            });
                        } catch (ex) {
                            res.status(400).json({
                                message: ex.message,
                            });
                        }
                        if (i + 1 == arr.length) {
                            res.status(200).json({
                                message: "Xóa email thành công!",
                            });
                        }
                    }
                } else {
                    res.status(400).json({
                        message: "Không có quyền thực thi!"
                    });
                }
            } catch (error) {
                res.status(400).json({
                    message: "Không có quyền thực thi!",
                    data: error.message
                });
            }
        } catch (ex) {
            res.status(400).json({
                message: ex.message
            });
        }
    },
    editMail: async function (req, res) {
        try {
            let check = await Admin.findOne({
                token: req.body.token,
                isdelete: false,
                status: true,
                role: 10
            });
            let checkBody = ["type", "nation", "mail", "password", "mailRecovery", "note"];
            let update = {
                date_edit: new Date(),
                edit_by: check._id
            };
            let id_mail = req.body.id_mail;
            if (check) {
                for (var k in req.body) {
                    if (checkBody.indexOf(k) != -1 && req.body[k]) {
                        update[k] = req.body[k].trim();
                        if (k == "mail") {
                            update[k] = req.body[k].trim().split(/\s+/).join('');
                        }
                    }
                }
                if(req.body.status){
                    update.status = parseInt(req.body.status)
                }
                try {
                    let check_mail
                    let filterMail = {
                        _id: id_mail,
                        isdelete: false,
                    }
                    if (req.body.mail) {
                        check_mail = await Mail.findOne({
                            mail: sanitizer.escape(req.body.mail.trim().split(/\s+/).join(''))
                        });
                    }
                   
                    if (check_mail != null && check_mail._id != id_mail) {
                        console.log("check_mail: " + JSON.stringify(check_mail));
                        console.log("id_mail: " + id_mail);
                        res.status(400).json({
                            message: "Mail đã tồn tại trong hệ thống!"
                        })
                    } else {
                        let updateMail = await Mail.findOneAndUpdate(filterMail, update, {new: true})
                        console.log(updateMail);
                        if(updateMail){
                            res.status(200).json({
                                message: "Cập nhật thành công"
                            });
                        }else{
                            res.status(400).json({
                                message: "Cập nhật thất bại"
                            });
                        }
                    }
                } catch (ex) {
                    res.status(401).json({
                        message: ex.message
                    });
                }
            } else {
                res.status(400).json({
                    message: "Không có quyền thực thi!"
                })
            }
        } catch (ex) {
            res.status(400).json({
                message: "Không có quyền thực thi!",
                data: ex.message
            })
        }
    },
    testFunction: async function (req, res) {
        var source = req.headers['user-agent']
        const result = deviceDetector.parse(source);
        res.status(200).json({
            data: result
        })
        // console.log(result);
        return
        res.json({
            data: JSON.stringify(req)
        })
        return
        const fetch = require("node-fetch");

        var myHeaders = new fetch.Headers();

        // var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJwYXNzd29yZCI6ImFkbWluMTIzIiwiaWF0IjoxNjM0NjMyNTM1fQ.7GkwqpakxrKUbojRVay68BtnoiH5WyMcUNrNi-eJZX8");
        urlencoded.append("type", "");
        urlencoded.append("nation", "");
        urlencoded.append("ischeck", "");
        urlencoded.append("mail", "");
        urlencoded.append("start_date", "");
        urlencoded.append("status", "");
        urlencoded.append("limit", "20");

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow'
        };

        fetch("http://localhost:3000/api/mail/get-all-mail", requestOptions)
        .then(response => response.text())
        .then(result => res.json({
            data: result
        }))
        .catch(error => console.log('error', error));
        return
        let filter = {
            ischeck: true
        }
        let update = {
            ischeck: false
        }
        let updateStatus = await Mail.updateMany(filter, update)
        if(updateStatus){
            res.status(200).json({
                message: 'done'
            })
        }
        return
        try {
            let check = 0
            let startDate = req.body.start_date + " 7:00"
            let stopDate = req.body.stop_date + " 7:00"
            let day_startDate = new Date(startDate)
            let day_stopDate = new Date(stopDate)
            console.log(day_startDate.getTime());
            console.log(day_stopDate.getTime());
            console.log(day_startDate.getTime() < day_stopDate.getTime());
            // console.log(stopDate);
            return
            var checkBody = ["type", "nation"];
            let token = req.body.token
            // let buyer = req.body.buyer
            let filterUser = {
                token: token,
                isdelete: false,
                status: true,
                role: 2
                // $or: [{role:1}, {role:2}]
            }
            let totalLive = 0;
            let totalDisabled = 0;
            let totalVerified = 0;
            let totalSale = 0;
            let checkUser = await Account.findOne(filterUser)
            let filter = {
                isdelete: false,
                buyer: checkUser._id
            }
            if (checkUser) {
                for (var k in req.body) {
                    if (checkBody.indexOf(k) != -1 && req.body[k]) {
                        filter[k] = new RegExp(req.body[k].trim(), 'i')
                    }
                }
                if (req.body.ischeck) {
                    filter.ischeck = req.body.ischeck;
                }
                if (req.body.mail) {
                    filter.mail = new RegExp(req.body.mail.trim(), 'i');
                }
                if (req.body.start_date && req.body.stop_date) {
                    let start_date = new Date(req.body.start_date + " 07:00")
                    let stop_date = new Date(req.body.stop_date + " 07:00")
                    filter.date_import = {
                        "$gte": start_date,
                        "$lte": stop_date
                    }
                }
                if (req.body.start_date) {
                    let start_date = new Date(req.body.start_date + " 07:00")
                    filter.date_import = {
                        "$gte": start_date,
                    }
                }
                if (req.body.stop_date) {
                    let stop_date = new Date(req.body.stop_date + " 07:00")
                    filter.date_import = {
                        "$lte": stop_date,
                    }
                }
                if (req.body.status) {
                    filter.status = req.body.status.trim();
                    let a = req.body.status;
                    if (a == 1) {
                        totalLive = await Mail.countDocuments(filter);
                    }
                    if (a == 2) {
                        totalDisabled = await Mail.countDocuments(filter);
                    }
                    if (a == 3) {
                        totalVerified = await Mail.countDocuments(filter);
                    }
                    if (a == 4) {
                        totalSale = await Mail.countDocuments(filter);
                    }
                }
                const perPage = parseInt(req.body.limit);
                const page = parseInt(req.body.page || 1);
                const skip = (perPage * page) - perPage;
                console.log(filter)
                const result = await Mail.find(filter).skip(skip).limit(perPage);
                const totalDocuments = await Mail.countDocuments(filter);
                const totalPage = Math.ceil(totalDocuments / perPage);
                if (!req.body.status) {
                    filter.status = 1;
                    totalLive = await Mail.countDocuments(filter);
                    filter.status = 2;
                    totalDisabled = await Mail.countDocuments(filter);
                    filter.status = 3;
                    totalVerified = await Mail.countDocuments(filter);
                    filter.status = 4;
                    totalSale = await Mail.countDocuments(filter);
                }
                res.status(200).json({
                    message: "Lấy dữ liệu thành công!",
                    data: result,
                    page: page,
                    totalDocuments: totalDocuments,
                    totalPage: totalPage,
                    totalLive: totalLive,
                    totalDisabled: totalDisabled,
                    totalVerified: totalVerified,
                    totalSale: totalSale,

                });
            } else {
                res.status(400).json({
                    message: "Không có quyền thực thi!"
                })
            }
        } catch (ex) {
            res.status(400).json({
                message: ex.message,
            })
        }

    },
    getCookie: async (req, res) => {
        let filterUser = {
            token: req.body.token,
            isdelete: false,
            status: true,
            role: 2
        }
        let checkUser = await Account.findOne(filterUser)
        if(checkUser){
            let accountChecker = await accChecker.findOne({user: checkUser.username})
            if(accountChecker){
                let username = accountChecker.username
                let password = accountChecker.password
                // let username = "anhnhanvn";
                // let password = "anhtruc123";
                // const browser = await puppeteer.connect({
                // 	browserWSEndpoint: 'ws://localhost:5555'
                // });
                const browser = await puppeteer.launch({
                    headless: true,
                })
                const page = await browser.newPage()
                await page.goto('http://gmailchecker.info/Account/Login')
                await page.waitForTimeout(1500)


                const USER_SELECTOR = '#input-email'
                const PASSWORD_SELECTOR = '#input-password'
                const BUTTON_LOGIN_SELECTOR = '#LoginButton'


                await page.click(USER_SELECTOR)
                await page.keyboard.type(username)

                await page.click(PASSWORD_SELECTOR)
                await page.keyboard.type(password)

                await page.click(BUTTON_LOGIN_SELECTOR)
                await page.waitForNavigation()
                // await page.waitForTimeout(1000)
                const cookies = await page.cookies();
                await page.waitForTimeout(4000)
                console.log(cookies);
                let cookies_get;
                let xTOKEN;
                for (let i = 0; i < cookies.length; i++) {
                    console.log("cookie name = " + cookies[i].name);
                    console.log("cookie value = " + cookies[i].value);
                    cookies_get += cookies[i].name + "=" + cookies[i].value + ";";
                    if (cookies[i].name == "XSRF-TOKEN") {
                        xTOKEN = cookies[i].value;
                    }
                }
                cookies_get = cookies_get.replace("undefined", "");
                console.log("cookie get =  " + cookies_get);
                let checkCookie = await Cookies.findOne({
                    user: checkUser.username
                });
                try {
                    if (checkCookie.user) {
                        Cookies.findOneAndUpdate({
                            user: checkUser.username
                        }, {
                            cookie: cookies_get,
                            Xtoken: xTOKEN
                        }, function (err, rss) {
                            if (rss) {
                                console.log("Cập nhật cookie thành công " + rss)
                            } else {
                                console.log(err)
                            }
                        });
                    }
                } catch (exx) {
                    let newCookie = new Cookies({
                        cookie: cookies_get,
                        Xtoken: xTOKEN,
                        user: checkUser.username
                    });
                    newCookie.save((err, result) => {
                        if (result) {
                            console.log("Lưu cookie thành công " + rss)
                        } else {
                            console.log(err)
                        }
                    });
                }
            }else{
                console.log("Ông này có tài khoản đâu mà check");
            }
        }else{
            console.log("Hết phiên");
        }
    },
    checkMails: async function (req, res) {
        var checkBody = ["type", "nation"];
        let checkUser = await Admin.findOne({
            token: req.body.token,
            isdelete: false,
            status: true,
            role: 10
        })
        if (checkUser) {
            let filter = {
                isdelete: false,
                ischeck: false,
                status: {
                    $ne: 6
                }
            }
            for (var k in req.body) {
                if (checkBody.indexOf(k) != -1 && req.body[k]) {
                    filter[k] = new RegExp(req.body[k].trim(), 'i')
                }
            }
            if(req.body.start_date){
                let start_date = new Date(req.body.start_date + " 07:00")
                let stop_date = new Date(req.body.start_date + " 07:00")
                stop_date.setDate(start_date.getDate() + 1)
                filter.date_import = {
                    "$gte": start_date,
                    "$lt": stop_date
                }
            }
            let totalcheck = await Mail.countDocuments(filter)
            if(totalcheck <= 0){
                res.status(400).json({
                    message: "Không có dữ liệu để check!"
                })
            }else{
                let checkCookiesExist = await Cookies.findOne({
                    user: checkUser.username
                });
                if(checkCookiesExist){
                    console.log("Tài khoản đã có cookie");
                }else{
                    console.log("Tài khoản chưa có cookie, đi lấy đã nhé.");
                    await support.getCookie(checkUser.token);
                } 
                const perPage = 500;
                const totalPage = Math.ceil(totalcheck / perPage);
                let cookies = await Cookies.findOne({
                    user: checkUser.username
                });
                if(cookies){
                    for (let i = 0; i < totalPage; i++) {
                        let arrMail = [];
                        let page = i + 1
                        let skip = (perPage * page) - perPage;
                        let result = await Mail.find(filter).skip(skip).limit(perPage)
                        for (let j = 0; j < result.length; j++) {
                            arrMail.push(result[j].mail.trim());
                        }
                        const options = {
                            method: 'POST',
                            url: 'http://gmailchecker.info/Mail/check',
                            headers: {
                                'Host': "gmailchecker.info",
                                'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
                                'Accept': "*/*",
                                'Accept-Language': "en-GB,en;q=0.5",
                                'Accept-Encoding': "",
                                'Referer': "http://gmailchecker.info/Mail",
                                'Content-Type': "application/json",
                                'X-XSRF-TOKEN': cookies.Xtoken.toString(),
                                'X-Requested-With': "XMLHttpRequest",
                                'Origin': "http://gmailchecker.info",
                                'Connection': "keep-alive",
                                'Cookie': cookies.cookie.toString(),
                            },
                            json: {
                                "data": arrMail,
                                "transactionId": 0
                            }
                        };
                        request(options, async function (errs, ress, body) {
                            if (errs) {
                                console.log(errs);
                            } else {
                                try {
                                    let rsChecked = body.result.list;
                                    for (let y = 0; y < rsChecked.length; y++) {
                                        setTimeout(async function () {
                                            let temp = rsChecked[y].split("|");
                                            let statusCheck = 1;
                                            switch (temp[0]) {
                                                case "Good":
                                                    statusCheck = 1;
                                                    break;
                                                case "Disable":
                                                    statusCheck = 2;
                                                    break;
                                                case "Ver":
                                                    statusCheck = 3;
                                                    break;
                                                case "Not_Exist":
                                                    statusCheck = 4;
                                                    break;
                                                default:
                                                    statusCheck = 5;
                                            }
                                            let update = await Mail.updateMany({
                                                mail: temp[1]
                                            }, {
                                                status: statusCheck,
                                                ischeck: true
                                            })
                                            if (update !== null) {
                                                console.log("UPDATE STATUS SUCCESS: " + temp[1] + "|" + temp[0])
                                            } else {
                                                console.log("UPDATE STATUS FAIL " + temp[1])
                                            }
                                            if(y+1 == rsChecked.length && i+1 == totalPage){
                                                console.log("CHECK MAIL DONE");
                                                res.status(200).json({
                                                    message: "Check mail thành công!"
                                                })
                                            }
                                        }, 30*y)
                                    }
                                } catch (rex) {
                                    console.log(rex);
                                }
                            }
                        });
                        page++;
                    }
                }else{
                    res.status(400).json({
                        message: "Chưa có tài khoản checkmail!"
                    })
                }
            }
            
        } else {
            res.status(400).json({
                message: "Không có quyền thực thi!"
            })
        }

    },
    getTypeMail: async function (req, res) {
        try {
            let check = await Account.findOne({
                token: req.body.token,
                isdelete: false,
                status: true,
                role: 2
            })
            if (check) {
                let arrType = []
                let filter = {
                    user: check._id,
                    isdelete: false,
                }
                let getAll = await Mail.find(filter);
                for (let i = 0; i < getAll.length; i++) {
                    arrType.push(getAll[i].type)
                }
                arrType = Array.from(new Set(arrType))
                res.status(200).json({
                    message: "Lấy dữ liệu thành công!",
                    data: arrType
                })
            } else {
                res.status(400).json({
                    message: "Không có quyền thực thi!",
                })
            }
        } catch (ex) {
            res.status(400).json({
                message: "Không có quyền thực thi!",
                data: ex.message
            })
        }

    },
    getNation: async function (req, res) {
        try {
            let check = await Account.findOne({
                token: req.body.token,
                isdelete: false,
                status: true,
                role: 2
            })
            if (check) {
                let arrNation = []
                let filter = {
                    user: check._id,
                    isdelete: false,
                }
                let getAll = await Mail.find(filter);
                for (let i = 0; i < getAll.length; i++) {
                    arrNation.push(getAll[i].nation)
                }
                arrNation = Array.from(new Set(arrNation))
                res.status(200).json({
                    message: "Lấy dữ liệu thành công!",
                    data: arrNation
                })
            } else {
                res.status(400).json({
                    message: "Không có quyền thực thi!",
                })
            }
        } catch (ex) {
            res.status(400).json({
                message: "Không có quyền thực thi!",
                data: ex.message
            })
        }
    },
    getDate: async function (req, res) {
        try {
            let check = await Admin.findOne({
                token: req.body.token,
                isdelete: false,
                status: true,
                role: 10
            })
            if (check) {
                let arrDate = []
                let filter = {
                    isdelete: false,
                }
                let getAll = await Mail.find(filter);
                for (let i = 0; i < getAll.length; i++) {
                    let date_buy = new Date(getAll[i].date_import)
                    let date = date_buy.getDate()
                    let month = date_buy.getMonth() + 1
                    let year = date_buy.getFullYear()
                    let date_insert = year + "-" + month + "-" + date
                    arrDate.push(date_insert)
                }
                arrDate = Array.from(new Set(arrDate))
                res.status(200).json({
                    message: "Lấy dữ liệu thành công!",
                    data: arrDate
                })
            } else {
                res.status(400).json({
                    message: "Không có quyền thực thi!",
                })
            }
        } catch (ex) {
            res.status(400).json({
                message: "Không có quyền thực thi!",
                data: ex.message
            })
        }
    },
    getStatus: async function (req, res) {
        try {
            let check = await Account.findOne({
                token: req.body.token,
                isdelete: false,
                status: true,
                role: 2
            })
            if (check) {
                let arrStatus = []
                let filter = {
                    user: check._id
                }
                let getAll = await Mail.find(filter);
                for (let i = 0; i < getAll.length; i++) {
                    arrStatus.push(getAll[i].status)
                }
                arrStatus = Array.from(new Set(arrStatus))
                res.status(200).json({
                    message: "Lấy dữ liệu thành công!",
                    data: arrStatus
                })
            } else {
                res.status(400).json({
                    message: "Không có quyền thực thi!",
                })
            }
        } catch (ex) {
            res.status(400).json({
                message: "Không có quyền thực thi!",
                data: ex.message
            })
        }
    },
    exportMail: async function (req, res) {
        try {
            let check = await Admin.findOne({
                token: req.body.token,
                isdelete: false,
                status: true,
                role: 10
            })
            if (check) {
                let filter = {
                    isdelete: false,
                    status: {
                        $ne: 6
                    }
                };
                var checkBody = ["type", "nation", "note"];
                for (var k in req.body) {
                    if (checkBody.indexOf(k) != -1 && req.body[k]) {
                        filter[k] = new RegExp(req.body[k].trim(), 'i')
                    }
                }
                let arr = req.body.quantity;
                arr = parseInt(arr);
                let check_result = await Mail.find(filter).limit(arr);
                if(arr > check_result.length){
                    res.status(400).json({
                        message: "Số lượng mail không đủ!"
                    })
                }else{
                    var d = new Date(),
                    month = '' + (d.getMonth() + 1),
                    day = '' + d.getDate(),
                    year = d.getFullYear();
                    let filename = "File Export (" + year + "-" + month + "-" + day + ").txt";
                    let perPage = 100;
                    let arrData = []
                    const totalDocuments = await Mail.countDocuments(filter);
                    // const totalPage = Math.ceil(totalDocuments / perPage);
                    const totalPage = Math.ceil(arr / perPage);
                    if (totalPage == 0) {
                        res.status(200).json({
                            message: "Không có dữ liệu để đồng bộ!"
                        })
                    } else {
                        // for (let i = 0; i < totalPage; i++) {
                            // let skip = (arr * page) - arr;
                            // let result = await Mail.find(filter).sort({date_import: 1}).skip(skip).limit(arr);
                            let result = await Mail.find(filter).sort({date_import: 1}).limit(arr);
                            for (let j = 0; j < result.length; j++) {
                                let updateStatus = {
                                    status: 6,
                                    edit_by: check._id
                                }
                                let filterMail = {
                                    mail: result[j].mail
                                }
                                let rs_update = await Mail.updateMany(filterMail, updateStatus)
                                if(rs_update){
                                    console.log("Update status success");
                                }
                                //date import
                                let date = new Date(result[j].date_import);
                                let year = date.getFullYear();
                                let month = date.getMonth() + 1;
                                let dt = date.getDate();
                                let date_import = year + '-' + month + '-' + dt;
                                //date edit
                                let date1 = new Date(result[j].date_edit);
                                let year1 = date1.getFullYear();
                                let month1 = date1.getMonth() + 1;
                                let dt1 = date1.getDate();
                                let date_edit = year1 + '-' + month1 + '-' + dt1;
                                //log Data
                                let logData = result[j].mail + '|' + result[j].password + '|' + result[j].mailRecovery + '|' + result[j].note + '|' + result[j].type + '|' + result[j].nation + '|' + result[j].status + '|' + date_import.toString() + '|' + date_edit.toString();
                                arrData.push(logData)
                                // fs.appendFile(filename, logData, function (err) {
                                //     if (err) throw err;
                                // });
                            }
                                res.status(200).json({
                                    message: "Xuất dữ liệu thành công!",
                                    filename: filename,
                                    data: arrData,
                                })
                                let newLog = new Log({
                                    type: "Export",
                                    totalExport: arr,
                                    successExport: arrData.length,
                                    failedExport: arr - arrData.length,
                                    buyer: req.body.buyer ? req.body.buyer.trim() : "",
                                    date_export: new Date()
                                })
                                let saveLogExport = await newLog.save()
                                if(saveLogExport){
                                    console.log("Save log export done");
                                }
                    }
                }
            } else {
                res.status(400).json({
                    message: "Không có quyền thực thi!"
                })
            }
        } catch (ex) {
            res.status(400).json({
                message: ex.message,
            })
        }
    },
    editMails: async function (req, res) {
        try {
            let check = await Account.findOne({
                token: req.body.token,
                isdelete: false,
                status: true,
                role: 2
            })
            var checkBody = ["type", "nation", "note"];
            let filter = {
                isdelete: false,
                user: check._id
            };
            for (var k in req.body) {
                if (checkBody.indexOf(k) != -1 && req.body[k]) {
                    filter[k] = new RegExp(req.body[k].trim(), 'i')
                }
            }
            if (req.body.ischeck) {
                filter.ischeck = req.body.ischeck;
            }
            if (req.body.mail) {
                filter.mail = new RegExp(req.body.mail.trim(), 'i')
            }
            if (req.body.status) {
                filter.status = parseInt(req.body.status)
            }
            if(req.body.start_date){
                let start_date = new Date(req.body.start_date + " 07:00")
                let stop_date = new Date(req.body.start_date + " 07:00")
                stop_date.setDate(start_date.getDate() + 1)
                filter.date_import = {
                    "$gte": start_date,
                    "$lt": stop_date
                }
            }
            if (check) {
                let rs = await Mail.find(filter);
                let update = {
                    type: (req.body.typeEdit) ? req.body.typeEdit : rs.type,
                    nation: (req.body.nationEdit) ? req.body.nationEdit : rs.nation,
                    note: (req.body.noteEdit) ? req.body.noteEdit : rs.note,
                }
                Mail.updateMany(filter, update, (ers, ress) => {
                    if (ress) {
                        res.status(200).json({
                            message: "Cập nhật thành công!"
                        });
                    } else {
                        res.status(400).json({
                            message: "Cập nhật thất bại!"
                        });
                    }
                });
            } else {
                res.status(400).json({
                    message: "Không có quyền thực thi!"
                })
            }

        } catch (ex) {
            res.status(401).json({
                message: ex.message
            });
        }
    },
    testCheck: async function(req, res) {
        let arrMail = ['1@gmail.com', '2@gmail.com', '3@gmail.com']
        let cookies = await Cookies.findOne({
            user: 'tam'
        });
            const options = {
                method: 'POST',
                url: 'http://gmailchecker.info/Mail/check',
                headers: {
                    'Host': "gmailchecker.info",
                    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
                    'Accept': "*/*",
                    'Accept-Language': "en-GB,en;q=0.5",
                    'Accept-Encoding': "",
                    'Referer': "http://gmailchecker.info/Mail",
                    'Content-Type': "application/json",
                    'X-XSRF-TOKEN': cookies.Xtoken.toString(),
                    'X-Requested-With': "XMLHttpRequest",
                    'Origin': "http://gmailchecker.info",
                    'Connection': "keep-alive",
                    'Cookie': cookies.cookie.toString(),
                },
                json: {
                    "data": arrMail,
                    "transactionId": 0
                }
            };
            request(options, async function (errs, ress, body) {
                if (errs) {
                    console.log(errs);
                } else {
                    try {
                        let rsChecked = body.result.list;
                        for (let y = 0; y < rsChecked.length; y++) {
                            let temp = kq[y].split("|");
                            let statusCheck = 1;
                            switch (temp[0]) {
                                case "Good":
                                    statusCheck = 1;
                                    break;
                                case "Disable":
                                    statusCheck = 2;
                                    break;
                                case "Ver":
                                    statusCheck = 3;
                                    break;
                                case "Not_Exist":
                                    statusCheck = 4;
                                    break;
                                default:
                                    statusCheck = 5;
                            }
                            let update = await Mail.updateMany({
                                mail: temp[1]
                            }, {
                                status: statusCheck,
                                ischeck: true
                            })
                            if (update !== null) {
                                console.log("UPDATE STATUS SUCCESS: " + temp[1] + "|" + temp[0])
                                // let rs_find = await Mail.find({mail: temp[1]})
                                // console.log(rs_find);
                            } else {
                                console.log("UPDATE STATUS FAIL " + temp[1])
                            }
                            if(y+1 == rsChecked.length){
                                console.log("CHECK MAIL DONE");
                            }
                        }
                    } catch (rex) {}
                }
            });
        return
    },
    checkMailByList: async function (req, res) {
        try{
            let arr = req.body.id_mails;
            let check = await Admin.findOne({
                token: req.body.token,
                isdelete: false,
                status: true,
                role: 10
            });
            let checkCookiesExist = await Cookies.findOne({
                user: check.username
            });
            if(checkCookiesExist){
                console.log("Tài khoản đã có cookie");
            }else{
                console.log("Tài khoản chưa có cookie, đi lấy đã nhé.");
                await support.getCookie(check.token);
            } 
            if(check){
                let arrMail = [];
                for(let i = 0; i < arr.length; i++){
                    let filter = {
                        _id: arr[i],
                        isdelete: false,
                        ischeck: false,
                        status: {
                            $ne: 6
                        }
                    }
                    let result = await Mail.find(filter)
                    if(result){
                        console.log(result);
                        for (let j = 0; j < result.length; j++) {
                            arrMail.push(result[j].mail.trim());
                        }
                        
                    }else{
                        res.status(400).json({
                            message: "Không có mail để check!"
                        });
                    }
                }
                const options = {
                    method: 'POST',
                    url: 'http://gmailchecker.info/Mail/check',
                    headers: {
                        'Host': "gmailchecker.info",
                        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
                        'Accept': "*/*",
                        'Accept-Language': "en-GB,en;q=0.5",
                        'Accept-Encoding': "",
                        'Referer': "http://gmailchecker.info/Mail",
                        'Content-Type': "application/json",
                        'X-XSRF-TOKEN': checkCookiesExist.Xtoken.toString(),
                        'X-Requested-With': "XMLHttpRequest",
                        'Origin': "http://gmailchecker.info",
                        'Connection': "keep-alive",
                        'Cookie': checkCookiesExist.cookie.toString(),
                    },
                    json: {
                        "data": arrMail,
                        "transactionId": 0
                    }
                };
                request(options, async function (errs, ress, body) {
                    if (errs) {
                        console.log(errs);
                    } else {
                        try {
                            let rsChecked = body.result.list;
                            for (let y = 0; y < rsChecked.length; y++) {
                                setTimeout(async function () {
                                    let temp = rsChecked[y].split("|");
                                    let statusCheck = 1;
                                    switch (temp[0]) {
                                        case "Good":
                                            statusCheck = 1;
                                            break;
                                        case "Disable":
                                            statusCheck = 2;
                                            break;
                                        case "Ver":
                                            statusCheck = 3;
                                            break;
                                        case "Not_Exist":
                                            statusCheck = 4;
                                            break;
                                        default:
                                            statusCheck = 5;
                                    }
                                    let update = await Mail.updateMany({
                                        mail: temp[1]
                                    }, {
                                        status: statusCheck,
                                        ischeck: true
                                    })
                                    if (update !== null) {
                                        console.log("UPDATE STATUS SUCCESS: " + temp[1] + "|" + temp[0])
                                    } else {
                                        console.log("UPDATE STATUS FAIL " + temp[1])
                                    }
                                    if(y+1 == rsChecked.length){
                                        // console.log("y = " + y);
                                        console.log("CHECK MAIL DONE");
                                        res.status(200).json({
                                            message: "Check mail thành công!"
                                        })
                                    }
                                }, 30*y)
                            }
                        } catch (rex) {
                            console.log(rex);
                        }
                    }
                });
            }else{
                res.status(400).json({
                    message: "Không có quyền thực thi!"
                });
            }
        }catch(ex){
            res.status(400).json({
                message: ex.message
            });
        }
    }
}