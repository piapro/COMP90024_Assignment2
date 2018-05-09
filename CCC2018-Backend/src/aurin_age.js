var readline = require('readline');
var fs = require('fs');
var os = require('os');
var nano = require('nano')('http://localhost:5984');
//var nano = require('nano')('http://144.6.225.242:5984/');

//nano.db.create('new_aurin_age');
var tweets = nano.db.use('new_aurin_age');



// read 50-100 age file
var fname = 'suburb-age-50-100.json';
var read = fs.createReadStream(fname);

var objReadline = readline.createInterface({
    input: read,
});

var old_age_list = new Array()
objReadline.on('line', function(line) {

    var age_str = line;
    var age_json = JSON.parse(age_str)
    var old_features = age_json.features
    for(i=0;i<old_features.length;i++){
        var old_info = old_features[i].properties
        var age_50_above =old_info.age_55_59_p + old_info.age_60_64_p+old_info.age_65_69_p + old_info.age_70_74_p+old_info.age_75_79_p+ old_info.age_80_84_p+old_info.age_85_89_p
            + old_info.age_90_94_p+old_info.age_95_99_p
        old_age_list.push(age_50_above)
    }
    //addToDB(aurin_json)
});

objReadline.on('close', function(){
    console.log('readline close...');
   // console.log(old_age_list.length)
});



// read aurin json file
var fReadName = 'suburb-age-0-50.json';
var fRead = fs.createReadStream(fReadName);

var objReadline = readline.createInterface({
    input: fRead,
});


objReadline.on('line', function(line) {

    var aurin_str = line;
    var aurin_json = JSON.parse(aurin_str)
    var age_features = aurin_json.features
    for(i=0;i<age_features.length;i++){
         var age_info = age_features[i].properties

       var age_0_19 = age_info.age_0_4_p + age_info.age_5_9_p + age_info.age_10_14_p +age_info.age_15_19_p;
       var age_19_30 = age_info.age_20_24_p + age_info.age_25_29_p;
       var age_30_40 = age_info.age_30_34_p + age_info.age_35_39_p;
       var age_40_55 = age_info.age_40_44_p + age_info.age_45_49_p + age_info.age_50_54_p
          var age_50_above = old_age_list[i];
        addToDB(i,age_0_19,age_19_30,age_30_40,age_40_55,age_50_above,age_info.lga_name_2016)
    }


});

objReadline.on('close', function(){
    console.log('readline close...');
});

function addToDB(i,age_0_19,age_19_30,age_30_40,age_40_55,age_50_above,name) {
            tweets.insert({
                age_0_19: age_0_19,
                age_19_30: age_19_30,
                age_30_40: age_30_40,
                age_40_55: age_40_55,
                age_50_above : age_50_above,
                city: name
            }, i, function (err, body) {
                if (!err) {
                    // console.log(body);
                } else {
                    console.log(err)
                }
            });
}
