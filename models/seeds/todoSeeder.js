const bcrypt = require('bcryptjs')


///////由於我們把 MongoDB 連線搬進了 .env 裡，需要在一開始載入 .env 的檔案
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const Todo = require('../todo')
const User = require('../user')
const db = require('../../config/mongoose')

//可以用json檔建立user, 然後用迴圈取出
const SEED_USER = {
  name: 'root',
  email: 'root@example.com',
  password: '12345678'
}

db.once('open', () => {
  ////////建立user
  bcrypt
    .genSalt(10)
    .then(salt => bcrypt.hash(SEED_USER.password, salt))
    //.then(salt => bcrypt.hash('password', salt))
    .then(hash => User.create({
      name: SEED_USER.name,
      email: SEED_USER.email,
      password: hash
    }))
    ////////回傳user
    .then(user => {
      const userId = user._id
      return Promise.all(Array.from(
        { length: 10 },                //['','','', ...10個].map(() => ...)
        (value, i) => Todo.create({ name: `name-${i}`, userId })))
        ////(_, i) => Todo.create({ name: `name-${i}`, userId })))  value用不到, 用底線取代藏起來

    })
    .then(() => {
      console.log('done.')
      process.exit()   //////「關閉這段 Node 執行程序」，由於這段 seeder 程式只有在第一次初始化時才會用到，不像專案主程式一旦開始就執行運作，所以在 seeder 做好以後要把這個臨時的 Node.js 程序結束掉。類似把這個臨時的 Node.js 執行環境「關機」的概念。
    })
})