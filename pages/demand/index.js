//index.js
//获取应用实例
const app = getApp();
var bmap = require("../libs/bmap-wx.min.js");
Page({
  data: {
    xqHeight: '',
    noData: false,
    isCheckIn: true,
    currentTab: 0,
    demandLenght: '',
    APIURL: app.globalData.APIURL,
    demandList: [],
    page: 1,
    class_id: '',
    cityID:'',
    district: false,
    screenWidth: app.globalData.windowWidth,
    screenHeight: app.globalData.windowHeight,
    loading: true,
    hidden: 'hidden',
    noData: false,
    yesData: true,
  },

  demandList: function (e) {
    wx.navigateTo({
      url: '../demandList/index?classId=' + e.currentTarget.dataset.classifid + '&classname=' + e.currentTarget.dataset.classname,
    })
  },
  demandInfo: function (e) {
    wx.navigateTo({
      url: '../demandInfo/index?id='+ e.currentTarget.dataset.id,
    })
  },

  adinfo:function(e){
    wx.navigateTo({
      url: '../adInfo2/index?id=' + e.currentTarget.dataset.id,
    })
  },

  /**
     * 生命周期函数--监听页面加载
     */

  onLoad: function (options) {
    let that = this;

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    that.setData({ page: 1 });
    that.getIndexData();
  },

  /**
   * 下拉刷新数据
   * **/

  onPullDownRefresh: function (e) {
    let that = this;
    wx.showLoading({
      title: '正在加载...',
      mask: true
    })
    that.getIndexData();
  },

  /**
 * 页面上拉触底事件的处理函数
 */
  onReachBottom: function () {
    let that = this;
    wx.showLoading({
      title: '正在加载...',
      mask: true
    })
    that.data.page = that.data.page + 1;
    that.moreIndexShopList(that.data.page);
  },
  /**
    * 用户点击右上角分享
    */
  onShareAppMessage: function (res) {
    
  },

  /*
    入驻前判断是否登录授权，
  */
  sendXQ: function (e) {
    wx.getStorage({
      key: 'loginStatus',
      success: function (res) {
        if (res.data.islogin == 1) {
          wx.showLoading({
            title: '正在加载',
            mask: true,
          })
          setTimeout(function () {
            wx.hideLoading();
            wx.navigateTo({
              url: '../mdemand/index?select=2',
            })
          }, 500);
        }
      },
      fail: function (e) {
        wx.showLoading({
          title: '请登录...',
          icon: 'none',
          mask: true,
          success: function () {
            setTimeout(function () {
              wx.switchTab({
                url: '../member/index',
              })
              wx.hideLoading();
            }, 500);
          }
        })
      }
    })
  },


  /*
     获取需求首页地区数据
   */
  getIndexData: function () {
    let that = this;
    //获取分类
    wx.request({
      url: app.globalData.APIURL + '/api/News/classList',
      method: 'GET',
      dataType: 'json',
      success: function (e) {
        let classifyStart = [];
        let classifyEnd = [];
        for (var i = 0; i < e.data.data.length; i++) {
        
            classifyStart.push(e.data.data[i]);
         
        }
        that.setData({
          classifyStart: classifyStart,
          classifyEnd: classifyEnd
        });

      },
      fail: function (e) {
        wx.stopPullDownRefresh();
        wx.showToast({
          title: '数据请求失败,请检测网络',
          mask: true,
          icon: 'none'
        });
      }
    });

    //获取首页广告
    wx.getStorage({
      key: 'cityInfo',
      success: function (res) {
        wx.request({
          url: app.globalData.APIURL + '/api/ad/index2',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            area_id: res.data.cityID
          },
          success: function (e) {
            if(e.data.code==1){
                var adlist = [];
                for (var i = 0; i <= 3; i++) {
                  if (e.data.data[i] != undefined) {
                    adlist.push(e.data.data[i]);
                  } else {
                    adlist[i] = { id: 0 }
                  }

                }
                that.setData({
                  adlist: adlist,
                  adlistStatus: 1
                });
            } else if (e.data.code == 0) {
              that.setData({
                adlistStatus: 0
              });
            }
           
           
          }
        });
      },
      fail: function (e) {

      }
    });
    that.getIndexShopList(that.data.page=1);


    wx.getStorage({
      key: 'cityInfo',
      success: function (res) {
        if (res.data.cityName) {
          setTimeout(function () {
            wx.stopPullDownRefresh();
            that.setData({
              loading: false,
              hidden: 'auto'
            });
          }, 1000);
        } else {
          wx.showToast({
            title: '请重新定位...',
            icon: 'none',
            mask: true
          })
        }

      },
    })

  },

  getIndexShopList: function (postpage) {
    let that = this;
    //获取首页推荐商家数据
    wx.getStorage({
      key: 'cityInfo',
      success: function (res) {
        wx.request({
          url: app.globalData.APIURL + '/api/News/index',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            p: postpage,
            area_id: res.data.cityID
          },
          success: function (e) {
            if (e.data.code == 1 && postpage==1) {
              that.setData({
                demandList: e.data.data,
                yesData: true,
                noData: false,
              });
              return;
            } else if (e.data.code == 0 && postpage == 1){
              setTimeout(function () {
                that.setData({
                  demandList: [],
                  yesData: false,
                  noData: true,
                });
              }, 300);
            }           
          }
        });
        setTimeout(function () { wx.hideLoading(); }, 1000);
      },
      fail: function (e) {
        wx.showToast({
          title: '数据请求失败,请检测网络',
          mask: true,
          icon: 'none'
        });
      }
    });
  },
  moreIndexShopList: function (postpage) {
    let that = this;
    //获取首页推荐商家数据
    wx.getStorage({
      key: 'cityInfo',
      success: function (res) {
        wx.request({
          url: app.globalData.APIURL + '/api/News/index',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            p: postpage,
            area_id: res.data.cityID
          },
          success: function (e) {
            if (e.data.code == 1) {
           
              if (postpage <= e.data.pages) {
                var getList = that.data.demandList;
                for (var i = 0; i < e.data.data.length; i++) {
                  getList.push(e.data.data[i]);
                }
                setTimeout(function () {
                  that.setData({
                    demandList: getList,
                    yesData: true,
                    noData: false,
                  });
                }, 300);
              }
            } else if (e.data.code == 0) {
             wx.showToast({
               title: '没有更多了',
               mask:true,
               icon:'none'
             })
            }
          }
        });
        setTimeout(function () { wx.hideLoading(); }, 1000);
      },
      fail: function (e) {
        wx.showToast({
          title: '数据请求失败,请检测网络',
          mask: true,
          icon: 'none'
        });
      }
    });
  },

})
