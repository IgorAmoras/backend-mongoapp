const mongoose = require("../database/index");
const Project = require('./Project')
const bcrypt = require("bcryptjs");
const { updateInitialLetter } = require('../middlewares/updateInitial')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  permissions: {
    type: String,
    require: true,
    default: 'User',
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
UserSchema.pre('findOneAndDelete', async function(next){
  try {
    Project.deleteMany({user: this._conditions._id}, function(err, res){
      if(err) throw Error(err)
      next()
    })
  } catch (error) {
   throw error 
  }
})

UserSchema.pre("save", async function(next){
  try {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
  } catch (err) {
    console.error(err, "hash err");
  }
  next();
});

UserSchema.plugin(updateInitialLetter)

const User = mongoose.model("User", UserSchema);

module.exports = User;
