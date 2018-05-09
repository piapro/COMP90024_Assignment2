from tweepy.streaming import StreamListener
from tweepy import OAuthHandler
from tweepy import Stream

#Key to access Twitter API
access_token = ""
access_token_secret = ""
consumer_key = ""
consumer_secret = ""


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
    geo = []
    stream.filter(locations=geo)