//Sending Email through nodejs using sendgrid
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeMail = (email,name)=>{
	
	
	sgMail.send({
		
				to:'jadhavkaran748@gmail.com',
				from:'jadhavkaran748@gmail.com',
				subject:'This is my first creation1',
				text:`Welcome to the app!! ${name}, Hope to see you using all our services`
	})
	
	
	
	
}

const sendCancellationMail = (email,name)=>{
	
	
	sgMail.send({
		
				to:'jadhavkaran748@gmail.com',
				from:'jadhavkaran748@gmail.com',
				subject:'Account Cancellation',
				text:`Dear ${name} your account is cancelled, let us know the reason for cancellation what can we do better to keep you intact with our services`
				
	})
	
	
	
	
}

module.exports = {
	
	sendWelcomeMail,
	sendCancellationMail
}