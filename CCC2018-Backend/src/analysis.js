var readline = require('readline');
var fs = require('fs');
var os = require('os');
var nano = require('nano')('http://115.146.86.141:5985');
var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyA0BDzrQZAVv33TmfvO7jhbjLd4gD3qgUM'
});

var tweets = nano.db.use('twitter_db');

//load happy emoji
var happy_emoji = 'happy-emoji.txt';
var happyRead = fs.createReadStream(happy_emoji);
var objReadline = readline.createInterface({
    input: happyRead,
});

var happy_list = []
objReadline.on('line', function(line){
    happy_list.push(line)
});
objReadline.on('close', function(){
    console.log('Finish reading happy emoji');
    //console.log(happy_list)
});

//load sad emoji
var sad_emoji = 'sad-emoji.txt';
var sadRead = fs.createReadStream(sad_emoji);
var objReadline = readline.createInterface({
    input: sadRead,
});

var sad_list = []
objReadline.on('line', function(line){
    sad_list.push(line)
});
objReadline.on('close', function(){
    console.log('Finish reading sad emoji');
    //console.log(sad_list)
});


//load positive words
var positive_file_name = 'positive-words.txt';
var positiveRead = fs.createReadStream(positive_file_name);
var objReadline = readline.createInterface({
    input: positiveRead,
});

var positive_list = []
objReadline.on('line', function(line){
    positive_list.push(line)
});
objReadline.on('close', function(){
    console.log('Finish reading positive words');
    //console.log(positive_list.length)
});


//load negative words
var negative_file_name = 'negative-words.txt';
var negativeRead = fs.createReadStream(negative_file_name);
var objReadline = readline.createInterface({
    input: negativeRead,
});
var negative_list = new Array()

objReadline.on('line', function(line){
    negative_list.push(line)
});
objReadline.on('close', function(){
    console.log('Finish reading negative words');
    //console.log(negative_list.length)
});

//load averb of degree words
var degree_file_name = 'averb-of-degree.txt';
var degreeRead = fs.createReadStream(degree_file_name);
var objReadline = readline.createInterface({
    input: degreeRead,
});
var degree_list = new Array()

objReadline.on('line', function(line){
    degree_list.push(line)
});
objReadline.on('close', function(){
    console.log('Finish reading degree words');
    //console.log(degree_list.length)
});

//load privative words
var privative_file_name = 'privative-words.txt';
var privativeRead = fs.createReadStream(privative_file_name);
var objReadline = readline.createInterface({
    input: privativeRead,
});
var privative_list = new Array()

objReadline.on('line', function(line){
    privative_list.push(line)
});
objReadline.on('close', function(){
    console.log('Finish reading privative words');
    // console.log(privative_list.length)
});



//load game words
var game_file_name = 'game-related-wordlist.txt';
var gameRead = fs.createReadStream(game_file_name);
var objReadline = readline.createInterface({
    input: gameRead,
});
var game_list = new Array()

objReadline.on('line', function(line){
    game_list.push(line)
});
objReadline.on('close', function(){
    console.log('Finish reading game words');
    //console.log(game_list)
});




// read tweets from file
var fReadName = process.argv[2];
var fRead = fs.createReadStream(fReadName);

var objReadline = readline.createInterface({
    input: fRead,
});

var index = 1;
var count = 0;
objReadline.on('line', function(line) {
        var tweet_str = line;
        var tweet_json = JSON.parse(tweet_str)
        var id_line = tweet_json.id_str;
        var tweet_text = tweet_json.text

        var sentiment = "";

        var happy_emoji_count = happy_emoji_analysis(tweet_text);
        var sad_emoji_count = sad_emoji_analysis(tweet_text);

        if (happy_emoji_count > sad_emoji_count) {
            sentiment = "Positive"
        } else if (happy_emoji_count < sad_emoji_count) {
            sentiment = "Negative"
        } else {
            var positive_count = positive_sentiment_analysis(tweet_text);
            var negative_count = negative_sentiment_analysis(tweet_text);
            var degree_count = degree_sentiment_analysis(tweet_text);
            var privative_count = privative_sentiment_analysis(tweet_text);

            var degree = Math.pow(-1, privative_count);
            var sentimental_value = (degree_count + 1) * (positive_count * 1 + negative_count * -1) * degree;

            if (sentimental_value > 0) {
                sentiment = "Positive"
            }
            else if (sentimental_value < 0) {
                sentiment = "Negative"
            }
            else {
                sentiment = "Neutral"
            }
        }
        // console.log(sentiment)

        //game-related-anslysis
        var isRelated = ""
        var textCount = game_word_analysis(tweet_text);
        var tagCount = tag_analysis(tweet_json);
        var gameCount = textCount + tagCount
        if (gameCount > 0) {
            isRelated = "Related";
            count++
        }
        else {
            isRelated = "Not related"
        }

        // obtain postcode by coodinates
        if (tweet_json.place != null) {
            if (tweet_json.place.bounding_box != null) {
                var x = tweet_json.place.bounding_box.coordinates[0][0][0]
                var y = tweet_json.place.bounding_box.coordinates[0][0][1]
                googleMapsClient.reverseGeocode({
                    "latlng": y.toString()+","+x.toString()
                }, function(err, response) {
                    if (!err) {
                        var address = response.json.results[0].formatted_address;
                        var list = address.split(",");
                        var str = list[list.length - 2].split(" ");
                        postcode = str[str.length-1]

                        var suburb_name = ''
                        for(i=1;i<str.length-2;i++){
                            suburb_name = suburb_name +str[i]+' '
                        }

                        addToDB(tweet_json, id_line, sentiment,postcode,suburb_name,isRelated)
                    }
                });

            }
        }
    index ++;
});

