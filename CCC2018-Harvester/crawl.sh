#!/bin/bash
python3 stream_tweets.py > stream.json
python3 search_tweets.py stream.json search.json