// pages/about/index.js
const app = getApp();
var WxParse = require('../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
      wx.showLoading({
        title: '正在加载数据...',
        mask: true,
        success: function () {
          wx.request({
            url: app.globalData.APIURL + '/api/user/aboutUs',
            method: 'GET',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (e) {
              WxParse.wxParse('article', 'html', e.data.data, that, 5);
              wx.hideLoading();
            },
            fail: function (e) {
             // console.log(e);
            }
          });
        }
      })

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