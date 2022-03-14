# youtube_comment_analysis
「複数 BERT モデルで作るツールによるYouTube コメントの可読性改善」内で論じているシステムです。

## デモサイト
https://utubecomment.com/comment.html

## setup
必須
* api_key.pyのAPI_KEYにYouTube Data APIで取得したAPIを入力する。

## モデルのダウンロード
GoogleDriveにて公開---https://drive.google.com/drive/folders/1ejlJzkaM67R5Eo-VCsBs6xT8PSg4dVDP?usp=sharing

## ファイル構成例
```
/var/www/cgi-bin
┣constructive（モデル）
┣sentiment（モデル）
┣toxic（モデル）
┣sarcasm（モデル）
┣spam （モデル）
┣youtube_api.py
┣fetch_interface.php
┗youtube_video_api.py

/var/www/html
┣chart.js
┣comment.css
┣comment.html
┗content.js

常時実行
┗toxic.py
```
