var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

mongoose.Promise = Promise

var dbUrl = 'mongodb://kickstartuser:kick123@ds247101.mlab.com:47101/uriel_kickstart'
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    usertype: {
        type: String,
        required: true,
    }
});

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
var User = mongoose.model('User', UserSchema);
var Project =mongoose.model('Project',ProjectSchema);
//authenticate input against database
UserSchema.statics.authenticate = function (userName, password, callback) {
    User.findOne({username: userName})
        .exec(function (err, user) {
            if (err) {
                return callback(err)
            } else if (!user) {
                var err = new Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(password, user.password, function (err, result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    return callback();
                }
            })
        });
}

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash){
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
});

app.get('/project', (req, res) => {
    Project.find({}, (err, projects) => {
		console.log(projects);
        res.send(projects)
    })

})

app.post('/signIn',async (req, res) => {
    User.getAuthenticated(req.body.username, req.body.password, function (error, user) {
        if (error || !user) {
            var err = new Error('Wrong email or password.');
            err.message = 'Wrong email or password.';
            console.log('Wrong email or password');
            err.status = 401;
            return next(err);
        } else {
            console.log('user SignIn succesfolly');
            return res.json({usertype: user.usertype});
        }
    })
})

app.post('/user', async (req, res) => {
    if (req.body.username &&
        req.body.password &&
        req.body.usertype) {
        var userData = {
            username: req.body.username,
            password: req.body.password,
            usertype: req.body.usertype,
        }

        User.create(userData, function (err, user) {
            if (err) {
                return next(err)
            }
        });
        console.log('user post called');
        res.sendStatus(200)

    }
})

app.post('/project', async (req, res) => {
    try {
        var project = new Project(req.body)

        var savedProject = await project.save()

        io.emit('project', req.body)

        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('project post called')
    }
})


    io.on('connection', (socket) => {
        console.log('a user connected')
    })

    mongoose.connect(dbUrl, {useMongoClient: true}, (err) => {
        console.log('mongo db connection', err)
    })

    var server = http.listen(3000, () => {
        console.log('server is listening on port', server.address().port)
    })
