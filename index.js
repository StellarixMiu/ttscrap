const express = require('express')
require('dotenv').config()

const tiktokRoutes = require('./routes/tiktok')

const app = express()

app.set("PORT", process.env.PORT || 5000)

app.get('/', (req,res) => {
  res.send('SERVER READY')
  console.log('GET')
})

app.use('/tiktok', tiktokRoutes)

app.listen(app.get("PORT"), () => 
  console.log("app running on PORT", app.get("PORT"))
)