const mongoose = require('mongoose')
const validator = require('validator')
const taskSchema = new mongoose.Schema({
	
	Description:{
		type:String,
		required:true,
		trim:true
	},
	
	Completed:{
		type:Boolean,
		default:false
	},
	
	Owner:{
		type:mongoose.Schema.Types.ObjectId,
		required:true,
		ref:'User'		
		
	}
	
},{
	
	timestamps:true
	
})
taskSchema.pre('save',async function(next){
	
	const task = this
	next()
	
})

const Task = mongoose.model('Task',taskSchema)

module.exports = Task 