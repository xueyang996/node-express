var express = require('express');
var app = express();
var fortune = require('./lib/fortune.js');
var weather = require('./lib/weather');
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
app.use(function(req, res, next) {
	if (!res.locals.partials) {
		res.locals.partials = {};
	}
	res.locals.partials.weather = weather.getWeatherData();
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