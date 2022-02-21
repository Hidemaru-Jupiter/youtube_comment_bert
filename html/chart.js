function draw_chart(){
    //描画の処理
    // データ
    var data = {
        datasets: [
        // Group 1
        {
            label: 'Group1',
            data: plotData.group1,
            // マーカー 背景色
            backgroundColor: 'rgba(0, 159, 255, 0.45)',
            // マーカー 枠線の色
            borderColor: 'rgba(0, 159, 255, 0.5)',
            // マーカー 大きさ
            pointRadius: 5,
        }
        ],
    }
    // オプション
    var options = {
        tooltips: {
            callbacks:{
                label: function (tooltipItem, data) {
                    var comment = data.datasets[0].data[tooltipItem.index]["comment"];
                    var words = comment.split(' ');
                    if (words.length < 28){
                        return [words.slice(0,7).join(' '),
                                words.slice(7,14).join(' '),
                                words.slice(21,28).join(' ')];
                    } else{
                        return [words.slice(0,7).join(' '),
                                words.slice(7,14).join(' '),
                                words.slice(21,28).join(' ')+"....."];
                    }
                }
            },
            displayColors:false
        },
        // 自動サイズ
        responsive: true,
        maintainAspectRatio: false,
        // タイトル
        // title: {
        //     display: true,
        //     fontSize: 14,
        //     fontStyle: 'normal', // 太字にしない
        //     padding: 20,
        //     text: 'x:toxic_y:negapozi'
        // },
        // 凡例
        legend: {
            display:false
        },
        // 軸
        scales: {
        // X 軸
            xAxes: [{
                // 軸ラベル
                scaleLabel: {
                    display: true,
                    labelString: "x",
                },
                // 軸線のスタイル
                gridLines: {
                    color: '#f3f3f3',
                    zeroLineColor: '#ddd'
                },
                // 目盛り
                ticks: {
                    fontColor: '#333',
                    min: 0,
                    max:100,
                    stepSize: 2,
                },
            }],
            // Y 軸
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: "y",
                },
                gridLines: {
                    color: '#f3f3f3',
                    zeroLineColor: '#ddd'
                },
                ticks: {
                    fontColor: '#333',
                    min: 0,
                    max:100,
                    stepsize: 25,
                }
            }]
        }
    };
    // 散布図を描画
    var canvas = document.getElementById('chart-area');
    var ctx = canvas.getContext('2d');
    if (chart === null){
        chart = new Chart(ctx, {
            type: 'scatter',
            data: data,
            options: options,
        });
        canvas.addEventListener('click', function(event) {
            let item = chart.getElementAtEvent(event);
            
            if (item.length == 0) {
                console.log('no element found.')
                return;
            }
            
            item = item[0];
            let one_data = item._chart.config.data.datasets[item._datasetIndex].data[item._index];
            console.log("chart.js:", "x:",one_data.x, "y:", one_data.y,
             "comment:", one_data.comment, "comment_id:", one_data.comment_id);
            window.location.hash = one_data.comment_id;
        });
    }else{
        chart.data = data;
        chart.options = options;
        chart.update();
    }
}
