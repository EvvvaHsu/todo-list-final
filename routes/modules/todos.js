const express = require("express")
const router = express.Router()
const Todo = require("../../models/todo")

//新增
router.get("/new", (req, res) => {
    return res.render("new")
})

router.post("/", (req, res) => {
    const userId = req.user._id
    const name = req.body.name

    const todo = new Todo({ name, userId }) //在伺服器端的資料, 尚未寫回資料庫

    return todo.save().then(() => res.redirect("/"))
        .catch(err => console.log("err!"))
})

//詳細資訊
router.get('/:id', (req, res) => {
    const userId = req.user._id
    const _id = req.params.id  //這邊的.id對應到params的:id
    // console.log(req.params)
    return Todo.findOne({ _id, userId })  //先找出_id一樣的todo, 確保這筆todo屬於目前登入的user
    // return Todo.findById(id)
        .lean()
        .then((todo) => res.render('detail', { todo }))
        .catch(error => console.log(error))
})

//修改
router.get('/:id/edit', (req, res) => {
    const userId = req.user._id
    const _id = req.params.id  
    return Todo.findOne({ _id, userId })
    // return Todo.findById(id)
        .lean()
        .then((todo) => res.render('edit', { todo }))
        .catch(error => console.log(error))
})

router.put('/:id', (req, res) => {
    const userId = req.user._id
    // 將post換成put, 修改路由
    const _id = req.params.id  

    // const name = req.body.name
    // const isDone = req.body.isDone
    // 解構賦值
    const {name, isDone} = req.body

    return Todo.findOne({ _id, userId })  //The conditions are cast to their respective "SchemaTypes" before the command is sent.
    // return Todo.findById(id)
        .then(todo => {
            todo.name = name

            // if (isDone ==="on"){
            //     todo.isDone =true
            // } else {
            //     todo.isDone =false
            // }
            // 將if簡化:
            todo.isDone = isDone ==="on"

            return todo.save() //不能用lean, 否則就會變成單純的資料, 就沒有save的function可以用了
        })
        .then(() => res.redirect(`/todos/${_id}`)) //完成修改之後丟回detail頁面
        .catch(error => console.log(error))
})

//刪除
router.delete('/:id', (req, res) => {
    const userId = req.user._id
    const _id = req.params.id  
    //將Post修改為delete, 修改路由
    return Todo.findOne({ _id, userId })
    // return Todo.findById(id)
      .then(todo => todo.remove())
      .then(() => res.redirect('/'))
      .catch(error => console.log(error))
  })

module.exports = router