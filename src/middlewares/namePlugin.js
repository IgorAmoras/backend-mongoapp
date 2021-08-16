module.exports = { 
  initialLetterPlugin(schema){
    schema.add({
      initials: {
        type: String,
        default: 'Not Specified'
      }
    })
    schema.pre("save", async function(next){
      console.log('InitialLetter')
      let inis = '';
      if(!this.username)return next()
      // this.model.findByID({}) -> Acessar o modelo referenciado 
      this.username.split(' ').forEach(name => {
        if(names.length === 1){inis = name.substring(0,1); return;}
        inis += name.charAt(0)
      })
      this.initials = inis
      next()
    })
  }
}  
