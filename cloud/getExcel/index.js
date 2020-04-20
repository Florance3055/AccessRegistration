const cloud = require('wx-server-sdk')
//这里最好也初始化一下你的云开发环境
cloud.init()
//操作excel用的类库
const xlsx = require('node-xlsx');

const db = cloud.database();

// 云函数入口函数
exports.main = async(event, context) => {

  var res = await db.collection('user').get()
  var userdata = res.data;

  //1,定义excel表格名
  let dataCVS = 'test.xlsx'
  
  //2，定义存储数据的
  let alldata = [];
  let row = ['姓名', '楼号', '单元', '房间号', '手机号', '身份证', '人员类型', '小区名字', '是否到过疫情严重地区', '是否接触过疑似病人']; //表属性
  alldata.push(row);

  for (let key in userdata) {
    let arr = [];
    arr.push(userdata[key].name);
    arr.push(userdata[key].building);
    arr.push(userdata[key].unit);
    arr.push(userdata[key].room);
    arr.push(userdata[key].tel);
    arr.push(userdata[key].idcard);
    arr.push(userdata[key].type);
    arr.push(userdata[key].plot);
    arr.push(userdata[key].serious);
    arr.push(userdata[key].contact);
    alldata.push(arr)
  }

  //3，把数据保存到excel里
  var buffer = await xlsx.build([{
    name: "mySheetName",
    data: alldata
  }]);

  //4，把excel文件保存到云存储里
  return await cloud.uploadFile({
    cloudPath: dataCVS,
    fileContent: buffer, //excel二进制文件
  })

}