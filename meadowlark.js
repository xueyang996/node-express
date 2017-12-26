var express = require('express');
var formidable = require('formidable');
var jqupload = require('jquery-file-upload-middleware');
var app = express();
var fortune = require('./lib/fortune.js');
var weather = require('./lib/weather');
var credentials = require('./credentials.js');
app.set('port', process.env.port || 3000);
// teshi
// 设置handlerbars视图引擎
// helpers section 辅助方法，
var handlebars = require('express3-handlebars').create({
	defaultLayout: 'main',
	helpers: {
		section: function(name, options) {
			if (!this._sections) {
				this._sections = {}
			}
			this._sections[name] = options.fn(this);
			return null;
		}
	}
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
// 静态文件设置
app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next) {
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
	next();
});
app.use(require('body-parser')());
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')());
app.use(function(req, res, next) {
	if (!res.locals.partials) {
		res.locals.partials = {};
	}
	res.locals.partials.weather = weather.getWeatherData();
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
})
app.get('/', function(req, res) {
	res.render('home');
});
app.get('/about', function(req, res) {
	res.render('about', {
		fortune: fortune.getFortune(),
		pageTestScript: '/qa/tests-about.js'
	});
});
app.get('/tours/hood-river', function(req, res) {
	res.render('tours/hood-river');
});
app.get('/tours/oregon-coast', function(req, res) {
	res.render('tours/oregon-coast');
});
app.get('/tours/request-group-rate', function(req, res) {
	res.render('tours/request-group-rate');
});
app.get('/thank-you', function(req, res) {
	console.log('////');
	res.render('thank-you');
});
app.get('/headers', function(req, res) {
	res.set('Content-Type', 'text/plain');
	var s = '';
	for (var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
	console.log(s);
	res.send(s);
});
app.get('/newsletter', function(req, res) {
	res.render('newsletter', {
		csrf: 'CSRF token goes here'
	});
});
app.post('/process', function(req, res) {
	console.log('./process!!', req.xhr, req.accepts('json,html') === 'json');
	if (req.xhr || req.accepts('json,html') === 'json') {
		res.send({
			success: true
		});
	} else {
		res.redirect(303, '/thank-you');
	}
});
app.get('/contest/vacation-photo', function(req, res) {
	var now = new Date();
	res.render('contest/vacation-photo', {
		year: now.getFullYear(),
		month: now.getMonth()
	});
});
app.get('/contest/jquery-fileupload', function(req, res) {
	res.render('contest/jquery-fileupload');
});
app.post('/contest/vacation-photo/:year/:month', function(req, res) {
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		if (err) return res.redirect(303, '/error');
		console.log('received fields:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
		res.redirect(303, '/thank-you');
	});
});
app.use('/upload', function(req, res, next) {
	var now = Date.now();
	jqupload.fileHandler({
		uploadDir: function() {
			return __dirname + '/public/uploads/' + now;
		},
		uploadUrl: function() {
			return '/uploads/' + now;
		},
	})(req, res, next);
});

function NewsletterSignup() {

}
NewsletterSignup.prototype.save = function(cb) {
	cb();
};
var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
app.post('/newsletter', function(req, res) {
	var name = req.body.name || '',
		email = req.body.email || '';
	console.log(req.body)
	if (!email.match(VALID_EMAIL_REGEX)) {
		if (req.xhr) {
			console.log('????')
			return res.json({
				error: 'Invalid name email address'
			});
		}
		req.session.flash = {
			type: 'danger',
			intro: 'Validation error!',
			message: 'The email address you entered was  not valid.',
		};
		return res.redirect(303, '/newsletter/archive');
	}
	new NewsletterSignup({
		name: name,
		email: email
	}).save(function(err) {
		if (err) {
			if (req.xhr) {
				res.json({
					error: 'Database error.'
				})
			}
			req.session.flash = {
				type: 'danger',
				danger: 'Database error!',
				message: 'There was a database error; please try again later.',
			};
			return res.redirect(303, '/newsletter/archive');
		}
		if (req.xhr) return res.json({
			success: true
		});
		req.session.flash = {
			type: 'success',
			intro: 'Thank you!',
			message: 'You have now been signed up for the newsletter.',
		};
		return res.redirect(303, '/newsletter/archive');
	});
});
app.get('/newsletter/archive', function(req, res) {
	res.render('newsletter/archive');
})
// 404 catch-all处理器(中间件)
app.use(function(req, res, next) {
	res.status(404);
	res.render('404');
});
// 500 错误处理(中间件)
app.use(function(err, req, res, next) {
	console.log(err, '???');
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function() {
	console.log('Express started on http://localhost:' + app.get('port') + '; press ctrl-c to terminate');
});