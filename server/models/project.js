var mongoose = require('mongoose');

var ProjectSchema =  {
    uniqueId:{
        type: String,
        unique: true
    },
    name: String,
    description: String,
    imagePath: String,
    daysLeft: String,
    hoursLeft: String,
    neededMoney: String,
    moneyCollected: String,
    linkToExample: String,
    status: String,
    owner: String,
    donations: [{
        name: String,
        amount: String
    }]

}

var Project =mongoose.model('Project',ProjectSchema);
module.exports = {Project};