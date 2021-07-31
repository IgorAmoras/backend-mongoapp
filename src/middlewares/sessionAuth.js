const User = require('../models/User')
const permissionAcess = async (req, res, next) => {
    const { userId } = req
    const { permissions, email } = await User.findById(userId)
    
    req.permission = permissions;
    req.email = email;
    
    next()
}
const validateUser = async (req, res, next) => {
    const { email } = req.params
    try{
        const user = await User.findOne({email})
        req.user = user
        next()
    }catch(error){
        return res.status(400).send({error})
    }
}
module.exports = { permissionAcess, validateUser }