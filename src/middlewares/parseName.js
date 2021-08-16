const User = require("../models/User");

module.exports = {
  async getInitials(req) {
    let initials = ''
    const { name } = await User.findOne({ _id: req.userId });
    name.split(' ').forEach(unique => {
      if(this.lenght === 1) initials += unique.substring(0, 1)
      initials += unique.charAt(0)
    }, name)
    return initials;
  },
};
