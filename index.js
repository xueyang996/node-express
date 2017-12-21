var xlsx = require('node-xlsx');
var fs = require('fs');
// 读取文件
var people = xlsx.parse(__dirname + '/testren.xlsx');
var company = xlsx.parse(__dirname + '/testqiye.xlsx');
var excelPeople = people[0].data;

var data = [];
for (var i in excelPeople) {
	var arr = [];
	var value = excelPeople[i];
	for (var j in value) {
		arr.push(value[j]);
	}
	data.push(arr);
}
var buffer = xlsx.build([{
	name: 'sheet1',
	data: data
}]);

//将文件内容插入新的文件中
fs.writeFileSync('test1.xlsx', buffer, {
	'flag': 'w'
});