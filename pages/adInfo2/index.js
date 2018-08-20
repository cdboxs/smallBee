// pages/adInfo/index.js
const app = getApp();
var WxParse = require('../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPics: false,
    APIURL: app.globalData.APIURL,
    screenHeight: app.globalData.screenHeight,
    windowWidth: app.globalData.windowWidth,
    windowHeight: app.globalData.windowHeight,
  },
  phonecall: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.phonenum,
    })
  },
  showPic: function (e) {
    var that = this;
    that.setData({
      showPics: true,
      discussStust: 'none'
    });
  },
  hidePic: function (e) {
    var that = this;
    that.setData({
      showPics: false,
      discussStust: 'block'
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    if (options.id) {
      //获取首页广告
      wx.getStorage({
        key: 'cityInfo',
        success: function (res) {
          wx.request({
            url: app.globalData.APIURL + '/api/ad/info',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              id: options.id
            },
            success: function (e) {
              console.log(e);
              var article = e.data.data.content.replace(/src="/g, 'src="https://www.xiaomifenglife.com');

              if (e.data.code == 1) {
                that.setData({
                  adinfo: e.data.data,

                });
                WxParse.wxParse('article', 'html', article, that, 5)
              }

            }
          });
        },
        fail: function (e) {

        }
      });
    } else {
      wx.showToast({
        title: '此数据不存在',
        mask: true,
        icon: 'none',
        success: function () {
          wx.reLaunch({
            url: '../index/index',
          })
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})