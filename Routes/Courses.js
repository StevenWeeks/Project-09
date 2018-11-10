'use strict'

const express = require('express')
const router = express.Router()
const auth = require('basic-auth')
const bcrypt = require('bcrypt')
const Course = require('../models/schemas').Course
const User = require('../models/schemas').User

router.param('cID', function (req, res, next, id) {
  Course.findById(id, function (err, doc) {
    if (err) {
      return next(err)
    }
    if (!doc) {
      const err = new Error('Not Found')
      err.status = 404
      return next(err)
    }
    req.course = doc
    return next()
  })
})

// a user authenticator for when someone is adding/modifying/deleting a course
// looks for email that's provided by the user, then compares the password given to the one
// stored for that email.  errors created for wrong password or wrong user.
router.use((req, res, next) => {
  let currentUser = auth(req)
  if (currentUser) {
    User.findOne({ emailAddress: currentUser.name })
      .exec(function (err, user) {
        if (user) {
          bcrypt.compare(currentUser.pass, user.password, function (err, res) {
            if (res) {
              req.user = user
              next()
            } else  {
              const error = new Error('Invalid Password')
              error.status = 400
              next(error)
            }
          })
        } else  {
          const error = new Error('Invalid login email')
          error.status = 401
          next(error)
        }
      })
  } else {
    const error = new Error('Not authorized user')
    error.status = 400
    next(error)
  }

  // POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
  // ...req.body so I can add the user to the info without it being an array inside the object array
  // validate that all the required infomation is passed in by the user
  // then save the course and return to '/' with a 201 status.
  // validation error if not complete info, and login error for creating courses.
  router.post('/', (req, res, next) => {
    if (req.user) {
      const newCourse = new Course({ ...req.body, user: req.user._id })
      newCourse.validate(function (err, req, res) {
        if (err && err.name === 'ValidationError') {
          err.status = 400
          return next(err)
        }
      })
      newCourse.save(function (err, newCourse) {
        if (err) return next(err)
        res.location('/')
        res.sendStatus(201)
      })
    } else {
      const error = new Error('Login to create new courses')
      error.status = 400
      next(error)
      console.log('oops')
    }
  })

  // GET /api/courses/:id 200 - Returns the course (including the user that owns the course) for the provided course ID
  router.get('/:cID', function (req, res, next) {
    Course.findById(req.params.cID)
      .populate('user', 'firstName lastName')
      .exec(function (err, course) {
        if (err) {
          return next(err)
        } else {
          res.json(course)
        }
      })
  })

  // GET /api/courses 200 - Returns a list of courses (including the user that owns each course)
  // made it show a title, description and the creator.
  router.get('/', function (req, res, next) {
    Course.find({})
      .populate('user', 'firstName lastName')
      .select({ 'title': 1, 'description': 1 })
      .exec(function (err, course) {
        if (err) {
          return next(err)
        } else {
          res.status(200)
          res.json(course)
        }
      })
  })
  // PUT /api/courses/:id 204 - Updates a course and returns no content
  router.put('/:cID', function (req, res, next) {
    if (req.body.user.toString() === req.user._id.toString()) {
      req.course.updateOne(req.body, { upsert: true, runValidators: true }, function (err, result) {
        if (err && err.name === 'ValidationError') {
          err.status = 400
          return next(err)
        } else if (err) {
          return next(err)
        } else {
          console.log('you changed it!')
          res.sendStatus(204)
        }
      })
    } else {
      const error = new Error('Only course creater may make changes')
      error.status = 403
      next(error)
    }
  })

  // DELETE /api/courses/:id 204 - Deletes a course and returns no content
  router.delete('/:cID', function (req, res, next) {
    if (req.course.user.toString() === req.user._id.toString()) {
      req.course.remove()
      console.log('Course has been removed.')
      return res.sendStatus(204)
    } else {
      const error = new Error('Only course creater may delete course')
      error.status = 400
      next(error)
    }
  })
})

module.exports = router
