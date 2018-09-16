// pages/merchantInfo/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperIndex:0,
    showModal: false,
    discussStust:'block',
    showPics:false,
    hideModal: true,
    shopID: '',
    page:1,
    screenHeight: app.globalData.screenHeight,
    windowWidth: app.globalData.windowWidth,
    windowHeight: app.globalData.windowHeight,
    APIURL: app.globalData.APIURL
  },
  hidemask: function () {
    var that = this;
    that.setData({
      showModal: false,
      discussStust:'block'
    });
  },
  showPic:function(e){
    var that=this;
    that.setData({
      showPics:true,
      discussStust:'none',
      swiperIndex: e.currentTarget.dataset.current
    });
  },
  hidePic:function(e){
    var that = this;
    that.setData({
      showPics: false,
      discussStust: 'block'
    });
  },
  backHome(){
    wx.switchTab({
      url: '../index/index',
    })
  },
  callAll(e){
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.phonen,
    })
  },
  callPhone(){
    let that=this;
    let phoneNumber=that.data.merchantInfo.description.match(/((((13[0-9])|(15[^4])|(18[0,1,2,3,5-9])|(17[0-8])|(147))\d{8})|((\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}))?/g);
    for (let i = 0; i < phoneNumber.length;i++){
      if (phoneNumber[i]!=""){
   
        wx.makePhoneCall({
          phoneNumber:''+phoneNumber[i]+'',
        })
      }
    }
   
  },
  /**
   * 判断是否授权才能评论
   * **/
  showDiscussf: function (u) {
    var that = this;
   
    wx.getStorage({
      key: 'loginStatus',
      success: function (res) {
        if (that.data.showModal) {
          that.setData({
            showModal: false
          });
        } else {
          that.setData({
            showModal: true,
            discussStust:'none'
          });
        };
      },
      fail: function (e) {
        
        setTimeout(function(){
          app.GetUserInfo(u);
        },500);
       
      }
    })


  },
  phonecall: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.target.dataset.phonenum,
    })
  },
  checkDisInfo: function (e) {
    var that = this;
    let discussInfo = e.currentTarget.dataset.name;
    that.setData({
      discussInfo: e.detail.value.replace(/\s+/g, "")
    })
  },
  sendDiscuss: function (e) {
    var that = this;
    if (e.detail.value.discussInfo == "") {
      wx.showToast({
        title: '评论内容不能为空!',
        mask: true,
        icon: 'none'
      })
      return false
    } else {
      wx.getStorage({
        key: 'loginStatus',
        success: function (res) {
          wx.request({
            url: app.globalData.APIURL + '/api/shop/comment',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              shop_id: that.data.shopID,
              uid: res.data.userID,
              content: e.detail.value.discussInfo
            },
            success: function (e) {
              if (e.data.code == 1) {
                that.getDiscussList();
                wx.showToast({
                  title: '评论成功',
                  icon: 'success',
                  mask: true,
                  success: function () {
                    that.setData({
                      showModal: false,
                      discussStust:'block'
                    });
                    
                    
                  }
                })
              }
            }
          })
        },
      })
    }

  },
  good:function(d){
    var that=this;
    wx.getStorage({
      key: 'loginStatus',
      success: function (res) {
        wx.request({
          url: app.globalData.APIURL + '/api/shop/like',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            scid: d.currentTarget.dataset.id,
            uid: res.data.userID,
          },
          success: function (e) {
            if (e.data.code == 1) {
              wx.showToast({
                title: '点赞成功',
                icon: 'success',
                mask: true,
                success: function () {
                  that.getDiscussList();
                }
              })
            }else if(e.data.code==0){
              wx.showToast({
                title: '您已经点赞过了',
                icon: 'none',
                mask: true,
                success: function () {
                  
                }
              })
            }
          }
        })
      },
    })
  },
  getDiscussList: function () {
    var that = this;
    wx.getStorage({
      key: 'loginStatus',
      success: function (res) {
        wx.request({
          url: app.globalData.APIURL + '/api/shop/commentList',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            shop_id: that.data.shopID,
            uid: res.data.userID,
            p:that.data.page
          },
          success: function (e) {
            console.log(e);
            if (e.data.code == 1) {
              that.setData({
                discussList: e.data.data,
              });
            } 
          }

        })
      },
    })
  },
  getDiscussMore: function (page) {
    var that = this;
    wx.getStorage({
      key: 'loginStatus',
      success: function (res) {
        wx.request({
          url: app.globalData.APIURL + '/api/shop/commentList',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            shop_id: that.data.shopID,
            uid: res.data.userID,
            p:page
          },
          success: function (e) {
            let moreData = that.data.discussList;
           
            if (e.data.code == 1) {
                for (var i = 0; i < e.data.data.length; i++) {
                  moreData.push(e.data.data[i]);
                }
                that.setData({
                  discussList: moreData,
                });
            }else{
              wx.showToast({
                title: '暂无数据...',
                icon: 'none',
                mask: true
              });
            }
          }

        })
      },
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      shopID: options.id
    });
    wx.showLoading({
      title: '正在加载数据',
      mask: true,
      success: function () {
        wx.request({
          url: app.globalData.APIURL + '/api/shop/shopInfo1',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            id: options.id
          },
          success: function (e) {
            wx.setNavigationBarTitle({
              title: e.data.data.user_nickname,
            });
           
            if (e.data.code == 1) {
              if (e.data.data.img.length == 0) {
                that.setData({
                  merchantInfo: e.data.data,
                  dataShow: false,
                 
                });
              } else {
                that.setData({
                  merchantInfo: e.data.data,
                  dataShow: true,
          
                });
              }

              wx.hideLoading();
            } else if (e.data.code == 0) {

              wx.showModal({
                title: '提示',
                content: '暂无数据',
                showCancel: false,
                success: function (res) {
                  wx.switchTab({
                    url: '../index/index',
                  })
                }
              })
            }

          },
          fail: function (e) {

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
  
    var that=this;
    that.getDiscussList();
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
    var that=this;
    that.data.page = that.data.page+1;
    that.getDiscussMore(that.data.page);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that=this;
    return {
      title: that.data.title,
      desc: '小蜜蜂生活自助网',
      path: '/pages/merchantInfo/index?id=' + that.data.shopID

    }
  }
})