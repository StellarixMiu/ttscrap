require('dotenv').config()
const express = require('express')
const cors = require('cors')
const tiktokRoutes = require('./routes/tiktok')

const app = express()
app.use(cors())

app.set("PORT", process.env.PORT || 5000)

app.get('/', (req,res) => {
  res.send('SERVER READY')
  console.log('GET')
})

app.use('/tiktok', tiktokRoutes)

app.listen(app.get("PORT"), () => 
  console.log("app running on http://localhost:"+ app.get("PORT"))
)