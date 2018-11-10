'use strict'

// load modules
const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const jsonParser = require('body-parser').json
const routes = require('./Routes/routes')
const userRoutes = require('./Routes/users')
const courseRoutes = require('./Routes/courses')

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true'

// create the Express app
const app = express()

// setup morgan which gives us http request logging
app.use(morgan('dev'))

// other
mongoose.connect('mongodb://localhost:27017/fsjstd-restapi', { useNewUrlParser: true })
mongoose.set('debug', true)
const db = mongoose.connection

db.on('error', function (err) {
  console.error('connection error', err)
})

db.once('open', function () {
  console.log('db connection successful')
})

app.use(jsonParser())

// TODO setup your api routes here
app.get('/', (req, res) => res.redirect('/api'))
app.use('/api', routes)
app.use('/api/users', userRoutes)
app.use('/api/courses', courseRoutes)

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found'
  })
})

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`)
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  })
})

// set our port
app.set('port', process.env.PORT || 5000)

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`)
})
