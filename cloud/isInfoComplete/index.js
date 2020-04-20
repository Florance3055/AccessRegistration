// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init(

);
const db = cloud.database();

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext();

  var infoComplete = false;

  var openid = wxContext.OPENID;

  var res = await db.collection('user').where({
    _openid: openid // 填入当前用户 openid
  }).get()

  if (res.data[0]){
    infoComplete = true;
  }

  return {
    infoComplete: infoComplete
  }
}