const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const FacebookStrategy = require('passport-facebook').Strategy

const User = require('../models/user')

//export一個function, 接受的參數是app
module.exports = app => {
    //把passport初始化, 把session交給app使用
    app.use(passport.initialize());
    app.use(passport.session());

    //用email做驗證的辨別、用來做驗證的function
    passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        User.findOne({ email })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: "The email hasn't been registered!" })
                }

                return bcrypt.compare(password, user.password)   ////password在經過bcrypt處理後, 是不是等於user.passworod(雜湊後結果)
                    .then(isMatch => {
                        if (!isMatch) {  ////因為下面那行是false的狀態, 所以要加!
                            return done(null, false, { message: "Email or password is incorrect." })
                        }
                        return done(null, user)
                    })
                // if (user.password !== password) {
                //     return done(null, false, { message: "Email or password is incorrect." })
                // }
                // return done(null, user)
            })
            .catch(err => done(err, false))
    }))


    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK,
        profileFields: ['email', 'displayName']
    },
        (accessToken, refreshToken, profile, done) => {
            // console.log(profile)
            const { name, email } = profile._json

            User.findOne({ email })
                .then(user => {
                    if (user) return done(null, user)

                    const randomPassword = Math.random().toString(36).slice(-8)   ////運用進位轉換將 0.3767988078359976 變成英數參雜的亂碼。這裡選用 36 進位，是因為 36 是 10 個數字 (0, 1, 2, ... 9) 加上 26 個英文字母 (a, b, c, ... , x, y, z) 的總數，在 36 進位裡剛好可以取得所有的英數字母。此時的回傳結果可能是 '0.dkbxb14fqq4'
                    //////截切字串的最後一段，得到八個字母，例如 'xb14fqq4'

                    bcrypt.genSalt(10)
                        .then(salt => bcrypt.hash(randomPassword, salt))
                        .then(hash => User.create({
                            name,
                            email,
                            password: hash
                        }))
                        .then(user => done(null, user))
                        .catch(err => done(err, false))
                })
            // console.log(profile)

            // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
            //   return cb(err, user);
            // });
        }
    ));



    passport.serializeUser((user, done) => {
        // console.log(user)
        done(null, user.id)  // 也可以打成_id
    })
    passport.deserializeUser((id, done) => {
        User.findById(id)
            .lean() //從資料庫拿出來的物件，很可能會傳進前端樣板，因此遵從 Handlebars 的規格，先用 .lean() 把資料庫物件轉換成 JavaScript 原生物件。
            .then(user => done(null, user))
            .catch(err => done(err, null))
    })
}
