let Cookies = require('../model/cookie')
let accChecker = require('../model/accCheckers')
let Account = require('../model/account')
const puppeteer = require('puppeteer');
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
            role: 2
        }
        let checkUser = await Account.findOne(filterUser)
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
            console.log("Hết phiên");
        }
    }
}