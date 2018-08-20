// pages/demandInfo/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    APIURL: app.globalData.APIURL,
  },
  backHome() {
    wx.switchTab({
      url: '../index/index',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    wx.showToast({
      title: '正在加载中...',
      mask: true,
      icon: 'none'
    })
    if(options.id){
      wx.request({
        url: app.globalData.APIURL + '/api/News/newsInfo',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        data: {
          id: options.id
        },
        success:function(e){
            that.setData({
              demandInfo:e.data.data
            });
            wx.hideToast();
        }
      })
    }else{
      wx.showToast({
        title: '暂无此内容！',
        mask:true,
        icon:'none'
      })
    }
  },
  /*
      拨打电话
    */
  call: function (e) {
    let that = this;
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.phone,
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