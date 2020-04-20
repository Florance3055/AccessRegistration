const app = getApp()
let store = require("../../utils/store.js")
const DB = wx.cloud.database().collection("user")
let params = '';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    name: '', //姓名
    building: '', //楼号
    unit: '', //单元
    room: '', //房间号
    tel: '', //手机号
    idcard: '', //身份证
    type: '', //人员类型
    plot: '', //小区名称
    serious: '', //是否严重
    contact: '', //是否接触
    openid: ''
  },

  onLoad: function() {

    wx.cloud.callFunction({
      name: "getopenid",
      success(res) {
        this.openid = res.result.openid
        console.log("获取opendid成功", res.result.openid)
      },
      fail(res) {
        console.log("获取opendid失败", res)
      }
    })
  },

  onLaunch() {

  },

  onReady: function() {
    if (store.getItem("name") == '') {
      DB.where({
          _openid: this.openid
        })
        .get({
          success: function(res) {

            params = res.data[res.data.length - 1];
            console.log(params)

            store.setItem("name", params.name);
            store.setItem("building", params.building);
            store.setItem("unit", params.unit);
            store.setItem("room", params.room);
            store.setItem("tel", params.tel);
            store.setItem("idcard", params.idcard);
            store.setItem("type", params.type);
            store.setItem("plot", params.plot);
            store.setItem("serious", params.serious);
            store.setItem("contact", params.contact);

            wx.redirectTo({
              url: '/pages/information_after/information_after',
            })

            wx.showToast({
              title: '信息更新成功',
              icon: 'success',
              duration: 2000
            })

          },
          fail: function(res) {
            console.log(res)
          }
        })
    }
    this.setData({
      name: store.getItem("name"),
      building: store.getItem("building"),
      unit: store.getItem("unit"),
      room: store.getItem("room"),
      tel: store.getItem("tel"),
      idcard: store.getItem("idcard"),
      type: store.getItem("type"),
      plot: store.getItem("plot"),
      serious: store.getItem("serious"),
      contact: store.getItem("contact")

    })
  },
})