objReadline.on('close', function(){
    console.log('readline close...');
    //console.log(test)
});

function addToDB(obj,index,str,postcode,name,isRelated) {
    if (obj.place != null) {
        if (obj.place.name == "Melbourne" || obj.place.name == "Adelaide" || obj.place.name == "Sydney"
            || obj.place.name == "Brisbane" ) {
            tweets.insert({
                source: obj.source,
                text: obj.text,
                time: obj.created_at,
                friends: obj.user.friends_count,
                user_id : obj.user.id,
                sentiment: str,
                postcode: postcode,
                suburb: name,
                city: obj.place.name,
                Game_Related: isRelated
            }, index, function (err, body) {
                if (!err) {
                    console.log("Insert Success" + index);
                } else {
                    console.log(err)
                }
            });
        }
    }
}

function positive_sentiment_analysis(text) {
    var count = 0;
    var tweet = text.split(" ")
    for (i = 0; i < positive_list.length; i++) {
        var target = positive_list[i].toLowerCase()
        for(j = 0; j<tweet.length;j++){
            var str = tweet[j].replace(/[.,\/#!<>@#%?$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase()
            if(str == target){
                count ++
                // console.log(tweet[j])
            }
        }
    }
    return count
}

function negative_sentiment_analysis(text) {
    var count = 0;
    var tweet = text.split(" ")
    for (i = 0; i < negative_list.length; i++) {
        var target = negative_list[i].toLowerCase()
        for(j = 0; j<tweet.length;j++){
            var str = tweet[j].replace(/[.,\/#!<>@#%?$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase()
            if(str == target){
                count ++
                // console.log(tweet[j])
            }
        }
    }
    return count
}

function degree_sentiment_analysis(text) {
    var count = 0;
    var tweet = text.split(" ")
    for (i = 0; i < degree_list.length; i++) {
        var target = degree_list[i].toLowerCase()
        for(j = 0; j<tweet.length;j++){
            var str = tweet[j].replace(/[.,\/#!<>@#%?$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase()
            if(str == target){
                count ++
                // console.log(tweet[j])
            }
        }
    }
    return count
}

function privative_sentiment_analysis(text) {
    var count = 0;
    var tweet = text.split(" ")
    for (i = 0; i < privative_list.length; i++) {
        var target = privative_list[i].toLowerCase()
        for(j = 0; j<tweet.length;j++){
            var str = tweet[j].replace(/[.,\/#!<>@#%?$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase()
            if(str == target){
                count ++
                // console.log(tweet[j])
            }
        }
    }
    return count
}

function game_word_analysis(text){

    var count = 0
    for (i = 0; i < game_list.length; i++) {
        var target = game_list[i].toLowerCase()
        if(text.indexOf(target) >= 0){
            count++
            // console.log(text + "////"+ target)
        }

    }

    return count
}

function tag_analysis(obj){
    var count = 0
    if(obj.entities != null){
        if(obj.entities.hashtags != null){
            var text = ''
            for(i=0;i<obj.length;i++){
                text = text + obj[i].text + " "
            }
            count = game_word_analysis(text)
        }
    }

    return count
}

function happy_emoji_analysis(text){
    var count = 0;
    for (i = 0; i < happy_list.length; i++) {
        var target = happy_list[i]
        if(text.indexOf(target) >= 0){
            count++
            //console.log(text + "////"+ target)
        }
    }
    return count
}

function sad_emoji_analysis(text){
    var count = 0;
    for (i = 0; i < sad_list.length; i++) {
        var target = sad_list[i]
        if(text.indexOf(target) >= 0){
            count++
            // console.log(text + "////"+ target)
        }
    }
    return count
}
