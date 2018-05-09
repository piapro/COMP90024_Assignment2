var readline = require('readline');
var fs = require('fs');
var os = require('os');
var nano = require('nano')('http://localhost:5984');
//var nano = require('nano')('http://144.6.225.242:5984/');

//nano.db.create('new_aurin_income');
var tweets = nano.db.use('new_aurin_income');


// read aurin json file
var fReadName = 'income-all-region.json';
var fRead = fs.createReadStream(fReadName);

var objReadline = readline.createInterface({
    input: fRead,
});

objReadline.on('line', function(line) {

    var aurin_str = line.replace(/%/g,"");
    var aurin_json = JSON.parse(aurin_str)
    var features = aurin_json.features;
    for(i=0;i<features.length;i++){
        var income = features[i].properties
       // console.log(income)
        addToDB(i,income)
    }


});

objReadline.on('close', function(){
    console.log('readline close...');
});

function addToDB(i,obj) {
    tweets.insert({
        Wkly_0: obj.inc_over15_wkly_zero_,
        Wkly_1_499: obj.inc_over15_wkly_1_499_,
        Wkly_500_999: obj.inc_over15_wkly_500_999_,
        Wkly_1000_1999: obj.inc_over15_wkly_1000_1999_,
        Wkly_2000_2999: obj.inc_over15_wkly_2000_2999_,
        Wkly_negative: obj.inc_over15_wkly_negative_,
        Wkly_Over_3K: obj.inc_over15_wkly_over_3k_,
        city: obj.lga_name16
    }, i, function (err, body) {
        if (!err) {
            // console.log(body);
        } else {
            console.log(err)
        }
    });
}
