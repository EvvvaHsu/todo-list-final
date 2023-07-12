const express = require("express")
const session = require('express-session')
const exphbs = require("express-handlebars")
const bodyParser = require('body-parser')
const methodOverride = require("method-override")
const flash = require('connect-flash')

// 加入這段 code, 僅在非正式環境時, 使用 dotenv
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

// console.log(process.env)

const routes = require("./routes") //預設會去找index.js

const usePassport = require('./config/passport')  //載入一包 Passport 設定檔

require("./config/mongoose")
const app = express()
const PORT = process.env.PORT

app.engine("hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }))
app.set("view engine", "hbs")

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, //true的話, 每次更新都會帶入新的
    saveUninitialized: true //true會強制把全新的session塞入
}))

app.use(bodyParser.urlencoded({ extended: true }))

app.use(methodOverride("_method"))

usePassport(app)

app.use(flash())

//在 usePassport(app) 之後、app.use(routes) 之前，加入一組 middleware：
//這組 middleware 會作用於所有的路由
app.use((req, res, next) => {
    //req.user 是在反序列化的時候，取出的 user 資訊，之後會放在 req.user 裡以供後續使用
    console.log(req.user)
    //res.locals.isAuthenticated：把 req.isAuthenticated() 回傳的布林值，交接給 res 使用
    res.locals.isAuthenticated = req.isAuthenticated()
    //res.locals.user：把使用者資料交接給 res 使用，要交接給 res，我們才能在前端樣板裡使用這些資訊。
    res.locals.user = req.user
    ///以下這兩行是給flash使用
    res.locals.success_msg = req.flash('success_msg')

    res.locals.warning_msg = req.flash('warning_msg')
    next()
})

app.use(routes)



app.listen(PORT, () => {
    console.log(`App is running on http://localhost:${PORT}`)
})