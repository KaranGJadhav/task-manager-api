const express = require('express')
const User = require("../models/user")
const auth = require('../middleware/auth')
const router = new express.Router()
const jwt = require('jsonwebtoken')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeMail,sendCancellationMail}=require('../emails/account')
const app = express()

//Create users 
router.post('/users', async (req,res)=>{
	
const user = new User(req.body)
	
	try {	
			
			await user.save()
			sendWelcomeMail(user.email,user.name)
			const token = await user.generateAuthToken()
			res.send({user,token})
			
			
	}
	
	catch (error){
		
		res.status(400).send(error.message)
		
	}
})

//Creating Logging credentials
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateAuthToken()
		
	res.send({user,token})
    } catch (e) {
        res.status(400).send(e)
    }
})

//User Logout
router.post('/users/logout',auth,async(req,res)=>{
	
	try{
		
		req.user.tokens = req.user.tokens.filter((token)=>{

			return token.token !== req.token  
			
		})
		
		await req.user.save() 
		res.send()
		
	}
	
	catch(e){
		
		res.status(500).send(e)
	}
	
	
	
})

//Logout all users
router.post('/users/logoutAll',auth,async(req,res)=>{
	
	try{
		//console.log('Entered logoutall')
		req.user.tokens = []
		await req.user.save()
		res.send()		

		
	}
	
	catch(e){
			
		res.status(500).send(e)
	}
	
	
	
})


//Read authorised users only
router.get('/users/me',auth,async (req,res)=>{
	
	res.send(req.user)
	
})

//Update Users
router.patch('/users/me',auth,async (req,res)=>{
	
	//Validations to check valid fields are updated
	const updates = Object.keys(req.body)
	const allowedUpdates = ['name','password','email','age']
	const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
		if(!isValidOperation){
			
			return res.status(400).send("Error : Invalid Updates!!")
			
		}
		
	try{
		
		updates.forEach((update)=>req.user[update] = req.body[update])
		await req.user.save()	
		res.status(200).send(req.user)
	}
	
	catch(error){
		
		if(error.message){
			res.status(400).send(error.message)
		}
	}
})

//Deleting resource
router.delete('/users/me',auth,async (req,res)=>{
	

	
	try{
		
		await req.user.remove()
		sendCancellationMail(req.user.email,req.user.name)
		res.send(req.user)
	}
	
	catch(error){
		
		if(error.message){
		res.status(500).send("Requested Id not found")
		}
		
	}
	
	
})
//Uploading Images/PDF's/doc's
const upload = multer({
	
	limits:{
		
		fileSize:1000000
		
	},
	fileFilter(req,file,cb){
		
		if(!file.originalname.endsWith('png') && (!file.originalname.match(/\.jp(g|eg)$/))){
			
			return cb(new Error('File Type is not supported, please upload png file or jpg file'))
		}
		
		cb(undefined,true)
		
	}
	
})
//Uploading Images/PDF's/doc's for the resources
router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
	const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
	//req.user.avatar = req.file.buffer
	req.user.avatar = buffer
	await req.user.save()
	res.send()
	
	
},(error,req,res,next)=>{
	
	res.status(400).send({error:error.message})
	
})
//Deleting Images/PDF files/Doc's for a resource
router.delete('/users/me/avatar',auth,async (req,res)=>{
	
	req.user.avatar = undefined
	await req.user.save()
	res.send()
	
	
})
//Reading Images/PDF files/Doc's for a resource
router.get('/users/:id/avatar',auth,async (req,res)=>{
	try{
	
	const user = await User.findById(req.params.id)
	
	if(!user || !user.avatar){
		return new Error()
		
	}
	
	res.set('Content-Type','image/jpg')
	res.send("Successfully read the image")
	}
	catch(e){
		
		res.status(400).send(e)
	}
	
})

module.exports = router