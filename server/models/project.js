var mongoose = require('mongoose');
var ProjectSchema =  {
    name: {
        type: String,
        unique: true
    },
    description: String,
    imagePath: String,
    daysLeft: String,
    hoursLeft: String,
    neededMoney: String,
    moneyCollected: String,
    linkToExample: String,
    status: String,
    owner: String
}



var Project =mongoose.model('Project',ProjectSchema);
module.exports = {Project}