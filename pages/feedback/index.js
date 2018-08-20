// pages/feedback/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
  checkinfo:function(e){
    var that = this;
    let info = e.currentTarget.dataset.info;
    that.setData({
      info: e.detail.value.replace(/\s+/g, "")
    })
  },
  feedback:function(e){
    if (e.detail.value.info == ""){
        wx.showToast({
          title: '内容不能为空',
          mask:true,
          icon:'none'
        });
        return;
    } else if (e.detail.value.info.length<10){
        wx.showToast({
          title: '内容字数不能小于10位',
          mask: true,
          icon: 'none'
        });
        return;
    }else{
      wx.getStorage({
        key: 'loginStatus',
        success: function(u) {
          wx.request({
            url: app.globalData.APIURL + '/api/advice/add',
            method: 'POST',
            header: {
              'content-type': 'application/json'
            },
            data: {
              uid: u.data.userID,
              content: e.detail.value.info
            },
            success: function (e) {
              if (e.data.code == 1){
                  wx.showToast({
                    title: e.data.msg,
                    mask: true,
                    icon: 'none'
                  });
                  setTimeout(function(){
                    wx.switchTab({
                      url: '../member/index',
                    })
                  },1000);
              }else{
                wx.showToast({
                  title: '提交失败',
                  mask: true,
                  icon: 'none'
                })
              }
            }
          })
        },
      })
     
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '投诉建议',
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