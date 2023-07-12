const express = require("express")
const router = express.Router()
const Todo = require("../../models/todo")

router.get("/", (req, res) => {
    const userId = req.user._id
    // 拿到所有的Todo資料
    Todo.find({ userId })
        .lean()
        .sort({name : "asc"}) //排序, 反序: desc
        // .sort({ _id: "asc" })
        .then(todos => res.render("index", { todos: todos }))
        .catch(err => console.log("err!"))
})

module.exports = router