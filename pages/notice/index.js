// pages/notice/index.js
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
    let that=this;
    if(options.id){
      wx.showLoading({
        title: '正在加载数据...',
        mask:true,
        success:function(){
          wx.request({
            url: app.globalData.APIURL + '/api/notice/info',
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
              that.setData({
                title: e.data.data.title,
                creat_time: e.data.data.creat_time,
              });
              WxParse.wxParse('article', 'html', article, that, 5)
              wx.hideLoading();
            },
            fail: function (e) {
              //console.log(e);
            }
          });
        }
      })

    }else{
      wx.showToast({
        title: '数据加载失败',
        mask:true,
        success:function(){
          wx.redirectTo({
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