import requests
import json
import argparse

parser = argparse.ArgumentParser()
# parser.add_argumentで受け取る引数を追加していく
parser.add_argument('video_id') # 必須の引数を追加
args = parser.parse_args()    # 引数を解析


URL = 'https://www.googleapis.com/youtube/v3/'
# ここにAPI KEYを入力
API_KEY = "AIzaSyC1w5UrkHmR-MtLFZs-aTHFgHG2-b9ghKQ" #'AIzaSyA-Nj3-UP6FpcqXeYNIDRM5cCWdHDuMz7k' #'AIzaSyA4tcnhenQfxf5U4PO9yWLAGXdsGU7zQVI'

params = {
  'part': 'snippet',
  'key': API_KEY,
  "id": args.video_id
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
    print(json.dumps({"error":e}, ensure_ascii=False))
