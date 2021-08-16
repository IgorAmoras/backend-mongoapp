const Project = require('../models/Project')

module.exports = {
  updateInitialLetter(schema) {
    schema.pre('findOneAndUpdate', async function(next){
      let initials = ''
      this._update.name.split(' ').forEach(name => {
        initials += name.charAt(0)
      })
      initials.toUpperCase()
      const updated = await Project.updateMany({user: this._conditions._id}, {initials: initials.toUpperCase()})
      console.log(updated)
      
      //const projects = await Project.updateMany({initials})

    })
  }
}