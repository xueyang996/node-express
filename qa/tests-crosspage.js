// mocha -u tdd -R spec qa/tests-crosspage.js
// bug : domo.value一直为空!!

var Brower = require('zombie'),
	assert = require('chai').assert;

var browser;
suite('Cross-page Tests', function() {
	setup(function() {
		browser = new Brower();
	})
	test('requesting a group rate quote from the hood river tour page' +
		'should populate the referrer field',
		function(done) {
			var referrer = 'http://localhost:3000/tours/hood-river';
			browser.visit(referrer, function() {
				browser.clickLink('.requestGroupRate', function() {
					var domo = browser.field('referrer');
					console.log(domo.name, domo.value, 'sdfdfsd!!!!');
					assert(browser.field('referrer').value === referrer);
					done();
				});
			});
		});
	test('requesting a group rate from the oregon coast tour page should ' +
		'populate the referrer field',
		function(done) {
			var referrer = 'http://localhost:3000/tours/oregon-coast';
			browser.visit(referrer, function() {
				browser.clickLink('.requestGroupRate', function() {
					assert(browser.field('referrer').value === referrer);
					done();
				});
			});
		});
	test('visiting the "request group rate" page dirctly should result ' +
		'in an empty referrer field',
		function(done) {
			browser.visit('http://localhost:3000/tours/request-group-rate',
				function() {
					assert(browser.field('referrer').value === '');
					done();
				});
		})
})