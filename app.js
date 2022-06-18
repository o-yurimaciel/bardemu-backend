const express = require('express')
const app = express()
const port = process.env.PORT || 5050

app.listen(() => {
  console.log('listening on ', port)
})

app.get('/', (req, res) => {
  res.json({
    ok: true
  })
})