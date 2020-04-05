//Middleware Code
const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
	
	name:{
		type:String,
		trim:true,
		required:true
	},
	
	email:{
	
		type:String,
		unique:true,
		required:true,
		trim:true,
		lowercase:true,
		validate(value){
			
			if(!validator.isEmail(value)){
				
				throw new Error('Email is not valid')
				
			}
		}
		
	},
	
	age:{
		type:Number,
		default:0,
		validate(value){
			
			if(value<0){
				
				throw new Error('Age should be a positive number')
				
			}
			
		}
	},
	
	password:{
		
		type:String,
		required:true,
		trim:true,
		validate(value){
			
			if(value.length < 8){
					
			throw new Error('Password should have more then 8 characters')
				
			}
			
			if(value.toLowerCase().includes("password")){
					
					throw new Error('Password should be alphanumeric')
					
			}
			
		}
		
		
	},
	tokens:[{
		
		token:{
			type:String,
			required:true
			}
	
	}],
	
	avatar:{
		
		type:Buffer
		
	}
 },
 
 {
	 timestamps:true
	 
 })


//Creating a join for fetching data from two different models(same as the joins in db based on one primary key)...
userSchema.virtual('tasks',{
	
	ref:'Task',
	localField:'_id',
	foreignField:'Owner'
	
	
	
})
//JWT Generation
userSchema.methods.generateAuthToken = async function(){
	
	const user = this	
	const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET,{expiresIn:'2 weeks'})
	user.tokens = user.tokens.concat({token:token})
	await user.save()
	return token
	
	
}

//Showing only the public data to the client
userSchema.methods.toJSON = function(){
	
	const user = this
	
	const userObject = user.toObject()
	delete  userObject.password
	delete userObject.tokens
	delete userObject.avatar
	return userObject
	
}


//Logging users
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email:email })	
    if(!user) {
        throw new Error('Unable to login')
    }
    const isMatch = await bcryptjs.compare(password,user.password)
    if(!isMatch) {
        throw new Error('Unable to login')
    }
	return user
}


//Validation and encryption of user password
userSchema.pre('save',async function(next){
	
	const user = this
	
	if(user.isModified("password")){
		
		 user.password = await bcryptjs.hash(user.password,8)
		
	}
	
	
	next()
	
})

//Remove all the tasks once the user is removed
userSchema.pre('remove',async function(next){
	
	const user = this
	await Task.deleteMany({Owner:user._id})
	next()
	
})
const User = mongoose.model('User',userSchema)

module.exports = User
