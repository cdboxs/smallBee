// pages/member/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatar: '../img/nologin.png',
    loginStatus: false,
    screenWidth: app.globalData.screenWidth,
    screenHeight: app.globalData.screenHeight,
  },
  //我的店铺操作
  mymerchant: function (e) {
    wx.navigateTo({
      url: '../mymerchant/index',
    })

  },
  feedback:function(){
    wx.navigateTo({
      url: '../feedback/index',
    })
  },
  myads:function(){
    wx.navigateTo({
      url: '../myads/index',
    })
  },
  about: function (e) {
    wx.navigateTo({
      url: '../about/index',
    })
  },
  goPay:function(){
    
    wx.getStorage({
      key: 'loginStatus',
      success: function(res) {
       if (res.data.shopStatus==0){
          wx.showToast({
            title: '请先开通店铺',
            mask: true,
            icon: 'none'
          })
        }else{
            wx.navigateTo({
              url: '../pay/index',
            })
        }
      },
    })
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    var that = this;
    //个人中心进入判断用户是否登陆
    wx.showLoading({
      title: '正在加载',
      mask:true,
      icon:'none'
    })
    wx.getStorage({
      key: 'loginStatus',
      success: function (res) {
        if (res.data.islogin == 1) {
          that.setData({
            avatar: res.data.avatar,
            nickname: res.data.nickname,
            loginStatus: false
          });
          wx.hideLoading();
        }
      },
      fail: function () {
        that.setData({
          loginStatus: true
        });
        wx.hideLoading();
      }
    })
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

  },

  /**
 * 需求页面进入
 * */
  mdemand: function (e) {
    var that = this;
    wx.navigateTo({
      url: '../mdemand/index',
    })
  },
    /**
 * 个人中心登陆本地存储
 * */
  GetUserInfo: function (u) {
    var that = this;
    //用户登录
    wx.login({
      success: function (e) {
        if (e.code) {
          wx.request({
            url: app.globalData.APIURL + '/api/user/getOpenid',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              code: e.code,
            },
            success: function (res) {
              if (u.detail.errMsg == "getUserInfo:ok") {
                if (res.data.data) {
                  wx.request({
                    url: app.globalData.APIURL + '/api/user/login',
                    method: 'POST',
                    header: {
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    data: {
                      openid: res.data.data,
                      avatar: u.detail.userInfo.avatarUrl,
                      nickname: u.detail.userInfo.nickName
                    },
                    success: function (e) {
                      if (e.data.code == 1) {
                        wx.showToast({
                          title: '登陆成功',
                          mask: true,
                          icon: 'success'
                        })
                        wx.setStorage({
                          key: 'loginStatus',//登录状态 1 有商户 0无商户
                          data: {
                            shopStatus: e.data.userinfo.isshop,
                            userID: e.data.userinfo.id,
                            islogin: res.data.code,
                            avatar: u.detail.userInfo.avatarUrl,
                            nickname: e.data.userinfo.user_nickname,
                            openid: res.data.data
                          },
                        });
                        wx.getStorage({
                          key: 'loginStatus',
                          success: function (res) {
                            that.setData({
                              avatar: res.data.avatar,
                              nickname: res.data.nickname,
                              loginStatus: false
                            });
                          },
                        })
                      }

                    },
                    fail: function (e) {
                      wx.showToast({
                        title: '数据请求失败,请检测网络',
                        mask: true,
                        icon: 'none'
                      });
                    }
                  })
                }
              } else {
                wx.showToast({
                  title: '登陆失败,请重新登陆',
                  mask: true,
                  icon: 'none'
                })
              }
            },
            fail: function (e) {
              wx.showToast({
                title: '数据请求失败,请检测网络',
                mask: true,
                icon: 'none'
              });
            }
          })
        }
      },
      fail: function (e) {
        wx.showToast({
          title: '数据请求失败,请检测网络',
          mask: true,
          icon: 'none'
        });
      }
    })
  },
})