var database = firebase.database();


var Source = [];
var Original = [];
var Translation = [];
var Time = [];
var week = new Array(7).fill(0);
var Day = [];
// 원하는 문자 제외
var delete_arr = [
    "퇴사",
    "<",
    ">",
    "`",
    "%"
];
console.log('현재 금지어 : ', delete_arr);
// 로딩 함수

const load_percent = document.getElementById('load_percent');
const loading_page = document.getElementById('loading_page');
const main = document.getElementById('main');
const body = document.getElementsByTagName('body')[0];

let percent = 0;
let loading = setInterval(function () {
    percent = percent + 1;
    let percentScript = percent + '%';
    load_percent.innerHTML = percentScript;
    if (percent == 99) {
        setTimeout(function () {
            load_percent.innerHTML = '네트워크 속도가 느립니다...';
        }, 2000);
        clearInterval(loading);
    }
}, 10);

// 차트 준비
// 데이터 변환 준비

function writeUserData() {
    return new Promise(function (resolve, reject) {
        firebase
            .database()
            .ref("translate/success")
            .on("value", function (snapshot) {
                console.log(snapshot.val());
                console.log('개수 : ', Object.keys(snapshot.val()).length);
                var data = snapshot.val();
                var len = document.getElementById("data_length");
                var data_values = Object.values(data);

                var data_length = Object.keys(data).length;
                len.innerText = data_length;


                console.log('데이터 : ', data_values);
                var temp = false;
                for (var i = 0; i < data_length; i++) {
                    for (var j = 0, delete_arr_len = delete_arr.length; j < delete_arr_len; j++) {
                        if (data_values[i].Text.includes(delete_arr[j])) temp = true;
                    }
                    //  if (delete_arr.indexOf(data_values[i].Text) == -1) {
                    if (!temp) {
                        Source[i] = data_values[i].Source;
                        Original[i] = data_values[i].Text;
                    }
                    Time[i] = data_values[i].Time.substring(0, 4) + '-' +
                        data_values[i].Time.substring(4, 6) + '-' +
                        data_values[i].Time.substring(6, 8) + ' ' +
                        data_values[i].Time.substring(8, 10) + ':' + data_values[i].Time.substring(10, 12);
                    temp = false;
                }

                // 정렬
                Original = makeResult(Original.reduce(reducer, []));
                Source = makeResult(Source.reduce(reducer, []));
                console.log('정렬 후', Original);

                resolve(Original);
            });
    });
}
var reducer = function (acc, val, idx, arr) {
    if (acc.hasOwnProperty(val)) {
        acc[val] = acc[val] + 1;
    } else {
        acc[val] = 1;
    }
    return acc;
};

function makeResult(obj) {
    var arr = [];
    var key = Object.keys(obj);
    var freq = Object.values(obj);
    for (var i = 0; i < key.length; i++) {
        arr.push([key[i], freq[i]]);
    }

    return arr;
}


// Word Cloud 만들기
writeUserData().then(
    res => {
        var option = {
            list: res,
            weightFactor: 15,
            shape: 'circle'
        }
        WordCloud(document.getElementById('my_canvas'), option);
    }
).then(
    // Week Chart 만들기
    res => {
        var temp;
        for (var i = 0, Time_len = Time.length; i < Time_len; i++) {
            temp = new Date(Time[i]).getDay();
            week[temp]++;
        }
        // week bar chart
        var week_chart = echarts.init(document.getElementById('week_chart'));
        var week_chart_percent = echarts.init(document.getElementById('week_chart_percent'));
        var option = {
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                data: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            },
            yAxis: {
                name: '사용 횟수',
                type: 'value'
            },
            series: [{
                type: 'line',
                data: [week[0], week[1], week[2], week[3], week[4], week[5], week[6]]
            }],
            color: [
                '#5585ff'
            ]
        };
        week_chart.setOption(option);

        option = {
            tooltip: {
                trigger: 'item',
                formatter: "{c} ({d}%)"
            },
            legend: {
                orient: 'horizontal',
                x: 'center',
                data: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            },
            series: [{
                type: 'pie',
                data: [{
                        value: week[0],
                        name: 'Sunday'
                    },
                    {
                        value: week[1],
                        name: 'Monday'
                    },
                    {
                        value: week[2],
                        name: 'Tuesday'
                    },
                    {
                        value: week[3],
                        name: 'Wednesday'
                    },
                    {
                        value: week[4],
                        name: 'Thursday'
                    },
                    {
                        value: week[5],
                        name: 'Friday'
                    },
                    {
                        value: week[6],
                        name: 'Saturday'
                    },
                ],
            }],
            color: [
                '#333333', '#5585ff', 'rgb(6, 234, 143)', 'rgb(210, 28, 15)', 'yellow', '#8319ce', 'gray'
            ]
        };
        week_chart_percent.setOption(option);
    }
).then(
    res => {
        console.log('Loading 완료');
        loading_page.style.display = 'none';
        body.style.overflow = 'auto';
        main.style.visibility = 'visible';
        clearInterval(loading);
    }
).then(
    res => {

        for (var i = 0, Time_len = Time.length; i < Time_len; i++) {
            Day[i] = Time[i].split(' ')[0];
        }
        Day = makeResult(Day.reduce(reducer, []));
        for (var a = 1, Day_len = Day.length; a < Day_len; a++) {
            Day[a][1] = Day[a][1] + Day[a - 1][1];
        }
        console.log(Day);

        // 성장 차트
        var growth_chart = echarts.init(document.getElementById('growth_chart'));
        var option = {
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'time',
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                name: '누적 데이터',
                type: 'value'
            },
            series: [{
                type: 'line',
                data: Day
            }],
            color: [
                '#A566FF'
            ]
        };
        growth_chart.setOption(option);
    }
);