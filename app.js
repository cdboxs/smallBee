//app.js

App({
  globalData: {
    userInfo: null,
    cityName:'',
    APIURL: 'https://www.xiaomifenglife.com',
    screenWidth: '',
    screenHeight: '',
    windowWidth: '',
    windowHeight: '',
    postCity:''
  },
  onLaunch: function () {
    let that = this;
    //获取设备信息
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.screenWidth = res.screenWidth;
        that.globalData.screenHeight = res.screenHeight;
        that.globalData.windowWidth = res.windowWidth;
        that.globalData.windowHeight = res.windowHeight;
      }
    });
  },
  
  GetUserInfo: function (u) {
    var that = this;
    wx.showLoading({
      title: '正在加载...',
      mask: true
    })
    //用户登录
    wx.login({
      success: function (e) {
        if (e.code) {
          wx.request({
            url: that.globalData.APIURL + '/api/user/getOpenid',
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
                    url: that.globalData.APIURL + '/api/user/login',
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
                      console.log(e);
                      if (e.data.code == 1) {
                        wx.setStorage({
                          key: 'loginStatus',//登录状态 1 有商户 0无商户
                          data: {
                            shopStatus: e.data.userinfo.isshop,
                            userID: e.data.userinfo.id,
                            islogin: res.data.code,
                            avatar: u.detail.userInfo.avatarUrl,
                            nickname: e.data.userinfo.user_nickname
                          },
                          success:function(){
                            wx.hideLoading();
                          }
                        });
                      } 

                    },
                    fail: function (e) {
                      wx.hideLoading();
                    }
                  })
                }
              } else {
                wx.showToast({
                  title: '登陆失败,无法操作',
                  mask: true,
                  icon: 'none'
                })
              }
            }
          })
        }
      },
      fail: function (e) {
        console.log(e);
      }
    })
  },


})
