const express = require('express')
const app = express()
const port = process.env.PORT || 5050

app.get('/', (req, res) => {
  res.json({
    ok: true
  })
})

app.listen(port, () => {
  console.log('listening on ', port)
})
