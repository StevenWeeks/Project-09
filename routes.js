'use strict';

var express = require('express')
var router = express.Router()
var UserCourse = require('./schema/schemas').UserCourse

router.param('uID', function (req, res, next, id) {
  UserCourse.findById(id, function(err, doc) {
    if(err) return next(err)
    if (!doc) {
      err = new Error('Not Found')
      err.status = 404
      return next(err)
    }
    req.user = doc
    return next()
  })
})

router.param('cID', function (req, res, next, id) {
  req.courses = req.User.Courses.id(id)
  if (!req.Courses) {
    err = new Error('Not Found')
    err.status = 404
    return next(err)
  }
  next()
})

// GET /api/users 200 - Returns the currently authenticated user
router.get('/users', function (req, res, next) {
  UserCourse.find({})
})

// POST /api/users 201 - Creates a user, sets the Location header to '/', and returns no content
router.post('/users', function (req, res, next) {

})
// GET /api/courses 200 - Returns a list of courses (including the user that owns each course)
router.get('/courses', function (req, res, next) {

})
// GET /api/courses/:id 200 - Returns a the course (including the user that owns the course) for the provided course ID
router.get('/courses/:cID', function (req, res, next) {

})
// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses', function (req, res, next) {

})
// PUT /api/courses/:id 204 - Updates a course and returns no content
router.put('/courses/:cID', function (req, res) {
  req.courses.update(req.body)
})
// DELETE /api/courses/:id 204 - Deletes a course and returns no content
router.delete('/courses/:cID', function (req, res) {
  req.courses.remove()

})
