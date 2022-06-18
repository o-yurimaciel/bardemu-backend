const express = require('express')
const app = express()
const port = process.env.PORT || 5050

const products = [
  { name: "Hamburguer de Calabresa", price: 25.00 },
  { name: "Hamburguer de Carne", price: 22.00 }
]

app.get('/', (req, res) => {
  res.json({
    message: "Olá, BarDeMu!"
  })
})

app.get('/products', (req, res) => {
  res.json(
    products
  )
})

app.listen(port, () => {
  console.log('listening on ', port)
})
