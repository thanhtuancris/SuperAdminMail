let Cookies = require('../model/cookie')
let accChecker = require('../model/accCheckers')
let Account = require('../model/account')
let Admin = require('../model/superadmin')
const puppeteer = require('puppeteer');
const Mail = require('../model/mails');
let request = require('request');
module.exports = {
    validateEmail: function (email) {
        if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
            return (true)
        }
        return (false)
    },
    getCookie: async function(token){
        let filterUser = {
            token: token,
            isdelete: false,
            status: true,
            role: 10
        }
        let checkUser = await Admin.findOne(filterUser)
        if(checkUser){
            let accountChecker = await accChecker.findOne({user: checkUser.username})
            if(accountChecker){
                let username = accountChecker.username
                let password = accountChecker.password
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
            console.log("Hết phiên | Không có quyền thực thi");
        }
    },
    autoCheckMail: async function(){
        let filter = {
            ischeck: false,
            isdelete: true
        }
        let rsMail = await Mail.find(filter)
        let arrMail = [];
        for(let i = 0; i < rsMail.length; i++){
            arrMail.push(rsMail[i].mail.trim())
        }
        let cookies = await Cookies.findOne({
            user: 'admin'
        });
        if(cookies){
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
                                if(y+1 == rsChecked.length){
                                    console.log("CHECK MAIL DONE");
                                }
                            }, 100*y)
                        }
                    } catch (rex) {
                        console.log(rex);
                    }
                }
            });
        }else{
            console.log("Chưa có tài khoản check mail!");
        }
        
        
    }
    
}