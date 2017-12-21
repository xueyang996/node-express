var express = require('express');
var app = express();
app.set('port', process.env.port || 3000);
// teshi
// 设置handlerbars视图引擎
var handlebars = require('express3-handlebars').create({
	defaultLayout: 'main'
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.get('/', function(req, res) {
	res.render('home');
});
app.get('/about', function(req, res) {
	res.render('about');
});
// 404 catch-all处理器(中间件)
app.use(function(req, res, next) {
	res.status(404);
	res.render('404');
});
// 500 错误处理(中间件)
app.use(function(err, req, res, next) {
	res.status(500);
	res.render('500');
});
app.listen(app.get('port'), function() {
	console.log('Express started on http://localhost:' + app.get('port') + '; press ctrl-c to terminate');
});