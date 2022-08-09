const express = require('express')
const router = express.Router()
const { userModel } = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body

    if(!(email && password && firstName && lastName)) {
      return res.status(400).json({
        message: 'Erro de validação'
      })
    }

    const oldUser = await userModel.findOne({ email })

    if(oldUser) {
      return res.status(409).json({
        message: 'Usuário existente'
      })
    }

    encryptPassword = await bcrypt.hash(password, 10)

    const user = userModel.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: encryptPassword
    })

    const token = jwt.sign(
      { 
        user_id: user._id,
        email 
      },
      process.env.TOKEN_KEY,
      { 
        expiresIn: '1d'
      }
    )

    user.token = token

    res.status(201).json(user)
  } catch (error) {
    console.log(error)
    return res.status(500).json(error)
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if(!(email && password)) {
      return res.status(400).json({
        message: "Erro de validação"
      })
    }

    const user = await userModel.findOne({ email })

    if(user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { 
          user_id: user._id,
          email 
        },
        process.env.TOKEN_KEY,
        { 
          expiresIn: '1d'
        }
      )
  
      user.token = token
  
      return res.status(200).json(user)
    }

    res.status(400).send({
      message: 'Credenciais inválidas'
    })
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

module.exports = router