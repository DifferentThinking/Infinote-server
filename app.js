'use strict';

// MongoDB config
const mongojs = require('mongojs');
const connectionString = 'mongodb://Admin:secretPassword@ds135800.mlab.com:35800/infinote-db';
const collections = ['users'];

const db = mongojs(connectionString, collections);

var ObjectId = require('mongodb').ObjectId; 

const express = require('express')
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const apiRouter = new express.Router();

apiRouter
	.post('/auth/register', function (req, res, next) {
		let user = req.body;
		if (!user) {
			return res.status(404).json({ 'error': 'Please Enter username or password' });
		}
		else {
			db['users'].findOne({ username: req.body.username }, function(err, userInDb) {
				if (userInDb) {
					return res.status(404).json({'error': 'Please choose another username. This username is already in use!'});
				}

				db['users'].save(user, function (err, user) {
					if (err) {
						return res.status(404).json({'error': 'DB error'});
					}
					return res.json({ result: {
						username: user.username
					}});
				})
			})
		}
	})
	.post('/auth/login', function(req, res, next)  {
		if (!req.body) {
			return res.status(404).json({ 'error': 'You must send the username and the password' });
		}
		db['users'].findOne({ username: req.body.username }, function(err, user) {
			if (!user) {
				return res.status(404).json({ 'error': 'The username or password doesn\'t match' });
			}
			if (!(user.passHash === req.body.passHash)) {
				return res.status(404).json({ 'error': 'The username or password doesn\'t match' });
			}
			
			res.json({ result: {
				username: user.username
			}});
		});
	})
	.post('/users/:username/notes', function(req, res, next) {
		if (!req.body) {
			return res.status(404).json({ 'error': 'You must send the username and the password' });
		}
		let note = req.body;

		db['note'].save(note, function(err, noteInDb) {
			if (err) {
				return res.status(404).json({ 'error': 'DB Error'});
			}
			
			return res.json({ 'result': {
				'status': 'OK'
			}});
		});
	})
	.post('/users/notes/delete', function(req, res, next) {
		let id = req.body.id;

		db['note'].remove({ _id: new ObjectId(id) }, function(err, deletedNote) {
			if (err) {
				return res.status(404).json({ 'error': 'Error in DB' });
			}

			return res.json({ 'result': {
				'status': 'OK'
			}});
		})
	})
	.get('/users/:username/notes', function(req, res, next) {
		let username = req.params.username;
		
		db['note'].find({ username: username }, function(err, notes) {
			if (err) {
				return res.status(404).json({ 'error': 'DB Error'});
			}

			return res.json({'result': {
				'notes': notes
			}});
		});
	})
	.get('/users/:username', function (req, res, next) {
		let username = req.params.username;

		db['users'].find({ username: username }, function (err, user) {
			if (err) {
				return res.json({ 'error': 'DB Error'});
			}

			return res.json({ 'result': 
				user
			});
		})
	});
	
app.use('/api', apiRouter);

const port = process.env.PORT || 3000;
app.listen(port);
console.log(`Server running on port:${port}`);