// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();
const db = cloud.database();

function getDate() {
  let time = (new Date()).toString().split(" ");
  let day = time[0];
  let month = time[1];
  let date = time[2];
  let year = time[3];

  let result = 'DAY MONTH DATE YEAR'.replace('DAY', day).replace('MONTH', month).replace('DATE', date).replace('YEAR', year);
  return result;
}

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()

  var success = false; //放行结果
  var reason = ""; //原因

  //用户openid和出入类型
  let openid = wxContext.OPENID;
  let type = event.type;

  //用户、小区和记录集合
  let userCollection = db.collection('user');
  let plotCollection = db.collection('plot');
  let recordCollection = db.collection('record');

  if (type == "out") {
    //获取小区代码，楼号，单元号和房间号
    let userData = await userCollection.where({
      openid: openid
    }).get();
    // let plot = userData.data.plot;
    // let building = userData.data.building;
    // let unit = userData.data.unit;
    // let room = userData.data.room;

    let plot = "敬贤楼";
    let building = 1;
    let unit = 1;
    let room = 202;

    //获取出门次数限制
    let limitData = await plotCollection.where({
      plot: plot
    }).get();
    // let limit = limitData.data.limit;
    let limit = 3;

    //获取当日出门次数
    let countData = await recordCollection.where({
      plot: plot,
      building: building,
      unit: unit,
      room: room,
      // time: db.RegExp({
      //   regexp: getDate(),
      //   options: "i"
      // }),
      type: "out"
    }).count();
    let count = countData.total;

    //如果不限制次数或是未达到次数限制
    if (limit == -1 || limit > count) {
      //那就允许出门，记录事件然后返回结果
      recordCollection.add({
        openid: openid,
        plot: plot,
        building: building,
        unit: unit,
        room: room,
        type: "out",
        time: (new Date()).toString()
      }).catch((err) => {
        console.log(err);
      });

      success = true;
    } else {
      success = false;
      reason = "出行次数超上限"
    }
  } else { //进门没有限制，直接记录
    recordCollection.add({
      openid: openid,
      plot: plot,
      building: building,
      unit: unit,
      room: room,
      type: "in",
      time: (new Date()).toString()
    });

    success = true;
  }

  return success;
}