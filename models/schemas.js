'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const saltRounds = 10
const bcrypt = require('bcrypt')
// Users Schema
const UserSchem = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name required']
  },
  lastName: {
    type: String,
    required: [true, 'Last name required']
  },
  emailAddress: {
    type: String,
    required: [true, 'Email address required']
  },
  password: {
    type: String,
    required: [true, 'Password required']
  }
})

// Courses Schema
const CoursesSchem = new Schema({
  user: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  estimatedTime: String,
  materialsNeeded: String
})
// putting them hooks to good use to hash passwords of users
UserSchem.pre('save', function (next) {
  var user = this
  bcrypt.genSalt(saltRounds, function (err, salt) {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err)
      user.password = hash
      next()
    })
  })
})

const User = mongoose.model('User', UserSchem)
const Course = mongoose.model('Courses', CoursesSchem)

module.exports.User = User
module.exports.Course = Course
