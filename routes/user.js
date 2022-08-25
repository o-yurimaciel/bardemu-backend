const express = require('express')
const router = express.Router()
const { userModel } = require('../models')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/email');
const randomString = require('../utils/randomString');
const ObjectId = require('mongoose').Types.ObjectId;
const verifyRole = require('../middleware/role')

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body

    if(!(email && password && firstName && lastName && phone)) {
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
    const _id = new mongoose.Types.ObjectId()

    const user = userModel.create({
      _id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: firstName.concat(" ").concat(lastName).trim(),
      email: email.toLowerCase().trim(),
      password: encryptPassword,
      phone: phone.trim()
    })

    const token = jwt.sign(
      { 
        user_id: user._id,
        email 
      },
      process.env.TOKEN_KEY,
      { 
        expiresIn: '7d'
      }
    )
    sendEmail({
      to: email,
      subject: 'BarDeMu Lanches - Seja bem vindo(a)!',
      text: `Olá, ${firstName}!\nFicamos muito felizes pelo seu cadastro no nosso site.\nComece cadastrando seus endereços na sessão de "Minha Conta" e aproveite para pedir o melhor lanche da Zona Sul de Porto Alegre.\n\nNos siga no instagram -> www.instagram.com/bardemulanches`
    })
    res.status(201).json({
      _id,
      email,
      token
    })
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
        message: "E-mail e senha são obrigatórios"
      })
    }

    const user = await userModel.findOne({ email: email.trim() })

    if(user && (await bcrypt.compare(password, user.password.trim()))) {
      const token = jwt.sign(
        { 
          user_id: user._id,
          email 
        },
        process.env.TOKEN_KEY,
        { 
          expiresIn: '7d'
        }
      )
      
      user.passwordRecoveryCode = undefined
      user.password = undefined
      user.token = token
  
      return res.status(200).json(user)
    }

    res.status(400).send({
      message: 'E-mail ou senha incorretos'
    })
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.get('/users', auth, verifyRole, async (req, res) => {
  try {
    const users = await userModel.find()
    if(users) {
      res.status(200).json(users)
    } else {
      res.status(404).json({
        message: 'Nenhum cliente foi encontrado'
      })
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

router.get('/user', auth, async (req, res) => {
  try {
    const { _id } = req.query
    
    if(_id) {
      const user = await userModel.findOne({ _id: new ObjectId(_id) })
  
      if(user) {
        user.password = undefined
        res.status(200).json(user)
      } else {
        res.status(404).json({
          message: 'Usuário não encontrado'
        })
      }
    } else {
      res.status(400).json({
        message: "Erro de validação"
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.post('/user/address', auth, async (req, res) => {
  try {
    const { _id, address } = req.body
  
    if(_id && address) {
      address._id = new mongoose.Types.ObjectId()
  
      const result = await userModel.findOneAndUpdate({
        _id
      }, {
        $push: {
          address
        }
      }, {
        new: true
      })
  
      if(result) {
        res.status(200).json(result)
      } else {
        res.status(400).json({
          message: "Usuário não encontrado"
        })
      }
    } else {
      res.status(400).json({
        message: "Erro de validação"
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.delete('/user/address', auth, async (req, res) => {
  try {
    const { _id, addressId } = req.body
    if(_id && addressId) {
      let user = await userModel.findOne({ _id })
      if(user) {
        const index = await user.address.findIndex((addr) => addr._id === new ObjectId(addressId))
  
        if(index) {
          user.address.splice(index, 1)
          const result = await userModel.findOneAndUpdate({
            _id
          }, {
            address: user.address
          }, {
            new: true
          })
          res.status(200).json(result)
        } else {
          res.status(404).json({
            message: "ID de endereço não encontrado"
          })
        }
      } else {
        res.status(404).json({
          message: "Usuário não encontrado"
        })
      }
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.put('/user/phone', auth, async (req, res) => {
  try {
    const { _id, phone } = req.body
  
    if(_id && phone) {
      const user = await userModel.findOne({ _id })

      if(user) {
        if(user.phone !== phone.trim()) {
          const result = await userModel.findOneAndUpdate({
            _id
          }, {
            phone: phone.trim()
          }, {
            new: true
          })
          res.status(200).json(result)
        } else {
          res.status(409).json({
            message: "Celular já cadastrado"
          })
        }
      } else {
        res.status(400).json({
          message: "Usuário não encontrado"
        })
      }
    } else {
      res.status(400).json({
        message: "Erro de validação"
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.post('/user/password/code', async (req, res) => {
  try {
    const { email } = req.body
    const recoveryCode = randomString(6)

    const user = await userModel.findOneAndUpdate({
      email
    }, {
      passwordRecoveryCode: recoveryCode
    })

    if(user) {
      sendEmail({
        to: email,
        subject: 'BarDeMu Lanches - Código de redefinição de senha',
        text: `Olá, ${user.fullName}!\nO código de recuperação de senha é:\n\n${recoveryCode}\n\nInsira o código no site para prosseguir com a redefinição.`
      })
      res.status(200).json({
        email: user.email
      })
    } else {
      res.status(404).json({
        message: 'E-mail não encontrado'
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})

router.put('/user/password/code', async (req, res) => {
  try {
    const { email, code, password } = req.body
  
    const newPassword = await bcrypt.hash(password, 10)

    const user = await userModel.findOneAndUpdate({
      email,
      passwordRecoveryCode: code
    }, {
      password: newPassword
    })
  
    if(user) {
      res.status(200).json({
        email,
        code
      })
    } else {
      res.status(404).json({
        message: 'Código de verificação inválido'
      })
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

module.exports = router