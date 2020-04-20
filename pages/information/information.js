import WxValidate from '../../utils/WxValidate'
const app = getApp();
let store = require("../../utils/store.js")
const DB = wx.cloud.database().collection("user")
let params = {
  name: '',
  building: '',
  unit: '',
  room: '',
  tel: '',
  idcard: '',
  type: 0,
  plot: 0,
  serious: false,
  contact: false
};
let typeIndex = ['业主', '租户', '访客'];
let plotIndex = ['敬贤楼'];
let openid = '';
let infoComplete = false;

Page({
  data: {
    form: {
      name: '',
      building: '',
      unit: '',
      room: '',
      tel: '',
      idcard: ''
    },
    agree: false,
    yesorno_1: false,
    yesorno_2: false,
    index_1: 0,
    index_2: 0,
    picker_1: ['业主', '租户', '访客'],
    picker_2: ['敬贤楼'],
    modalName: null,
  },

  PickerChange_1: function(e) {
    this.setData({
      index_1: e.detail.value
    })
    params.type = parseInt(e.detail.value);
    console.log('radio发生change事件，params.type值为：', params.type)
  },

  PickerChange_2: function(e) {
    this.setData({
      index_2: e.detail.value
    })
    params.plot = parseInt(e.detail.value);
    console.log('radio发生change事件，params.plot值为：', params.plot)
  },

  RadioChange_1: function(e) {
    this.yesorno_1 = !this.yesorno_1;
    params.serious = this.yesorno_1;
    console.log('radio发生change事件，params.serious值为：', this.yesorno_1)
  },

  RadioChange_2: function(e) {
    this.yesorno_2 = !this.yesorno_2;
    params.contact = this.yesorno_2;
    console.log('radio发生change事件，params.contact值为：', this.yesorno_2)
  },

  CheckboxChange: function(e) {
    this.agree = !this.agree;
  },

  onLoad: function() {
    this.agree = false;
    this.initValidate()
    console.log(this.WxValidate)

    wx.cloud.callFunction({
      name: "getopenid",
      success: function(res) {
        console.log(res.result);
        openid = res.result.openid;
      },
      fail(res) {
        console.log("获取失败", res)
      }
    });

    wx.cloud.callFunction({
      name: "isInfoComplete",
      success: function(res) {
        console.log(res.result);
        infoComplete = res.result.infoComplete;
        if (infoComplete) {

          wx.showModal({
            title: '提示',
            content: '信息已填写完成，是否需要更新信息？',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                wx.navigateBack({
                  delta: 1
                });
              }
            }
          })

        }
      },
      fail(res) {
        console.log("获取失败", res)
      }
    });

  },

  onReady: function() {

  },
  showModal(error) {
    wx.showModal({
      content: error.msg,
      showCancel: false,
    })
  },
  submitForm: function(e) {

    params.type = typeIndex[parseInt(params.type)]

    params.plot = plotIndex[parseInt(params.plot)]

    if (params.serious == true) {
      params.serious = '是';
    } else {
      params.serious = '否';
    }

    if (params.contact == true) {
      params.contact = '是';
    } else {
      params.contact = '否';
    }

    params.name = e.detail.value.name;
    params.building = e.detail.value.building;
    params.unit = e.detail.value.unit;
    params.room = e.detail.value.room;
    params.tel = e.detail.value.tel;
    params.idcard = e.detail.value.idcard;

    console.log(params)

    // 传入表单数据，调用验证方法
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0]
      this.showModal(error)
      return false
    }

    if (this.agree === false) {
      wx.showModal({
        content: "请同意我们的声明",
        showCancel: false,
      })
      return false
    } else {



      this.addInfo()

      wx.navigateBack({
        delta: 1
      });

    }
  },

  initValidate() {
    // 验证字段的规则
    const rules = {
      name: {
        required: true,
      },
      building: {
        required: true,
      },
      room: {
        required: true,
      },
      tel: {
        required: true,
        tel: true,
      },
      idcard: {
        required: true,
        idcard: true,
      }
    }

    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      name: {
        required: '请输入姓名',
      },
      building: {
        required: '请输入楼号',
      },
      room: {
        required: '请输入房间号',
      },
      tel: {
        required: '请输入手机号',
        tel: '请输入正确的手机号',
      },
      idcard: {
        required: '请输入身份证号码',
        idcard: '请输入正确的身份证号码',
      },
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },



  addInfo() {

    if (infoComplete) {
      DB.where({
          _openid: openid
        })
        .update({
          data: {
            name: params.name,
            building: params.building,
            unit: params.unit,
            room: params.room,
            tel: params.tel,
            idcard: params.idcard,
            type: params.type,
            plot: params.plot,
            serious: params.serious,
            contact: params.contact
          },
          success(res) {
            console.log("更新成功", res)

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

            wx.cloud.callFunction({
              name: "getExcel",
              success: function (res) {
                console.log(res.result);
              },
              fail(res) {
                console.log("获取失败", res)
              }
            })

            wx.showToast({
              title: '信息已保存',
              icon: 'success',
              duration: 2000
            })


          },
          fail(res) {
            console("添加失败", res)
          }
        })
    } else {
      DB.add({
        data: {
          name: params.name,
          building: params.building,
          unit: params.unit,
          room: params.room,
          tel: params.tel,
          idcard: params.idcard,
          type: params.type,
          plot: params.plot,
          serious: params.serious,
          contact: params.contact
        },
        success(res) {
          console.log("添加成功", res)

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

          wx.cloud.callFunction({
            name: "getExcel",
            success: function (res) {
              console.log(res.result);
            },
            fail(res) {
              console.log("获取失败", res)
            }
          })

          wx.showToast({
            title: '信息已保存',
            icon: 'success',
            duration: 2000
          })


        },
        fail(res) {
          console("添加失败", res)
        }
      })
    }




  },

})