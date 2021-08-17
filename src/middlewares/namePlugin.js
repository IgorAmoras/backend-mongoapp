module.exports = { 
  initialLetterPlugin(schema){
    schema.add({
      initials: {
        type: String,
        default: 'Not Specified'
      }
    })
    schema.pre("save", async function(next){
      let inis = '';
      const {name: completeName} = await this.model('User').findById(this.user)
      completeName.split(' ').forEach(name => {
        if(completeName.length === 1){inis = name.substring(0,1); return;}
        inis += name.charAt(0)
      })
      this.initials = inis
      next()
    })
  }
}  
