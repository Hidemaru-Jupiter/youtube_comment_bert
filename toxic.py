import pandas as pd
import sys
import os
os.environ['TF_CPP_MIN_LOG_LEVEL']='2'
# 機械学習モデルの読み込み
import tensorflow as tf
import tensorflow_text as text
import datetime as dt
import pymysql
import time

#-----------------------------------------------------------------#
# start
#-----------------------------------------------------------------#
print("start", dt.datetime.now())

# toxic analysis
try:
    toxic_model = tf.keras.models.load_model("/var/www/cgi-bin/toxic")
except Exception as e:
    out = pd.DataFrame(columns=["error"])
    out["error"] = ["toxic_model", str(e)]
    print(out.to_json(orient = 'split'))
    sys.exit()
print("-> load_toxic_model", dt.datetime.now())

# negapozi analysis
try:
    negapozi_model = tf.keras.models.load_model("/var/www/cgi-bin/sentiment")
except Exception as e:
    out = pd.DataFrame(columns=["error"])
    out["error"] = ["negapozi_model", str(e)]
    print(out.to_json(orient = 'split'))
    sys.exit()
print("-> load_negapozi_model", dt.datetime.now())

# sarcasm analysis
try:
    sarcasm_model = tf.keras.models.load_model("/var/www/cgi-bin/sarcasm")
except Exception as e:
    out = pd.DataFrame(columns=["error"])
    out["error"] = ["sarcasm_model", str(e)]
    print(out.to_json(orient = 'split'))
    sys.exit()
print("-> load_sarcasm_model", dt.datetime.now())

# spam analysis
try:
    spam_model = tf.keras.models.load_model("/var/www/cgi-bin/spam")
except Exception as e:
    out = pd.DataFrame(columns=["error"])
    out["error"] = ["spam_model", str(e)]
    print(out.to_json(orient = 'split'))
    sys.exit()
print("-> load_spam_model", dt.datetime.now())

# construct analysis
try:
    construct_model = tf.keras.models.load_model("/var/www/cgi-bin/constructive")
except Exception as e:
    out = pd.DataFrame(columns=["error"])
    out["error"] = ["construct_model", str(e)]
    print(out.to_json(orient = 'split'))
    sys.exit()
print("-> load_construct_model", dt.datetime.now())

#-----------------------------------------------------------------#
# predict
#-----------------------------------------------------------------#
def predict_all(comment):
    try:
        toxic = toxic_model.predict(comment)
    except Exception as e:
        out = pd.DataFrame(columns=["error"])
        out["error"] = ["toxic", str(e)]
        print(out.to_json(orient = 'split'))
        sys.exit()
    print("<- end_toxic_predict", dt.datetime.now())

    try:
        negapozi = negapozi_model.predict(comment)
    except Exception as e:
        out = pd.DataFrame(columns=["error"])
        out["error"] = ["negapozi", str(e)]
        print(out.to_json(orient = 'split'))
        sys.exit()
    print("<- end_negapozi_predict", dt.datetime.now())

    try:
        sarcasm = sarcasm_model.predict(comment)
    except Exception as e:
        out = pd.DataFrame(columns=["error"])
        out["error"] = ["sarcasm", str(e)]
        print(out.to_json(orient = 'split'))
        sys.exit()
    print("<- end_sarcasm_predict", dt.datetime.now())

    try:
        spam = spam_model.predict(comment)
    except Exception as e:
        out = pd.DataFrame(columns=["error"])
        out["error"] = ["spam", str(e)]
        print(out.to_json(orient = 'split'))
        sys.exit()
    print("<- end_spam_predict", dt.datetime.now())

    try:
        construct = construct_model.predict(comment)
    except Exception as e:
        out = pd.DataFrame(columns=["error"])
        out["error"] = ["construct", str(e)]
        print(out.to_json(orient = 'split'))
        sys.exit()
    print("<- end_construct_predict", dt.datetime.now())

    return toxic, negapozi, sarcasm, spam, construct

#-------------------------------------------------------------------------#
# mysqlから読み込み
#-------------------------------------------------------------------------#

while(True):
    # Connect to the database
    connection = pymysql.connect(host='localhost',
                                user='comment',
                                password='comment',
                                database='comment',
                                charset='utf8mb4',
                                cursorclass=pymysql.cursors.DictCursor)
    dbdata = None

    # SQLを実行する
    try:
        with connection.cursor() as cursor:
            sql = "delete from return_api WHERE create_time < NOW() - INTERVAL 1 DAY;"
            cursor.execute(sql)
            connection.commit()
        with connection.cursor() as cursor:
            sql = "SELECT * FROM return_api WHERE toxic is NULL OR negapozi is NULL OR sarcasm is NULL OR spam is NULL OR construct is NULL"
            cursor.execute(sql)
            dbdata = cursor.fetchall()
        if not len(dbdata) == 0:
            toxic, negapozi, sarcasm, spam, construct = predict_all([i["comment"] for i in dbdata])
            connection = pymysql.connect(host='localhost',
                                        user='comment',
                                        password='comment',
                                        database='comment',
                                        charset='utf8mb4',
                                        cursorclass=pymysql.cursors.DictCursor)
            # SQLを実行する
            with connection.cursor() as cursor:
                for i in range(len(dbdata)):
                    sql = "UPDATE return_api SET toxic=%s, negapozi=%s, sarcasm=%s, spam=%s, construct=%s WHERE id=%s"
                    cursor.execute(sql, (toxic[i][0], negapozi[i][0], sarcasm[i][0], spam[i][0], construct[i][0], dbdata[i]["id"]))
            connection.commit()
    except:
        print("LOCKED")
        time.sleep(10)
    time.sleep(1)
    print("loop", dt.datetime.now())