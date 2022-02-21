let token = "test_token";
let SITE_KEY = "########################################";

const RESET_TABLE = {"columns":["datetime","author_name","authorProfileImageUrl",
                                    "channel_id","comment","comment_id","replyto",
                                    "like_cnt","video_id",
                                    "toxic","negapozi","sarcasm","spam","construct",
                                    "error"],
                        "data":[]}
let result_table = { ...RESET_TABLE };
let plotData = {
        group1: []
    };//plot用の処理
let chart = null;
let timer = null;
let all_count = 0;
//表示するcolumns
function display(){
    var result_table_copy = { ...result_table };
    var table = document.createElement("table");
    table.style = "width:100%";
    table.setAttribute("border", "1");
    var tr = document.createElement("tr");
    var displayList = ["datetime", 
                        "author_name",
                        "comment", 
                        "like_cnt", 
                        "toxic", 
                        "negapozi",
                        "sarcasm", 
                        "spam",
                        "construct"];
    // columnsの処理
    displayList.forEach((element) => {
        var th = document.createElement("th");
        if(element == "author_name"){
            //pass
        }else if(element == "datetime"){
            th.innerText = "🕒";
            th.style = "width:60px";
        }else if(element == "like_cnt"){
            th.innerText = "👍";
            th.style = "width:60px";
        }else if(element == "toxic"){
            th.innerText = "🤮";
            th.style = "width:60px";
        }else if(element == "negapozi"){
            th.innerText = "😊";
            th.style = "width:60px";
        }else if(element == "sarcasm"){
            th.innerText = "🤣";
            th.style = "width:60px";
        }else if(element == "spam"){
            th.innerText = "😈";
            th.style = "width:60px";
        }else if(element == "construct"){
            th.innerText = "🔨";
            th.style = "width:60px";
        }else{
            th.innerText = element;
        }
        var button = document.createElement("button");
        button.setAttribute('onclick', 'show_comment("' +  element + '", asc="asc", offset=0)');
        button.innerText = "↑"
        th.appendChild(button);
        var button = document.createElement("button");
        button.setAttribute('onclick', 'show_comment("' +  element + '", asc="desc", offset=0)');
        button.innerText = "↓"
        th.appendChild(button);
        tr.appendChild(th);
    });
    table.appendChild(tr);
    
    var x_button = document.getElementsByName('x');
    let x_checkValue = '';
    for (let i = 0; i < x_button.length; i++){
        if (x_button.item(i).checked){
            x_checkValue = x_button.item(i).value;
        }
    }
    var y_button = document.getElementsByName('y');
    let y_checkValue = '';
    for (let i = 0; i < y_button.length; i++){
        if (y_button.item(i).checked){
            y_checkValue = y_button.item(i).value;
        }
    }
    console.log("(x,y)", "(", x_checkValue, ",", y_checkValue, ")");

    plotData["group1"] = [];
    result_table_copy["data"].forEach((record) => {
        var comment_id = "";
        var author_name = "";
        var authorProfileImageUrl = "";
        var replyto = "";
        var toxic = 0;
        var negapozi = 0;
        var sarcasm = 0;
        var spam = 0;
        var construct = 0;
        var pointer = {}; // plot用の処理
        var reply_cnt = 0;

        if ("author_name" in record){
            author_name = record["author_name"];
        }
        if ("authorProfileImageUrl" in record){
            authorProfileImageUrl = record["authorProfileImageUrl"];
        }
        if ("comment_id" in record){
            comment_id = record["comment_id"];
            pointer["comment_id"] = record["comment_id"];
        }
        if ("replyto" in record){
            replyto = record["replyto"];
        }
        //plot用の処理
        if ("toxic" in record){
            toxic = parseFloat(record["toxic"])*100;
        }
        if ("negapozi" in record){
            negapozi = parseFloat(record["negapozi"])*100;
        }
        if ("sarcasm" in record){
            sarcasm = parseFloat(record["sarcasm"])*100;
        }
        if ("spam" in record){
            spam = parseFloat(record["spam"])*100;
        }
        if ("construct" in record){
            construct = parseFloat(record["construct"])*100;
        }
        if ("comment" in record){
            pointer["comment"] = record["comment"];
        }
        if ("reply_cnt" in record){
            if(record["reply_cnt"] != null){
                reply_cnt = record["reply_cnt"];
            }else{
                reply_cnt = 0;
            }
        }
        pointer["x"] = parseFloat(record[x_checkValue])*100;
        pointer["y"] = parseFloat(record[y_checkValue])*100;
        plotData["group1"].push(pointer);

        var tr = document.createElement("tr");
        displayList.forEach((element) => {
            var td = document.createElement("td");
            if (element == "author_name"){
                td.innerHTML = '<details><summary class="hide"><img src="' 
                    + authorProfileImageUrl 
                    + '" alt="'+ author_name
                    +'"></summary>'
                    + author_name
                    +'</details>';
            }else if (element == "comment"){
                var td_head = "<div style='overflow-wrap:anywhere; overflow-y:scroll; height:100px'>";
                var td_tail = "</div>";
                if (replyto == "toplevel"){
                    // discussion
                    var button_exist = ""
                    if (reply_cnt != 0){
                        button_exist = '<input type="button" value="discussion" onclick=discussion_button_show("'
                        + comment_id+'")>';
                    }
                    td.innerHTML = td_head + '[top]' 
                    + button_exist
                    + record[element].replaceAll('\n','<br>')
                    + td_tail;
                }else{
                    // discussion
                    var button_exist = '<input type="button" value="discussion" onclick=discussion_button_show("'
                        + replyto+'")>';
                    td.innerHTML = td_head + '[reply]' 
                    + button_exist
                    + record[element].replaceAll('\n','<br>')
                    + td_tail;
                }
            }else if ( element == "toxic" 
                    || element == "negapozi"
                    || element == "sarcasm"
                    || element == "spam"
                    || element == "construct"){
                td.innerText = parseInt(parseFloat(record[element])*100).toString(10) + "%";
            }else{//通常処理
                td.innerText = record[element];
            }
            tr.appendChild(td);
        });
        var a = document.createElement("a");
        a.id = comment_id;
        tr.appendChild(a);

        //filter処理
        table.appendChild(tr);
    });
    var td_div = document.getElementById("table_display");
    td_div.innerText = "";
    td_div.appendChild(table);
    
}

