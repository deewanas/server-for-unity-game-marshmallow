const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const userRoutes = require('./routes/route')
const bodyParser = require('body-parser')

const PORT = process.env.PORT || 3000
const url = process.env.MONGO_DB || 'mongodb+srv://nastya:123456nastya@cluster0.y3xuf.mongodb.net/game_db'

const app = express()

app.use(bodyParser.json({limit: '1mb'}))
app.use(bodyParser.urlencoded({limit: '1mb', extended: true}))
app.use('/static', express.static('public'))

app.use(userRoutes)

async function start() {
  try {
    await mongoose.connect(
        url,
      {
        useNewUrlParser: true,
        useFindAndModify: false
      }
    )
    app.listen(PORT, () => {
      console.log('Server has been started...')
    })
  } catch (e) {
    console.log(e)
  }
}

start() 