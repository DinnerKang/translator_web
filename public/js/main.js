var database = firebase.database();


var Source = [];
var Original = [];
var Translation = [];
var Time = [];
var week = new Array(7).fill(0);
// 원하는 문자 제외
var delete_arr = [
    "퇴사"
];

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

                for (var i = 0; i < data_length; i++) {
                    if (delete_arr.indexOf(data_values[i].Text) == -1) {
                        Source[i] = data_values[i].Soruce;
                        Original[i] = data_values[i].Text;
                    }
                    Time[i] = data_values[i].Time.substring(0, 4) + '-' 
                        + data_values[i].Time.substring(4, 6) + '-' 
                        + data_values[i].Time.substring(6, 8) + ' ' 
                        + data_values[i].Time.substring(8, 10) + ':' + data_values[i].Time.substring(10, 12);
                }
                // 정렬
                Original = makeResult(Original.reduce(reducer, []));
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
    res => {
        console.log('시간 : ', Time);
        var temp;
          for(var i=0, Time_len = Time.length;i<Time_len;i++){
            temp = new Date(Time[i]).getDay();
            week[temp]++;
         }
         console.log(week);
    }
);