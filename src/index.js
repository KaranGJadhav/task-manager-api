const express = require('express')
const User = require("./models/user")
const Task = require("./models/task")
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('./db/mongoose')
const multer = require('multer') 
const app = express()
const port = process.env.PORT
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
	
//Listen to the port
	app.listen(port,()=>{
		
		console.log("Connected to port " + port)
		
	})

