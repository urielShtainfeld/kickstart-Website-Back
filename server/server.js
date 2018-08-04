var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var {User} = require('./models/user');
var {Project} = require('./models/project');
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
mongoose.Promise = Promise;
var dbUrl = 'mongodb://kickstartuser:kick123@ds247101.mlab.com:47101/uriel_kickstart';

app.get('/project', (req, res) => {
    Project.find({}, (err, projects) => {
		console.log(projects);
        return res.json(projects)
    })
});

app.post('/signIn',async (req, res) => {
    User.authenticate(req.body.username, req.body.password, function (error, user) {
        if (error || !user) {
            var err = new Error('Wrong email or password.');
            err.message = 'Wrong email or password.';
            console.log('Wrong email or password');
            err.status = 401;
            return res.json(err);
        } else {
            console.log('user SignIn successfully');
            return res.json(user.usertype);
        }
    })
});

app.post('/user', async (req, res) => {
    if (req.body.username &&
        req.body.password &&
        req.body.usertype) {
        var userData = {
            username: req.body.username,
            password: req.body.password,
            usertype: req.body.usertype,
        };

        User.create(userData, function (error, user) {
            if (error) {
                var err = new Error('The name already used.');
                err.message = 'The name already used.';
                console.log('The name already used.');
                err.status = 401;
                res.send(err) ;
            } else {
            console.log('user sign up');
            res.sendStatus(200)
            }
        });


    }
});

app.post('/project', async (req, res) => {
    try {
        var project = new Project(req.body);

        var savedProject = await project.save();

        io.emit('project', req.body);
        console.log(project.uniqueId);
        return res.json(project);

    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('project post called')
    }
});
app.post('/updateproject', async (req, res) => {
    try {
        // var project = new Project(req.body);
        // project._id = '';
        // console.log(project.toJSON());
        console.log(req.body);
        Project.findOneAndUpdate({ 'uniqueId': req.body.uniqueId}, req.body, {new: true}, function(err, project){
            if (err) {
                console.log(err);
                return res.status(500).send({ error: err })
            };
            return res.status(200).send("succesfully saved");
        });

    } catch (error) {
        res.sendStatus(500);
        return console.error(error);
    } finally {
        console.log('project update called')
        }
    }
);

io.on('connection', (socket) => {
    console.log('a user connected')
});

mongoose.connect(dbUrl, {useMongoClient: true}, (err) => {
    console.log('mongo db connection', err)
})

var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
})
