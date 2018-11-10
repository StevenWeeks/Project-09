'use strict'

const express = require('express')
const router = express.Router()
const auth = require('basic-auth')
const bcrypt = require('bcrypt')
const User = require('../schema/schemas').User

// a function to validate emails, regex gotten from project resources.
function emailVali (email) {
  const check = /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return check.test(email)
}

// POST /api/users 201 - Creates a user, sets the Location header to '/', and returns no content
// first test to see if the req body has a valid email, if not error.
// next find if there's already that email in the database, if not it's valid to make a new userRoutes
// then validate the user input, schema has validators built in, if again valid it'll save to db.
// then returns to header with a 201 status.
router.post('/', function (req, res, next) {
  if (emailVali(req.body.emailAddress)) {
    User.find({ emailAddress: req.body.emailAddress }, function (err, users) {
      if (err) { console.log('wooops') }
      if (users.length !== 0) {
        const error = new Error('Account email already in use.')
        error.status = 400
        next(error)
      } else {
        let userInfo = new User(req.body)
        userInfo.validate(function (err, req, res) {
          if (err && err.name === 'ValidationError') {
            console.log('ewwww')
            err.status = 400
            return next(err)
          }
        })
        userInfo.save(function (err, user) {
          if (err) {
            return next()
          } else {
            res.location('/')
            res.sendStatus(201)
          }
        })
      }
    })
  } else {
    const error = new Error('Please enter a valid email')
    error.status = 400
    next(error)
  }
})

// the beastly code used to validate users, it sets the current user from the request
// it searches for an email in the database, then hashes and compares the password provided against
// the stored hashed password.
router.use((req, res, next) => {
  let currentUser = auth(req)
  console.log(auth(req), '1')
  if (currentUser) {
    User.findOne({ emailAddress: currentUser.name })
      .exec(function (err, user) {
        if (user) {
          bcrypt.compare(currentUser.pass, user.password, function (err, res) {
            if (res) {
              req.user = user
              next()
            } else {
              const error = new Error('Invalid Password')
              error.status = 400
              next(error)
            }
          })
        } else {
          const error = new Error('Not a valid user')
          error.status = 400
          next(error)
        }
      })
  } else {
    const error = new Error('Please login')
    error.status = 400
    next(error)
  }
})

router.get('/', function (req, res, next) {
  User.find({})
    .exec(function (err, user) {
      if (err) {
        console.log('oh no')
        next(err)
      } else {
        res.json(req.user)
      }
    })
})
module.exports = router
