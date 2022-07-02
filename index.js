const express = require('express')
require('dotenv').config()

const tiktokRoutes = require('./routes/tiktok')

const PORT = process.env.PORT || 5000
const app = express()

app.get('/', (req,res) => {
  res.send('SERVER READY')
  console.log('GET')
})

app.use('/tiktok', tiktokRoutes)

app.listen(PORT, () => {console.log(`APP running on http://localhost:${PORT}/`)})