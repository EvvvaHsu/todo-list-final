const express = require("express")
const router = express.Router()
const passport = require('passport')


////授權請求按鈕
router.get('/facebook', passport.authenticate('facebook', {
    scope: ['email', 'public_profile']
}))

////Facebook呼叫路由
router.get('/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: 'users/login'
}))

module.exports = router