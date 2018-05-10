from tweepy.streaming import StreamListener
from tweepy import OAuthHandler
from tweepy import Stream

#Key to access Twitter API
access_token = 	"987560529987170304-jHfyqWWMcTIDeQU9pOo5MLHGB8FRBew"
access_token_secret = "oSczVKG3iqJJcPkiFrFfvyD2bZjHqF3DxxIpvbXxIO7UD"
consumer_key = "zGtzvalMg8wwz5hV01ByOr7VN"
consumer_secret = "6OoIRgFqwUU9ufSB4X2vntKiQD7Xuv49APr4GznopT5RCdEFhN"


#Basic listener prints received tweets to stdout
class StdOutListener(StreamListener):

    def on_data(self, data):
        print (data)
        return True

    def on_error(self, status):
        print (status)


if __name__ == '__main__':

    #Processing authentication and connect to Twitter Streaming API
    l = StdOutListener()
    auth = OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_token_secret)
    stream = Stream(auth, l)

    #Filter Twitter Streams by specific polygon
    geo = [150.50, -34.10, 151.35, -33.55]
    stream.filter(locations=geo)
