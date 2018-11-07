'use strict'

const mongoose = require('mongoose')
const bCrypt = require('bcrypt')
const SaltRounds = 11

const Schema = mongoose.Schema

const UserSchem = new Schema({
  firstName: {
    type: String,
    required: [true, 'is required'],
    minlength: [1, 'is required']
  },
  lastName: {
    type: String,
    required: [true, 'is required'],
    minlength: [1, 'is required']
  },
  emailAddress: {
    type: String,
    required: [true, 'is required'],
    minlength: [1, 'is required']
  },
  password: {
    type: String,
    required: [true, 'required'],
    minlength: [6, 'is required']
  }
})

const CoursesSchem = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'is required'],
    minlength: [1, 'is required']
  },
  description: {
    type: String,
    required: [true, 'is required'],
    minlength: [1, 'is required']
  },
  estimatedTime: String,
  materialsNeeded: String
})

UserSchem.pre('save', function (next) {
  var user = this;
  bCrypt.genSalt(SaltRounds, function (err, salt) {
    if (err) return next(err);
    bCrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});
const User = mongoose.model('Users', UserSchem);
const Course = mongoose.model('courses', CoursesSchem);

module.exports.User = User
module.exports.Course = Course
