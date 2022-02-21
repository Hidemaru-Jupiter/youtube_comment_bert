<?php
$python3 = "./python/bin/python3";
// $SECRET_KEY = "########################################";

if($_POST['file_name'] == "youtube_api.py"){
    $command="{$python3} youtube_api.py {$_POST['video_ID']} {$_POST['get_new_flag']}";
    exec($command, $output);
    echo $output[0];
}else if($_POST['file_name'] == "youtube_video_api.py"){
    $command="{$python3} youtube_video_api.py {$_POST['video_ID']}";
    exec($command, $output);
    echo $output[0];

}else if($_POST['file_name'] == "toplevel_rate"){
    $pdo;
    $stmt;
    $rows;
    /**
     * データベース接続
     */
    try {
        $pdo = new PDO(
            'mysql:dbname=comment; host=localhost; charset=utf8mb4',/*テスト用*/
            'comment',
            'comment',
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );
    } catch (PDOException $e) {
        echo -500;
    }
    try{
        $word_filter_list = explode(" ", $_POST['word_filter']);
        $word_filter_sql = "";
        for ($i=0; $i<count($word_filter_list); $i++){
            $word_filter_sql = $word_filter_sql . "AND comment like :word_filter_" . $i . " ";
        }
        $stmt = $pdo->prepare(
            "select count(id) from return_api WHERE video_id=:video_id "
            . "AND ((:toxic_filter <= toxic AND toxic <= :toxic_filter_end) OR toxic is NULL) "
            . "AND ((:positive_filter <= negapozi AND negapozi <= :positive_filter_end) OR toxic is NULL) "
            . "AND ((:spam_filter <= spam AND spam <= :spam_filter_end) OR toxic is NULL) "
            . "AND ((:sarcasm_filter <= sarcasm AND sarcasm <= :sarcasm_filter_end) OR toxic is NULL) "
            . "AND ((:construct_filter <= construct AND construct <= :construct_filter_end) OR toxic is NULL) "
            . $word_filter_sql
        );
        $stmt->bindValue(':video_id', $_POST['video_ID'], PDO::PARAM_STR);
        // filter
        $stmt->bindValue(':toxic_filter', $_POST['toxic_filter'], PDO::PARAM_STR);
        $stmt->bindValue(':toxic_filter_end', $_POST['toxic_filter_end'], PDO::PARAM_STR);
        $stmt->bindValue(':positive_filter', $_POST['positive_filter'], PDO::PARAM_STR);
        $stmt->bindValue(':positive_filter_end', $_POST['positive_filter_end'], PDO::PARAM_STR);
        $stmt->bindValue(':sarcasm_filter', $_POST['sarcasm_filter'], PDO::PARAM_STR);
        $stmt->bindValue(':sarcasm_filter_end', $_POST['sarcasm_filter_end'], PDO::PARAM_STR);
        $stmt->bindValue(':spam_filter', $_POST['spam_filter'], PDO::PARAM_STR);
        $stmt->bindValue(':spam_filter_end', $_POST['spam_filter_end'], PDO::PARAM_STR);
        $stmt->bindValue(':construct_filter', $_POST['construct_filter'], PDO::PARAM_STR);
        $stmt->bindValue(':construct_filter_end', $_POST['construct_filter_end'], PDO::PARAM_STR);
        for ($i=0; $i<count($word_filter_list); $i++){
            $stmt->bindValue(':word_filter_'.$i, "%".$word_filter_list[$i]."%", PDO::PARAM_STR);
        }
        $stmt->execute();
        $rows = $stmt->fetchAll();
        $all_count = $rows[0]['count(id)'];

        $stmt = $pdo->prepare(
            'select count(id) from return_api WHERE replyto="toplevel" AND video_id=:video_id '
            . "AND ((:toxic_filter <= toxic AND toxic <= :toxic_filter_end) OR toxic is NULL) "
            . "AND ((:positive_filter <= negapozi AND negapozi <= :positive_filter_end) OR toxic is NULL) "
            . "AND ((:spam_filter <= spam AND spam <= :spam_filter_end) OR toxic is NULL) "
            . "AND ((:sarcasm_filter <= sarcasm AND sarcasm <= :sarcasm_filter_end) OR toxic is NULL) "
            . "AND ((:construct_filter <= construct AND construct <= :construct_filter_end) OR toxic is NULL) "
            . $word_filter_sql
        );
        $stmt->bindValue(':video_id', $_POST['video_ID'], PDO::PARAM_STR);
        // filter
        $stmt->bindValue(':toxic_filter', $_POST['toxic_filter'], PDO::PARAM_STR);
        $stmt->bindValue(':toxic_filter_end', $_POST['toxic_filter_end'], PDO::PARAM_STR);
        $stmt->bindValue(':positive_filter', $_POST['positive_filter'], PDO::PARAM_STR);
        $stmt->bindValue(':positive_filter_end', $_POST['positive_filter_end'], PDO::PARAM_STR);
        $stmt->bindValue(':sarcasm_filter', $_POST['sarcasm_filter'], PDO::PARAM_STR);
        $stmt->bindValue(':sarcasm_filter_end', $_POST['sarcasm_filter_end'], PDO::PARAM_STR);
        $stmt->bindValue(':spam_filter', $_POST['spam_filter'], PDO::PARAM_STR);
        $stmt->bindValue(':spam_filter_end', $_POST['spam_filter_end'], PDO::PARAM_STR);
        $stmt->bindValue(':construct_filter', $_POST['construct_filter'], PDO::PARAM_STR);
        $stmt->bindValue(':construct_filter_end', $_POST['construct_filter_end'], PDO::PARAM_STR);
        for ($i=0; $i<count($word_filter_list); $i++){
            $stmt->bindValue(':word_filter_'.$i, "%".$word_filter_list[$i]."%", PDO::PARAM_STR);
        }
        $stmt->execute();
        $rows = $stmt->fetchAll();
        $toplevel_count = $rows[0]['count(id)'];

        $array = array(
            "all_count" => $all_count,
            "toplevel_count" => $toplevel_count
        );
        echo json_encode($array);
    }catch(Exception $e){
        echo $e;
    }
}else if($_POST['file_name'] == "discussion"){
    $pdo;
    $stmt;
    $rows;
    /**
     * データベース接続
     */
    try {
        $pdo = new PDO(
            'mysql:dbname=comment; host=localhost; charset=utf8mb4',/*テスト用*/
            'comment',
            'comment',
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );
    } catch (PDOException $e) {
        echo -500;
    }
    try{
        $stmt = $pdo->prepare(
            "SELECT * FROM return_api WHERE comment_id=:comment_id OR replyto=:comment_id ORDER BY datetime ASC");
        $stmt->bindValue(':comment_id', $_POST['comment_id'], PDO::PARAM_STR);
        $stmt->execute();
        $rows = $stmt->fetchAll();
        echo json_encode($rows);
    }catch(Exception $e){
        echo $e;
    }
}else if($_POST['file_name'] == "show_comment"){
    $pdo;
    $stmt;
    $rows;
    /**
     * データベース接続
     */
    try {
        $pdo = new PDO(
            'mysql:dbname=comment; host=localhost; charset=utf8mb4',/*テスト用*/
            'comment',
            'comment',
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );
    } catch (PDOException $e) {
        echo -500;
    }
    try{
        $order_items = array("datetime", "author_name", "authorProfileImageUrl",
          "channel_id", "comment", "comment_id", "replyto", "like_cnt", "video_id",
          "toxic", "negapozi", "spam", "sarcasm", "construct");
        $key = array_search($_POST['col_name'], $order_items);
        $order = $order_items[$key];
        if($_POST['asc'] == "asc"){
            $asc = " ASC";
        }else{
            $asc = " DESC";
        }
        $word_filter_list = explode(" ", $_POST['word_filter']);
        $word_filter_sql = "";
        for ($i=0; $i<count($word_filter_list); $i++){
            $word_filter_sql = $word_filter_sql . "AND comment like :word_filter_" . $i . " ";
        }
        $stmt = $pdo->prepare(
            "select * from return_api WHERE video_id=:video_id "
            . "AND ((:toxic_filter <= toxic AND toxic <= :toxic_filter_end) OR toxic is NULL) "
            . "AND ((:positive_filter <= negapozi AND negapozi <= :positive_filter_end) OR toxic is NULL) "
            . "AND ((:spam_filter <= spam AND spam <= :spam_filter_end) OR toxic is NULL) "
            . "AND ((:sarcasm_filter <= sarcasm AND sarcasm <= :sarcasm_filter_end) OR toxic is NULL) "
            . "AND ((:construct_filter <= construct AND construct <= :construct_filter_end) OR toxic is NULL) "
            . $word_filter_sql
            . "ORDER BY "
            . $order
            . $asc
            . ", id asc LIMIT :limit OFFSET :offset"
        );
        $stmt->bindValue(':video_id', $_POST['video_ID'], PDO::PARAM_STR);
        // filter
        $stmt->bindValue(':toxic_filter', $_POST['toxic_filter'], PDO::PARAM_STR);
        $stmt->bindValue(':toxic_filter_end', $_POST['toxic_filter_end'], PDO::PARAM_STR);
        $stmt->bindValue(':positive_filter', $_POST['positive_filter'], PDO::PARAM_STR);
        $stmt->bindValue(':positive_filter_end', $_POST['positive_filter_end'], PDO::PARAM_STR);
        $stmt->bindValue(':sarcasm_filter', $_POST['sarcasm_filter'], PDO::PARAM_STR);
        $stmt->bindValue(':sarcasm_filter_end', $_POST['sarcasm_filter_end'], PDO::PARAM_STR);
        $stmt->bindValue(':spam_filter', $_POST['spam_filter'], PDO::PARAM_STR);
        $stmt->bindValue(':spam_filter_end', $_POST['spam_filter_end'], PDO::PARAM_STR);
        $stmt->bindValue(':construct_filter', $_POST['construct_filter'], PDO::PARAM_STR);
        $stmt->bindValue(':construct_filter_end', $_POST['construct_filter_end'], PDO::PARAM_STR);
        for ($i=0; $i<count($word_filter_list); $i++){
            $stmt->bindValue(':word_filter_'.$i, "%".$word_filter_list[$i]."%", PDO::PARAM_STR);
        }
        $stmt->bindValue(':limit', $_POST['limit'], PDO::PARAM_INT);
        $stmt->bindValue(':offset', $_POST['offset'], PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();
        echo json_encode($rows);
    }catch(Exception $e){
        echo $e;
    }
}
else if($_POST['file_name'] == "challenge"){
    // $URL = 'https://www.google.com/recaptcha/api/siteverify?secret='
    // .$SECRET_KEY
    // .'&response='
    // .$_POST['token'];
    // $recap_response = file_get_contents($URL);
    // // JSON形式をPHPオブジェクトにデコード
    // $recap_response = json_decode($recap_response);
    // // successプロパティ（trueかfalseか）で判定
    // if ($recap_response->success == false) {
    //     echo -500;
    // }else{
        echo 0;
    // }
}
?>
