module.exports = { 
  initialLetterPlugin(schema){
    schema.pre("save", async function(next){
      let inis = '';
      if(!this.parsed)return next()
      const names = this.parsed.split(' ')
      names.forEach(name => {
        if(names.length === 1){inis = name.charAt(0) + name.charAt(1); return;}
        inis += name.charAt(0)
      })
      this.initials = inis
      next()
    })
  }
}  