function discussion_button_show(comment_id){
    var postData = new FormData; // フォーム方式で送る場合
    postData.set('file_name', "discussion"); // set()で格納する
    postData.set('comment_id', comment_id);
    const data = {
        method: 'POST',
        body: postData
    };
    console.log("discussion_button_show", "->", comment_id);
    fetch('../cgi-bin/fetch_interface.php', data)
    .then((res) => res.text())
    .then((text) => {
        console.log("discussion_button_show", "<-", text);
        var json = JSON.parse(text);
        var dialog_discussion_content = document.getElementById("dialog_discussion_content");
        dialog_discussion_content.innerHTML = "";
        var content_text = '<dl class="faq_area">';
        var pre_cannel = "";
        json.forEach((record)=>{
            if (pre_cannel != record["author_name"]){
                pre_cannel = record["author_name"];
                content_text += '<div class="author"><img src="'+record["authorProfileImageUrl"]+'">'+record["author_name"];
            }else{
                //スタイルルールの追加
                var sheets = document.styleSheets
                var sheet = sheets[sheets.length - 1];
                sheet.insertRule(
                    '.faq_area .'+record["comment_id"].replace(".", "_")
                    + '::before {display:none;}',
                    sheet.cssRules.length
                );
            }
            content_text += '<p class="A '+record["comment_id"].replace(".", "_")+'">'
                        + record["comment"].replaceAll('\n','<br>') + '</p>' +"</div>";
        })
        content_text += '</dl>';
        dialog_discussion_content.innerHTML = content_text;
        var dialog_discussion = document.getElementById("dialog_discussion");
        dialog_discussion.show();
        var chart_container = document.getElementById("chart-container");
        chart_container.hidden = true;
    })
}
function discussion_button_close(){
    var dialog_discussion = document.getElementById("dialog_discussion");
    dialog_discussion.close();
    var chart_container = document.getElementById("chart-container");
    chart_container.hidden = false;
}
window.addEventListener('load', () => {
    // grecaptcha.ready(function() {
    //     grecaptcha.execute(SITE_KEY, {action:'Action_name'})
    //     .then(function(response_token) {
    //         token = response_token;
    //         console.log(token);
    //     });
    // });
    var search_buttton = document.getElementById("search_buttton");
    search_buttton.addEventListener("click", ()=> {
        //待機画面処理
        result_table = { ...RESET_TABLE };

        var postData = new FormData; // フォーム方式で送る場合
        postData.set('file_name', "challenge"); // set()で格納する
        postData.set('token', token);
        const data = {
            method: 'POST',
            body: postData
        };
        console.log("challenge", "->", token);
        fetch('../cgi-bin/fetch_interface.php', data)
        .then((res) => res.json())
        .then((json) => {
            if (json == 0){
                var loading_display = document.getElementById("loading_display");
                loading_display.innerText = "Now Loading";
                var video_ID = document.getElementById("video_ID");
                if (video_ID.value.slice(0,4) == "http"){
                    if(video_ID.value.match(/v=.*&/)){
                        video_ID.value = video_ID.value.match(/v=.*&/)[0].slice(2,-1)

                    }else if(video_ID.value.match(/v=.*$/)){
                        video_ID.value = video_ID.value.match(/v=.*$/)[0].slice(2)

                    }else if(video_ID.value.match(/youtu.be\/.*\?/)){
                        video_ID.value = video_ID.value.match(/youtu.be\/.*\?/)[0].slice(9,-1)

                    }else if(video_ID.value.match(/youtu.be\/.*/)){
                        video_ID.value = video_ID.value.match(/youtu.be\/.*/)[0].slice(9)
                    }
                }
                video_ID.readOnly = true;
                video_ID.style.backgroundColor = "#e9e9e9";
                youtube_video_api(video_ID.value);
                var get_new_flag = document.getElementById("get_new_flag").checked;
                youtube_comment_api(video_ID.value, get_new_flag);
                timer = setInterval('toplevel_rate()', 1000);
            }else{
                var loading_display = document.getElementById("loading_display");
                loading_display.innerText = "Try again.";
            }
        })
    });
    resize();
});
function youtube_video_api(video_ID){
    var postData = new FormData; // フォーム方式で送る場合
    postData.set('file_name', "youtube_video_api.py"); // set()で格納する
    postData.set('video_ID', video_ID);
    const data = {
        method: 'POST',
        body: postData
    };
    console.log("youtube_video_api", "->", video_ID);
    fetch('../cgi-bin/fetch_interface.php', data)
    .then((res) => res.text())
    .then((text) => {
        console.log("youtube_video_api", "<-", text);
        json = JSON.parse(text);
        var video_title = document.getElementById("video_title");
        video_title.innerHTML = 
            '<img src="' + json["url"] + '">' + "<br>"
            + "<a href='https://www.youtube.com/watch?v=" + document.getElementById("video_ID").value + "' target='_blank'>"
            + "<strong>" + json["title"] + "</strong> " + "</a>"
            + " ／ " + json["channelTitle"] 
            + "<br>"
            + '<div style="border: 1px solid">'
            + '<details><summary>動画概要</summary>' + json["description"].replaceAll("\n", "<br>") + "</details>"
            + '</div>';
    })
}
function youtube_comment_api(video_ID, get_new_flag){
    //fetch処理
    var postData = new FormData; // フォーム方式で送る場合
    postData.set('file_name', "youtube_api.py"); // set()で格納する
    postData.set('video_ID', video_ID);
    if (get_new_flag){
        postData.set('get_new_flag', 1);
    }else{
        postData.set('get_new_flag', 0);
    }
    const data = {
        method: 'POST',
        body: postData
    };
    console.log("youtube_comment_api", "->", video_ID);
    fetch('../cgi-bin/fetch_interface.php', data)
    .then((res) => res.text())
    .then((text) => {
        console.log("youtube_comment_api_end", text)
        var loading_display = document.getElementById("loading_display");
        loading_display.innerText = "";
    })
    .catch((error) => {
        console.error('Error:', error);
        console.log("youtube_comment_api_end");
    });
}
function show_comment(col_name, asc, offset=null){
    var limit = document.getElementById("limit").value;
    if (offset == null){
        var offset = document.getElementById("offset").value;
    }else{
        document.getElementById("offset").value = offset;
    }
    if (col_name == null){
        var col_name = document.getElementById("col_name").value;
    }else{
        document.getElementById("col_name").value = col_name;
    }
    if (asc == null){
        var asc = document.getElementById("asc").value;
    }else{
        document.getElementById("asc").value = asc;
    }
    //fetch準備
    var video_ID = document.getElementById("video_ID").value;
    var postData = new FormData; // フォーム方式で送る場合

    //filter処理
    var toxic_filter = document.getElementById('toxic_filter').value;
    var toxic_filter_end = document.getElementById('toxic_filter_end').value;
    var positive_filter = document.getElementById('positive_filter').value;
    var positive_filter_end = document.getElementById('positive_filter_end').value;
    var sarcasm_filter = document.getElementById('sarcasm_filter').value;
    var sarcasm_filter_end = document.getElementById('sarcasm_filter_end').value;
    var spam_filter = document.getElementById('spam_filter').value;
    var spam_filter_end = document.getElementById('spam_filter_end').value;
    var construct_filter = document.getElementById('construct_filter').value;
    var construct_filter_end = document.getElementById('construct_filter_end').value;
    var word_filter = document.getElementById('word_filter').value;
    postData.set('toxic_filter', toxic_filter/100);
    postData.set('toxic_filter_end', toxic_filter_end/100);
    postData.set('positive_filter', positive_filter/100);
    postData.set('positive_filter_end', positive_filter_end/100);
    postData.set('sarcasm_filter', sarcasm_filter/100);
    postData.set('sarcasm_filter_end', sarcasm_filter_end/100);
    postData.set('spam_filter', spam_filter/100);
    postData.set('spam_filter_end', spam_filter_end/100);
    postData.set('construct_filter', construct_filter/100);
    postData.set('construct_filter_end', construct_filter_end/100);
    postData.set('word_filter', word_filter);

    //fetch処理
    postData.set('file_name', "show_comment"); // set()で格納する
    postData.set('video_ID', video_ID);
    postData.set('limit', limit);
    postData.set('offset', offset);
    postData.set('asc', asc);
    postData.set('col_name', col_name);
    const data = {
        method: 'POST',
        body: postData
    };
    fetch('../cgi-bin/fetch_interface.php', data)
    .then((res) => res.text())
    .then((text) => {
        console.log("show_comment", "<-", text);
        json = JSON.parse(text);
        if (JSON.stringify(result_table["data"]) != JSON.stringify(json)){
            console.log("create_new_table");
            result_table["data"] = json;
            display();
            draw_chart();
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        console.log("show_comment_end");
    });
}

function toplevel_rate(){
    show_comment(null, null);
    var video_ID = document.getElementById("video_ID").value;
    var postData = new FormData; // フォーム方式で送る場合
    postData.set('file_name', "toplevel_rate"); // set()で格納する
    
    //filter処理
    var toxic_filter = document.getElementById('toxic_filter').value;
    var toxic_filter_end = document.getElementById('toxic_filter_end').value;
    var positive_filter = document.getElementById('positive_filter').value;
    var positive_filter_end = document.getElementById('positive_filter_end').value;
    var sarcasm_filter = document.getElementById('sarcasm_filter').value;
    var sarcasm_filter_end = document.getElementById('sarcasm_filter_end').value;
    var spam_filter = document.getElementById('spam_filter').value;
    var spam_filter_end = document.getElementById('spam_filter_end').value;
    var construct_filter = document.getElementById('construct_filter').value;
    var construct_filter_end = document.getElementById('construct_filter_end').value;
    var word_filter = document.getElementById('word_filter').value;
    postData.set('toxic_filter', toxic_filter/100);
    postData.set('toxic_filter_end', toxic_filter_end/100);
    postData.set('positive_filter', positive_filter/100);
    postData.set('positive_filter_end', positive_filter_end/100);
    postData.set('sarcasm_filter', sarcasm_filter/100);
    postData.set('sarcasm_filter_end', sarcasm_filter_end/100);
    postData.set('spam_filter', spam_filter/100);
    postData.set('spam_filter_end', spam_filter_end/100);
    postData.set('construct_filter', construct_filter/100);
    postData.set('construct_filter_end', construct_filter_end/100);
    postData.set('word_filter', word_filter);

    postData.set('video_ID', video_ID);
    const data = {
        method: 'POST',
        body: postData
    };
    console.log("toplevel_rate", "->", video_ID);
    fetch('../cgi-bin/fetch_interface.php', data)
    .then((res) => res.text())
    .then((text) => {
        console.log("toplevel_rate", "<-", text);
        json = JSON.parse(text);
        document.getElementById("toplevel_count").value = json["toplevel_count"];
        document.getElementById("all_count").value = json["all_count"];
    })
}
window.addEventListener('resize', ()=>{
    resize();
});
function resize(){
    var td_div = document.getElementById("table_display");
    td_div.style = "width:"+document.documentElement.clientWidth - 10+"px;";
    var chart_container = document.getElementById("chart-container");
    if (document.documentElement.clientWidth < document.documentElement.clientHeight){
        chart_container.style = "position:relative;"
        + "width:"+(document.documentElement.clientWidth/2 - 50) + "px;"
        + "height:"+(document.documentElement.clientWidth/2 - 50) + "px;";
    }else{
        chart_container.style = "position:relative;"
        + "width:"+(document.documentElement.clientHeight/2 - 50) + "px;"
        + "height:"+(document.documentElement.clientHeight/2 - 50) + "px;";
    }
}

function press_previous(){
    var offset = document.getElementById("offset");
    var limit = document.getElementById("limit");
    offset.value = parseInt(offset.value) - parseInt(limit.value);
    if (parseInt(offset.value) < 0){
        offset.value = 0;
    }
    show_comment(null, null);
}
function press_next(){
    var offset = document.getElementById("offset");
    var limit = document.getElementById("limit");
    var all_count = document.getElementById("all_count");
    if (parseInt(offset.value)+parseInt(limit.value) < all_count.value){
        offset.value = parseInt(offset.value) + parseInt(limit.value);
        show_comment(null, null);
    }
}
