const mongoose = require("mongoose")

// const MONGODB_URI = process.env.MONGODB_URI 

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

const db = mongoose.connection

db.on("errer", () => {
    console.log("mongodb error!")
})

db.once("open", () => {
    console.log("mongodb connected!")
})

module.exports = db