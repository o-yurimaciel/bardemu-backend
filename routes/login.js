const express = require('express')
const router = express.Router()
const { loginModel } = require('../models')

router.post('/login', async (req, res) => {
  const { login, password } = req.body

  if(!login || !password) {
    res.status(400).json({
      message: 'Validation failure'
    })
  }

  const user = await loginModel.findOne({
    login,
    password
  })

  if(user) {
    res.status(200).json({
      login: user.login
    })
  } else {
    res.status(404).json({
      message: 'Not Found'
    })
  }
})

module.exports = router