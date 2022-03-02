import requests
import json
import sys
import my_api_key

args = {
    "video_id"     : sys.argv[1]
}

URL = 'https://www.googleapis.com/youtube/v3/'
API_KEY = my_api_key.API_KEY

params = {
  'part': 'snippet',
  'key': API_KEY,
  "id": args["video_id"]
}
try:
    response = requests.get(URL + 'videos', params=params)

    json_data = json.loads(response.text)
    output = json.dumps({"channelTitle":json_data["items"][0]["snippet"]["channelTitle"],
                        "title"       :json_data["items"][0]["snippet"]["title"],
                        "description" :json_data["items"][0]["snippet"]["description"],
                        "url"         :json_data["items"][0]["snippet"]["thumbnails"]["default"]["url"]}, ensure_ascii=False)
    print(output)
except Exception as e:
    print({"error":e})