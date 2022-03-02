import requests
import sys
import pymysql
import my_api_key

args = {
    "video_id"     : sys.argv[1],
    "get_new_flag" : sys.argv[2]
}

connection = pymysql.connect(host='localhost',
                             user='comment',
                             password='comment',
                             database='comment',
                             charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)

with connection.cursor() as cursor:
    sql = "SELECT id FROM return_api WHERE video_id=%s LIMIT 1"
    cursor.execute(sql, (args["video_id"]))
    dbdata = cursor.fetchall()
    if (not len(dbdata) == 0):
        sql = "UPDATE return_api SET create_time=NOW() WHERE video_id=%s"
        cursor.execute(sql, (args["video_id"]))
        connection.commit()
        if (args["get_new_flag"] == 0):
            connection.close()
            print(-1)
            sys.exit()
URL = 'https://www.googleapis.com/youtube/v3/'
API_KEY = my_api_key.API_KEY

def print_video_comment(video_id, next_page_token=None):
    params = {
        'key': API_KEY,
        'part': 'snippet',
        'videoId': video_id,
        'order': 'time',
        'textFormat': 'plaintext',
        'maxResults': 100,
    }
    if next_page_token is not None:
        params['pageToken'] = next_page_token
    response = requests.get(URL + 'commentThreads', params=params)
    resource = response.json()

    if not "items" in resource.keys():#強制終了
        return -1
    for comment_info in resource['items']:
        # コメント
        try:
            text = comment_info['snippet']['topLevelComment']['snippet']['textDisplay']
        except:
            text = ""
        # グッド数
        try:
            like_cnt = comment_info['snippet']['topLevelComment']['snippet']['likeCount']
        except:
            like_cnt = ""
        # 返信数
        try:
            reply_cnt = comment_info['snippet']['totalReplyCount']
        except:
            reply_cnt = ""
        # ユーザー名
        try:
            user_name = comment_info['snippet']['topLevelComment']['snippet']['authorDisplayName']
        except:
            user_name = ""
        try:
            channel_id = comment_info['snippet']['topLevelComment']['snippet']['authorChannelId']['value']
        except:
            channel_id = ""
        # プロフィール画像
        try:
            authorProfileImageUrl = comment_info['snippet']['topLevelComment']['snippet']['authorProfileImageUrl']
        except:
            authorProfileImageUrl = ""
        #投稿日
        try:
            datetime = comment_info['snippet']['topLevelComment']['snippet']['publishedAt']
        except:
            datetime = ""
        # Id
        try:
            commentId = comment_info['snippet']['topLevelComment']['id']
        except:
            commentId = ""
        with connection.cursor() as cursor:
            sql = """UPDATE return_api 
                    SET datetime=%s, author_name=%s, authorProfileImageUrl=%s,
                    channel_id=%s, comment=%s, comment_id=%s, replyto=%s, 
                    reply_cnt=%s, like_cnt=%s, video_id=%s, create_time=NOW()
                    WHERE (video_id=%s AND comment_id=%s)"""
            cursor.execute(sql, 
                (datetime.replace("T", " ").replace("Z", ""), user_name, authorProfileImageUrl,
                    channel_id, text, commentId, "toplevel", 
                    reply_cnt, like_cnt, video_id, 
                    video_id, commentId)
            )
            affect = connection.affected_rows()
            if (affect == 0):
                sql = """INSERT INTO return_api 
                        (datetime, author_name, authorProfileImageUrl, channel_id, comment, comment_id, replyto, reply_cnt, like_cnt, video_id)
                        values
                        (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
                cursor.execute(sql, 
                    (datetime.replace("T", " ").replace("Z", ""),
                    user_name, authorProfileImageUrl, channel_id, 
                    text, commentId, "toplevel", reply_cnt, like_cnt, video_id)
                )
            connection.commit()
        if reply_cnt > 0:
            print_video_reply(video_id, commentId, None)
    if 'nextPageToken' in resource:
        print_video_comment(video_id, resource["nextPageToken"])
    return 0

def print_video_reply(video_id, parentId, next_page_token=None):
    params = {
        'key': API_KEY,
        'part': 'snippet',
        'videoId': video_id,
        'textFormat': 'plaintext',
        'maxResults': 100,
        'parentId': parentId,
    }

    if next_page_token is not None:
        params['pageToken'] = next_page_token
    response = requests.get(URL + 'comments', params=params)
    resource = response.json()

    for comment_info in resource['items']:
        # コメント
        try:
            text = comment_info['snippet']['textDisplay']
        except:
            text = ""
        # グッド数
        try:
            like_cnt = comment_info['snippet']['likeCount']
        except:
            like_cnt = ""
        # ユーザー名
        try:
            user_name = comment_info['snippet']['authorDisplayName']
        except:
            user_name = ""
        try:
            channel_id = comment_info['snippet']['authorChannelId']['value']
        except:
            channel_id = ""
        # プロフィール画像
        try:
            authorProfileImageUrl = comment_info['snippet']['authorProfileImageUrl']
        except:
            authorProfileImageUrl = ""
        # Id
        try:
            commentId = comment_info['id']
        except:
            commentId = ""
        #投稿日
        try:
            datetime = comment_info['snippet']['publishedAt']
        except:
            datetime = ""
        with connection.cursor() as cursor:
            sql = """UPDATE return_api 
                    SET datetime=%s, author_name=%s, authorProfileImageUrl=%s,
                    channel_id=%s, comment=%s, comment_id=%s, replyto=%s, 
                    like_cnt=%s, video_id=%s, create_time=NOW()
                    WHERE (video_id=%s AND comment_id=%s)"""
            cursor.execute(sql, 
                (datetime.replace("T", " ").replace("Z", ""), user_name, authorProfileImageUrl,
                    channel_id, text, commentId, "toplevel", 
                    like_cnt, video_id, 
                    video_id, commentId)
            )
            affect = connection.affected_rows()
            if (affect == 0):
                sql = """INSERT INTO return_api 
                        (datetime, author_name, authorProfileImageUrl, channel_id, comment, comment_id, replyto, 
                        like_cnt, video_id)
                        values
                        (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
                cursor.execute(sql, 
                    (datetime.replace("T", " ").replace("Z", ""),
                    user_name, authorProfileImageUrl, channel_id, text, commentId, parentId, like_cnt, video_id)
                )
            connection.commit()
    if 'nextPageToken' in resource:
        print_video_reply(video_id, parentId, resource["nextPageToken"])
    return 0

#-----------------------------------------------------------------#
# youtube_api
#-----------------------------------------------------------------#
print_video_comment(args["video_id"])
#-----------------------------------------------------------------#
# output
#-----------------------------------------------------------------#
connection.commit()
connection.close()
print(0)