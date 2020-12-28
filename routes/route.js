const { Router } = require('express')
const mongoose = require('mongoose')
const User = require('../models/User')
const router = require('express').Router()
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken')
const secret = "shhhhh it's a secret "
  
//create user
router.post('/register', async (req, res) =>{
    const {username, password} = req.body
      await User.findOne({username})
          .exec() 
          .then((user) => {
              if(user) {
                  return res.status(401).json({ message: 'User already registered!'})
              }             
                bcrypt.hash(password, saltRounds, (err, hash) => {
                    if (err) {
                        return res.status(401).json({ message: err.message})
                    } 
                    user = new User({
                        username: username,
                        password: hash,
                        highscore: 0
                    }) 
                
                user.save( (err, newUser) => {
                    if (err) {
                        return res.status(401).json({ message: err.message})
                    }       
                    return res.status(200).json({ message: 'ok'})
                })
            })
          })
          .catch(err => res.status(500).json({message: err.message}))  
})
 
//login
router.post('/login', async (req, res) => {
    const {username, password} = req.body;
      await User.findOne({username})
          .exec() 
          .then((user) => {
              if(!user) {
                  return res.status(401).json({ message: 'User does not exist!'})
              }
              bcrypt.compare(password, user.password, (err, result) => {
                if(result) {

                    const token = jwt.sign({ user }, secret, (err, token) => {
                        if (err) {
                            return res.status(401).json({ message: err.message})
                        }
                        
                        //user.token = user.token.split('').join('') 
                        user.token = token
                        user.save(function (err, user) {
                            if (err) {
                                return res.status(401).json({ message: err.message})
                            }  
                            return res.status(200).json({token})
                        }) 
                        
                        
                    })
                    
                } else {
                    return res.status(401).json({message: 'Invalid password!'})
                }
                if (err) {
                    return res.status(401).json({ message: err.message})
                }
              })
          })
          .catch(err => res.status(500).json({message: err.message}))    
  })

//highscore table
router.get('/highscores', async (req, res) => {
    const users = await User.find().exec().catch(err => res.status(500).json({message: err.message}))

    const names = []
    for(let i = 0; i < users.length; i++) {
        names.push(users[i].username)
    }
    JSON.stringify(names)

    const highscores = []
    for(let i = 0; i < users.length; i++) {
        highscores.push(users[i].highscore)
    }
    JSON.stringify(highscores)
    
    res.status(200).json({ names, highscores})
})

//update highscore
router.post('/update', async (req, res) => {
    const {highscore, token} = req.body;
    if(!token) { 
        return res.status(401).json({message: 'Token not provided!'})
    }
    await User.findOne({token})
        .exec() 
        .then((user) => {
            if(!user) {
                return res.status(401).json({ message: 'User does not register!'})
            }
              try { 
                const payload = jwt.verify(token, secret)
              } catch(e) {
                if(e instanceof jwt.JsonWebTokenError) {
                  return res.status(401).json({message: 'Invalid token!'})
                }
            }
            if(user.highscore < highscore) {
                user.highscore = highscore 
                user.save( (err, user) => {
                    if (err) {
                        return res.status(401).json({ message: err.message})
                    }  
                    return res.status(200).json({message: 'ok'})
                })
            }
            else {
                return res.status(200).json({message: 'ok'})
            }
        
    })
        .catch(err => res.status(500).json({message: err.message}))
})

//logout
router.post('/logout', async (req, res) => {
    const { token} = req.body;
    if(!token) { 
        return res.status(401).json({message: 'Token not provided!'})
    }
    await User.findOne({token})
        .exec() 
        .then((user) => {
            if(!user) {
                return res.status(401).json({ message: 'User does not register!'})
            }
              try { 
                const payload = jwt.verify(token, secret)
              } catch(e) {
                if(e instanceof jwt.JsonWebTokenError) {
                    return res.status(401).json({message: 'Invalid token!'})
                }
            }          
            user.token = "" 
            user.save(function (err, user) {
                if (err) {
                    return res.status(401).json({ message: err.message})
                }  
                return res.status(200).json({message: 'ok'});
            })          
        
    })
        .catch(err => res.status(500).json({message: err.message}))
})


module.exports = router