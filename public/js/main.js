var database = firebase.database();

var data_length;
var korean = [];
var english = [];
var time_table = [];


function writeUserData() {
    return new Promise(function (resolve, reject) {
        firebase
            .database()
            .ref("translate/success")
            .on("value", function (snapshot) {
                console.log(snapshot.val());
                var data = snapshot.val();
                var len = document.getElementById("data_length");
                var _values = Object.values(data);

                data_length = Object.keys(data).length;
                len.innerText = data_length;

                for (var i = 0; i < data_length; i++) {
                    korean[i] = _values[i].Korean;
                    english[i] = _values[i].English;
                    time_table[i] = _values[i].Time;
                }

                korean = makeResult(korean.reduce(reducer, []));
                english = makeResult(english.reduce(reducer, {}));
                console.log(korean);
                
                resolve(korean);
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

//비속어 제거용 준비
function array_diff(a, b) {
    var tmp={}, res=[];
    for(var i=0;i<a.length;i++) tmp[a[i]]=1;
    for(var i=0;i<b.length;i++) { if(tmp[b[i]]) delete tmp[b[i]]; }
    for(var k in tmp) res.push(k);
    return res;
  }


writeUserData().then(
    res => {
        console.log(res);
        var option = {
            list: res,
            weightFactor: 20
        }
        WordCloud(document.getElementById('my_canvas'), option);
    }
);