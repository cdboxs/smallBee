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
    indexpage: 1,
    ActivityPage:1,
    class_id: '',
    cityName: '',
    cityID:'',
    district: false,
    screenWidth: app.globalData.windowWidth,
    screenHeight: app.globalData.windowHeight,
    loading: true,
    hidden: 'hidden',
    noData: false,
    yesData: true,
  },
  //更新name
  changeData: function (names) {
    var that=this;
    that.getIndexShopList();
  },
  //事件处理函数
  goCity: function (e) {
    let that=this;
    that.setData({
      indexpage:1
    });
    wx.navigateTo({
      url: '../city/index',
    })
  },
  merchantList: function (e) {
    wx.navigateTo({
      url: '../merchantList/index?classId=' + e.currentTarget.dataset.classifid + '&classname=' + e.currentTarget.dataset.classname,
    })
  },
  merchantInfo: function (e) {
    wx.navigateTo({
      url: '../merchantInfo/index?id='+ e.currentTarget.dataset.shopid,
    })
  },
  notice: function (e) {
    wx.navigateTo({
      url: '../notice/index?id=' + e.currentTarget.dataset.id,
    })
  },
  adinfo:function(e){
    wx.navigateTo({
      url: '../adInfo/index?id=' + e.currentTarget.dataset.id,
    })
  },


  /**
     * 生命周期函数--监听页面加载
     */

  onLoad: function (options) {
    let that = this; 
    wx.removeStorageSync('cityInfo');
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (e) {
    let that = this;
    let cityInfo = wx.getStorageSync('cityInfo');
    if (e || cityInfo.cityID){
      setTimeout(() => { that.getIndexShopList(); }, 1000);
    }
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    wx.getStorage({
      key: 'cityInfo',
      success: function (res) {
        if (res.data.indexShowCity == 1) {
          that.setData({
            indexShowCity: 1,
            topName: '',
            cityName: res.data.cityName,
            cityID: res.data.cityID,
            district: false,
          });
        } else if (res.data.indexShowCity == 2) {
          that.setData({
            indexShowCity: 2,
            topName: res.data.topName,
            cityName: res.data.cityName,
            cityID: res.data.cityID,
            district: false,
          });
        } else if (res.data.indexShowCity == 3) {
          that.setData({
            indexShowCity: 3,
            topName: res.data.topName,
            cityName: res.data.cityName,
            cityID: res.data.cityID,
            district: false,
          });
        }
        if (res.data.indexShowCity == 0) {

          if (res.data.district) {
            that.setData({
              indexShowCity: 0,
              topName: '',
              cityName: res.data.cityName,
              cityID: res.data.cityID,
              district: res.data.district,
            });
          } else {
            that.setData({
              indexShowCity: 0,
              topName: '',
              cityName: res.data.cityName,
              cityID: res.data.cityID,
              district: '',
            });
          }
        }
      },
      fail: function () {
        that.getCity();
      }
    });
    that.getIndexData();
    
    
   
  },

  /**
   * 下拉刷新数据
   * **/

  onPullDownRefresh: function (e) {
    let that = this;
    wx.showLoading({
      title: '正在加载...',
      mask:true
    })
    that.getIndexData();
    that.data.indexpage = 1;
    that.getIndexShopList();
  },

  /**
 * 页面上拉触底事件的处理函数
 */
  onReachBottom: function () {
    let that = this;
    wx.showLoading({
      title: '正在加载...',
      mask: true
    });
    that.data.indexpage = that.data.indexpage + 1;
    that.getIndexShopListMore(that.data.indexpage);
   
  },
  /**
    * 用户点击右上角分享
    */
  onShareAppMessage: function (res) {
    return {
      title: '小蜜蜂生活自助网',
      path: '/pages/index/index',
      success: (res) => {
        wx.showToast({
          title: '分享成功',
          mask:true,
          icon:'none'
        })
      },
      fail: (res) => {
        wx.showToast({
          title: '分享失败',
          mask: true,
          icon: 'none'
        })
      }
    }
  },
  /**
  * 获取城市定位
  */
  getCity: function () {
    let that = this;
    //获取城市名称和ID
    var BMap = new bmap.BMapWX({
      ak: 'Gxm35xpKIvPDO4IevLR72Qz23acyzoGS'
    });
    var fail = function (data) {
      wx.showModal({
        title: '提示',
        content: '获取位置失败,请打开GPS定位或手动选择',
        showCancel: false,
        success: function (e) {
          wx.navigateTo({
            url: '../city/index',
          })
        }
      })
    };
    var success = function (data) {
      if (data.originalData.result.addressComponent.district) {
        wx.request({
          url: app.globalData.APIURL + '/api/shop/areaid',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          method: 'POST',
          data: {
           area: data.originalData.result.addressComponent.district
          //area:'磁县'
          },
          success: function (e) {
            let getResult = e.data.data;
            let getcityID='';
            if (e.data.code ==3) {
              for (var i = 0; i < getResult.length; i++) {
                if (getResult[i].name == data.originalData.result.addressComponent.city) {
                  getcityID = getResult[i].fid;
                  var datas = {
                    indexShowCity: 0,
                    cityName: data.originalData.result.addressComponent.city,
                    cityID: getcityID,
                    district: data.originalData.result.addressComponent.district,
                  }
                  var mycitydata = {
                    indexShowCity: 0,
                    cityName: data.originalData.result.addressComponent.city,
                    myCityID: getcityID,
                    district: data.originalData.result.addressComponent.district,
                  }
                  wx.setStorageSync('cityInfo', datas);
                  wx.setStorageSync('myCity', mycitydata);
                  var getCityInfo = wx.getStorageSync('cityInfo');
                  if (getCityInfo.cityName) {
                    that.setData({
                      indexShowCity: 0,
                      cityName: getCityInfo.cityName,
                      cityID: getcityID,
                      district: getCityInfo.district
                    });
                    that.getIndexData();
                    that.getIndexShopList()
                  }
                }
              }
            } else if (e.data.code == 1){
              if (e.data.data[0].pid == 0) {
                getcityID = getResult[0].id;
                var datas = {
                  indexShowCity: 0,
                  cityName: getResult[0].name,
                  cityID: getcityID,
                  district: '',
                }
                var mycitydata = {
                  indexShowCity: 0,
                  cityName: getResult[0].name,
                  myCityID: getcityID,
                  district:'',
                }
                wx.setStorageSync('cityInfo', datas);
                wx.setStorageSync('myCity', mycitydata);
                var getCityInfo = wx.getStorageSync('cityInfo');
                if (getCityInfo.cityName) {
                  that.setData({
                    indexShowCity: 0,
                    cityName: getCityInfo.cityName,
                    cityID: getcityID,
                    district: getCityInfo.district
                  });
                 that.getIndexData();
                  that.getIndexShopList()
                }
              }
            } else if(e.data.code==0){
              wx.showModal({
                title: '提示',
                content: data.originalData.result.addressComponent.district + '--暂未开通,请切换到相关城市',
                showCancel: false,
                success: function (e) {
                  if (e.confirm) {
                    wx.navigateTo({
                      url: '../city/index',
                    })
                  }
                }
              })
            }
          },
          // fail: function (e) {
          //   wx.showToast({
          //     title: '数据请求失败,请检测网络',
          //     mask: true,
          //     icon: 'none'
          //   });
          // }
        })
      }
    };
    // 发起regeocoding检索请求 
    BMap.regeocoding({
      fail: fail,
      success: success,
    });
  },
  /*
    入驻前判断是否登录授权，
  */
  checkIn: function (e) {
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
              url: '../checkIn/index',
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
     获取首页地区数据
   */
  getIndexData: function () {
    let that = this;
    let cityInfo = wx.getStorageSync('cityInfo');
    if (cityInfo){
      //获取分类
      wx.request({
        url: app.globalData.APIURL + '/api/shop/classList',
        method: 'GET',
        dataType: 'json',
        success: function (e) {
          let classifyStart = [];
          let classifyEnd = [];
          for (var i = 0; i < e.data.data.length; i++) {
            if (i <= 9) {
              classifyStart.push(e.data.data[i]);
            } else if (i > 9) {
              classifyEnd.push(e.data.data[i]);
            }
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
      //获取公告数据

      wx.request({
        url: app.globalData.APIURL + '/api/notice/index',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          area_id: cityInfo.cityID
        },
        success: function (e) {    
          if (e.data.code == 1) {
            that.setData({
              Notice: e.data.data.title
            });
          } else{
            that.setData({
              Notice: e.data.msg
            });
          }

        }
      });
      //获取首页广告
      wx.request({
        url: app.globalData.APIURL + '/api/ad/index',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          area_id: cityInfo.cityID
        },
        success: function (e) {
          if (e.data.code == 1) {
            var adlist = [];
            for (var i = 0; i <= 1; i++) {
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
    }

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
    });
   
 
  },
//获取首页推荐商家
  getIndexShopList: function () {
    let that = this;
    //获取首页推荐商家数据
    let cityInfo = wx.getStorageSync('cityInfo');
    wx.request({
      url: app.globalData.APIURL + '/api/shop/index1',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        p: 1,
        area_id: cityInfo.cityID
      },
      success: function (e) {
        console.log(e);
        wx.hideLoading();
        if (e.data.code == 1) {
          for (let i = 0; i < e.data.data.length; i++) {
            e.data.data[i].description = e.data.data[i].description.substring(0, 56);
          }
        }
        if (e.data.code == 1 ) {
          that.setData({
            merchantList: e.data.data,
            yesData: true,
            noData: false,
            xqHeight: e.data.data.length * 95
          });
        
        } else if (e.data.code == 0) {
          setTimeout(function () {
            that.setData({
              merchantList: [],
              yesData: false,
              noData: true,
            });
          }, 300);
        }

   
      }
    });
    
  },

  //首页商家加载更多
  getIndexShopListMore: function (postpage) {
    let that = this;
    let cityInfo = wx.getStorageSync('cityInfo');
    wx.request({
      url: app.globalData.APIURL + '/api/shop/index1',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        p: postpage,
        area_id: cityInfo.cityID
      },
      success: function (e) {
        if (e.data.code == 1) {
          for (let i = 0; i < e.data.data.length; i++) {
            e.data.data[i].description = e.data.data[i].description.substring(0, 56);
          }
        }

        if (postpage <= e.data.pages) {
          wx.hideLoading();
          var getList = that.data.merchantList;
          for (var i = 0; i < e.data.data.length; i++) {
            getList.push(e.data.data[i]);
          }
          setTimeout(function () {
            that.setData({
              merchantList: getList,
              yesData: true,
              noData: false,
              xqHeight: getList.length * 95
            });
          }, 300);
        } else if (e.data.code == 0) {
          wx.hideLoading();
          wx.showToast({
            title: '没有更多了',
            icon: 'none',
            mask: true
          })
        }
      }
    });

  },
 

})
