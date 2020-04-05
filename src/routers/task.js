const express = require('express')
const Task = require("../models/task")
const auth = require("../middleware/auth")
const router = new express.Router()
const app = express()


//Create Resource Task
router.post('/tasks',auth,async (req,res)=>{

	const task = new Task({
		
		...req.body,
		Owner:req.user._id	
		
	})
	
	
	try {	
			
			await task.save()
			res.status(201).send(task)
			
	}
	
	catch (error){
		
		res.status(400).send(error.message)
		
	}
	

})

//Read Tasks 
router.get('/tasks/:id',auth,async (req,res)=>{

	const _id = req.params.id
	
	
		try{
			
			const task = await Task.findOne({_id,Owner:req.user._id})
			if(!task){
			
			return res.status(400).send("Task not found")
			
		}
		res.status(200).send(task)
		
		}
	catch(error){
		
	
		res.status(500).send("Please enter the valid Id")
		
	}
		

	
	
})

//Read task using async await
//Setting Pagination and Sorting
router.get('/tasks',auth,async (req,res)=>{
	
	
	
	try{

		const match = {}
		const sort = {}
		if(req.query.Completed){
			match.Completed = req.query.Completed === 'true'
			}
			
			if(req.query.sortBy){
			
			const parts = req.query.sortBy.split(':')
			sort[parts[0]] = parts[1]==='desc' ?-1:1 
			
			}
		await req.user.populate({
			
			path:'tasks',
			match:match,
			options:{
				
				limit:parseInt(req.query.limit),
				skip:parseInt(req.query.skip),
				sort:sort
			}
			
		}).execPopulate()
		res.status(200).send(req.user.tasks)
		
	}
	
	catch(error){
		console.log("Catch error")
		res.status(500).send(error.message)
		
	}
	
	
})
//Update resource 
router.patch('/tasks/:id',auth,async (req,res)=>{
	
	const _Id = req.params.id
	const updates = Object.keys(req.body)//Converts JSON object into simple object to access its properties
	const allowedUpdates = ['Description','Completed']
	const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
		if(!isValidOperation){
			
			return res.status(400).send("Error : Invalid Updates!!")
			
		}
		
	try{
		const task = await Task.findOne({_id:req.params.id,Owner:req.user._id})
		if(!task){
			
			return res.status(400).send("Task not found")
			
		}
		updates.forEach((update)=>task[update] = req.body[update])//Dynamic way of updating a doc
		await task.save()
		res.status(200).send("Record with Id "+ _Id+ " is updated successfully ")
		
	}
	
	catch(error){
		
		if(error.message){
			
			res.status(400).send(error.message)
			
		}
		
		
	}
	
	
})
//Delete Resource
router.delete('/tasks/:id',auth,async (req,res)=>{
	
	const _id = req.params.id
	
	try{

		const task = await Task.findOneAndDelete({_id:req.params.id,Owner:req.user._id})
		if(!task){
			
			return res.status(400).send("Task not found")
			
		}
		
		res.status(200).send("Requested Id " + _id + " is removed successfully from the records")
	}
	
	catch(error){
		
		if(error.message){
		res.status(500).send("Requested Id not found")
		}
		
	}
	
	
})

module.exports = router