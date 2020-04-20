const app = getApp()
let store = require("../../utils/store.js")

Page({
  data: {
    openid: '',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    iconList: [{
      icon: 'scan',
      color: 'red',
      badge: 0,
      name: '扫码出入'
    }, {
      icon: 'edit',
      color: 'orange',
      badge: 0,
      name: '完善信息'
    }, {
      icon: 'form',
      color: 'yellow',
      badge: 0,
      name: '我的信息'
    }, {
      icon: 'service',
      color: 'olive',
      badge: 0,
      name: '客服中心'
    }]
  },
  onLoad: function() {

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })

    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }

    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })

    }

    // wx.cloud.callFunction({
    //   name: "creadCode",
    //   success: function (res) {
    //     console.log(res.result);
    //     let qrImg = "data:image/png;base64," + wx.arrayBufferToBase64(res.result.buffer)
    //     console.log(qrImg)
    //   },
    //   fail(res) {
    //     console.log("获取失败", res)
    //   }
    // })

  },

  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo;
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }

})