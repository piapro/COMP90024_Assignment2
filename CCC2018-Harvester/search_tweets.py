import tweepy
import json
import sys


def w_file(file, data):
    outfile = open(file, 'a+')
    outfile.write(json.dumps(data) + "\n")
    outfile.close()


def get_userid(line, ):
    line = line.rpartition("}")[0] + "}"
    if len(line) > 0:
        data = json.loads(line)
        uid = data["user"]["id"]
        return uid


# Consumer keys and access tokens to access twitter API
access_token = 	"987560529987170304-jHfyqWWMcTIDeQU9pOo5MLHGB8FRBew"
access_token_secret = "oSczVKG3iqJJcPkiFrFfvyD2bZjHqF3DxxIpvbXxIO7UD"
consumer_key = "zGtzvalMg8wwz5hV01ByOr7VN"
consumer_secret = "6OoIRgFqwUU9ufSB4X2vntKiQD7Xuv49APr4GznopT5RCdEFhN"


if __name__ == "__main__":

    if len(sys.argv) != 3:
        print("\nUsage: python search_tweets.py <json_in_file_path> <out_file_path>\n")
    else:
        file1 = sys.argv[1]
        file2 = sys.argv[2]

        # Processing authentication
        auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
        auth.set_access_token(access_token, access_token_secret)

        # Create interface
        api = tweepy.API(auth, wait_on_rate_limit=True)

        users = []
        with open(file1) as f:
            for line in f:
                try:
                    uid = get_userid(line)
                    if uid not in users:
                        users.append(uid)
                        for tweet in tweepy.Cursor(api.user_timeline, id=uid).items():
                            data = tweet._json
                            if data["coordinates"] is not None:
                                w_file(file2, data)
                except ValueError:
                    continue
                except:
                    continue
