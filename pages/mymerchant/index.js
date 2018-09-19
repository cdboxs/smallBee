// pages/demand/index.js
var app = getApp();
var WxParse = require('../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected: 1,
    payStatus: 0,
    start_time: '00:00',
    stop_time: '23:59',
    addPicShow:true,
    classifyIndex: Number,
    classifyArr: [],
    cityIndex: Number,
    cityArr: [],
    shopListPic: {},
    shopPicArr: [],
    checked: false,
    addPicShow: true,
    sendDisabled: false,
    page: 1,
    scrollHeight: app.globalData.screenHeight,
    APIURL: app.globalData.APIURL
  },
  selectActivity: function (e) {
    var that = this;
    if (e.detail.value) {
      that.setData({
        activityShow: true,
        activityType: 1
      });
    } else {
      that.setData({
        activityShow: false,
        activityType: 0
      });
    }
  },
  /**
   * 入驻获取分类
   * */
  selectClassify: function (e) {
    let that = this;
    that.setData({
      classifyIndex: e.detail.value
    });
  },
  selectCity: function (e) {
    let that = this;
    that.setData({
      cityIndex: e.detail.value
    })
  },
  start_time: function (e) {
    let that = this;
    that.setData({
      start_time: e.detail.value
    })
  },
  stop_time: function (e) {
    let that = this;
    that.setData({
      stop_time: e.detail.value
    })
  },
  merchantInfo: function (e) {
    wx.navigateTo({
      url: '../merchantInfo/index?id=' + e.currentTarget.dataset.shopid,
    })
  },
  menuS: function (e) {
    var that = this;
    if (e.target.dataset.id) {
      that.setData({
        selected: e.target.dataset.id
      });
    }
    let checkIninfo = wx.getStorageSync('checkIninfo');
    if (checkIninfo && e.target.dataset.id==2) {
      that.setData({
        checkIninfos: checkIninfo
      });
    }
  },
  myMerchantSet:function(e){
    wx.showLoading({
      title: '正在加载...',
      mask:true
    })
    setTimeout(function(){
      wx.navigateTo({
        url: '../merchantSet/index?shopid=' + e.currentTarget.dataset.id,
      });
      wx.hideLoading();
    },1200);
    
  },
  autoKeep(e) {
    console.log(e.detail.value);
    if (e.detail.value){
      wx.setStorage({
        key: 'checkIninfo',
        data: e.detail.value,
      })
    }
    
  },
  /**
   * 上传店铺实景图
   * **/
  merchantPic: function () {
    var that = this;

    wx.chooseImage({
      count: 6,  //最多可以选择的图片总数  
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
        var tempFilePaths = res.tempFilePaths;
        //启动上传等待中...  
        wx.showToast({
          title: '正在上传...',
          icon: 'loading',
          mask: true,
          duration: 10000
        })
        var uploadImgCount = 0;
        for (var i = 0; i < tempFilePaths.length; i++) {
          wx.uploadFile({
            url: app.globalData.APIURL + '/api/shop/upload',
            filePath: tempFilePaths[i],
            name: 'image',
            success: function (res) {
              uploadImgCount++;
              var e = JSON.parse(res.data);
              //服务器返回格式: { "Catalog": "testFolder", "FileName": "1.jpg", "Url": "https://test.com/1.jpg" }  
              var productInfo = that.data.shopListPic;
              if (productInfo.bannerInfo == null) {
                productInfo.bannerInfo = [];
              }
              productInfo.bannerInfo.push({
                "imgs": e.data,
              });

              var arr = [];
              for (var i = 0; i < productInfo.bannerInfo.length; i++) {
                if (productInfo.bannerInfo.length > 6) {
                  wx.showToast({
                    title: '最多上传6张',
                  })
                  return;
                }
                arr.push(productInfo.bannerInfo[i].imgs);
              }
              var arrJson = JSON.stringify(arr);
              if (arrJson) {
                that.setData({
                  shopListPic: productInfo,
                  shopPicArr: arrJson
                });
              }
              if (arr.length >= 6) {
                that.setData({
                  addPicShow: false
                });
              }
              // console.log(that.data.shopListPic);
              // console.log(that.data.shopPicArr);
              //如果是最后一张,则隐藏等待中  
              if (uploadImgCount == tempFilePaths.length) {
                wx.hideToast();
              }
            },
            fail: function (res) {
              wx.hideToast();
              wx.showModal({
                title: '错误提示',
                content: '上传图片失败',
                showCancel: false,
                success: function (res) { }
              })
            }
          });
        }

      }
    });

  },
  /*我的店铺支付状态选择*/ 
  payStatus: function (e) {
    let that = this;
    if (e.detail.value[0]) {
      that.setData({
        payStatus: '1',
        checked: true
      });
    } else {
      that.setData({
        payStatus: '0',
        checked: false
      });
    }
  },

  myMerchantList: function () {
    let that = this;
    that.setData({
      page: 1
    });
    wx.getStorage({
      key: 'loginStatus',
      success: function (res) {
        
        wx.request({
          url: app.globalData.APIURL + '/api/user/myShop1',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            p: 1,
            uid: res.data.userID
          },
          success: function (res) {
            if (res.data.code == 1) {
              for (let i = 0; i < res.data.data.length; i++) {
                res.data.data[i].description = res.data.data[i].description.substring(0,56);
              }
              that.setData({
                myMerchantList: res.data.data,
                noData: false
              });
            } else if (res.data.code == 0) {
              that.setData({
                myMerchantList: [],
                noData:true
              });
            }

          }
        })
      },
    })
  },
  /**
   * 入驻添加数据
   * */
  checkInF: function (e) {
    let that = this;
   if (e.detail.value.shopClassIfyID == "") {
      wx.showToast({
        title: '请选择商店分类！',
        mask: true,
        icon: 'none',
      });
      return false;
    }  else {
      that.setData({
        sendDisabled: true
      });
      if (that.data.payStatus == 1) {
        wx.getStorage({
          key: 'loginStatus',
          success: function (res) {
            wx.request({
              url: app.globalData.APIURL + '/api/shop/join1',
              method: 'POST',
              header: {
                'content-type': 'application/json'
              },
              data: {
                uid: res.data.userID,//
                area_id: e.detail.value.shopCityID,//城市ID
                class_id: e.detail.value.shopClassIfyID,//分类ID
                // name: e.detail.value.shopName,//商户名称
                // tel: e.detail.value.shopPhone,//商户电话
                // address: e.detail.value.shopAddress,//详细地址
                // start_time: e.detail.value.start_time,//开始时间
                // stop_time: e.detail.value.stop_time,//结束时间
                description: e.detail.value.shopJJ,//介绍
                img: e.detail.value.shopics,//实景图
                type: that.data.activityType,//活动状态
                //promotion_description: e.detail.value.activityInfo,//活动内容
                status: 0
              },
              success: function (o) {
                if (o.data.code == 1) {
                  wx.removeStorageSync('checkIninfo');
                  wx.navigateTo({
                    url: '../pay/index?shopid=' + o.data.data + '&shop_name=' + o.data.shop_name,
                  })
                } else if (o.data.code == 3) {
                  setTimeout(function () {
                    wx.showModal({
                      title: '提示',
                      content: o.data.msg,
                      showCancel: false,
                      success: function () {
                        wx.switchTab({
                          url: '../index/index',
                        })
                      }
                    })
                  }, 1000);

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
      } else if (that.data.payStatus == 0) {
        wx.getStorage({
          key: 'loginStatus',
          success: function (res) {
            wx.request({
              url: app.globalData.APIURL + '/api/shop/join1',
              method: 'POST',
              header: {
                'content-type': 'application/json'
              },
              data: {
                uid: res.data.userID,//
                area_id: e.detail.value.shopCityID,//城市ID
                class_id: e.detail.value.shopClassIfyID,//分类ID
                // name: e.detail.value.shopName,//商户名称
                // tel: e.detail.value.shopPhone,//商户电话
                // address: e.detail.value.shopAddress,//详细地址
                // start_time: e.detail.value.start_time,//开始时间
                // stop_time: e.detail.value.stop_time,//结束时间
                description: e.detail.value.shopJJ,//介绍
                img: e.detail.value.shopics,//实景图
                type: that.data.activityType,//活动状态
                //promotion_description: e.detail.value.activityInfo,//活动内容
                status: 1
              },
              success: function (o) {
                if (o.data.code == 1) {
                  wx.removeStorageSync('checkIninfo');
                  setTimeout(function () {
                    wx.showToast({
                      title: '入驻成功',
                      icon: 'success',
                      mask: true,
                      success: function () {
                        wx.switchTab({
                          url: '../index/index',
                        });
                      }
                    })
                  }, 1000);
                } else if (o.data.code == 3) {
                  setTimeout(function () {
                    wx.showModal({
                      title: '提示',
                      content: o.data.msg,
                      showCancel: false,
                      success: function () {
                        wx.switchTab({
                          url: '../index/index',
                        })
                      }
                    })
                  }, 1000);

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
      }
    }


  },
  del: function (e) {
    let that = this;
    wx.showModal({
      title: '小蜜蜂提示',
      content: '确定要删除此信息？',
      success: function (res) {
        if (res.confirm==true) {
          wx.request({
            url: app.globalData.APIURL + '/api/user/delShop',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            data: {
              id: e.currentTarget.dataset.id
            },
            success: function (res) {
              that.setData({
                selected: 1
              });
              that.myMerchantList();

            }
          })
        } else if (res.cancel == true) {
          return;
        }
      }
    })

  },
  goShopPay: function (e) {
    let that = this;
    wx.navigateTo({
      url: '../pay/index?shopid=' + e.currentTarget.dataset.shopid + '&shop_name=' + e.currentTarget.dataset.shop_name,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    if (options.select == 2) {
      that.setData({
        selected: '2'
      });
    } else if (options.select == 1) {
      that.setData({
        selected: '1'
      });
    } else {
      that.setData({
        selected: '1'
      });
    }
    var that = this;
    /**
     * 获取分类数据初始化
     * **/
    wx.showLoading({
      title: '正在加载...',
      mask: true,
      success: function () {
        wx.request({
          url: app.globalData.APIURL + '/api/shop/classList',
          method: 'GET',
          dataType: 'json',
          success: function (res) {
            var arr = [];
            for (var i = 0; i < res.data.data.length; i++) {
              arr.push(res.data.data[i]);
            };
            that.setData({
              classifyArr: arr
            });
            wx.hideLoading();
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
    });
    /**
     * 获取城市数据初始化
     * **/
    wx.showLoading({
      title: '正在加载...',
      mask: true,
      success: function () {
        wx.getStorage({
          key: 'cityInfo',
          success: function (res) {
            if (res.data.indexShowCity == 0) {
              that.setData({
                indexShowCity: 0,
                cityName: res.data.cityName,
                cityID: res.data.cityID,
                district: res.data.district
              });
            } else if (res.data.indexShowCity == 1) {
              that.setData({
                indexShowCity: 1,
                cityName: res.data.cityName,
                cityID: res.data.cityID,
                district: ""
              });
            } else if (res.data.indexShowCity == 2) {
              that.setData({
                indexShowCity: 2,
                topName: res.data.topName,
                cityName: res.data.cityName,
                cityID: res.data.cityID,
                district: ""
              });
            } else if (res.data.indexShowCity == 3) {
              that.setData({
                indexShowCity: 3,
                topName: res.data.topName,
                cityName: res.data.cityName,
                cityID: res.data.cityID,
                district: ""
              });
            }
          },
        })
      }
    });
    /**
   * 获取入住协议
   * */
    wx.showLoading({
      title: '正在加载...',
      mask: true,
      success: function () {
        wx.request({
          url: app.globalData.APIURL + '/api/shop/agreement',
          method: 'GET',
          dataType: 'json',
          success: function (e) {
            if (e.data.code == 1) {
              WxParse.wxParse('Agreement', 'html', e.data.data, that, 5);
            }

          }
        })
      }
    });
   
  },
  loadeMoreData: function () {
    let that = this;
    that.data.page = that.data.page + 1;
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    wx.getStorage({
      key: 'loginStatus',
      success: function (res) {
        wx.request({
          url: app.globalData.APIURL + '/api/user/myShop1',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            p: that.data.page,
            uid: res.data.userID
          },
          success: function (res) {

            var getlist = that.data.myMerchantList
            if (res.data.code == 0) {
              wx.hideLoading();
              wx.showToast({
                title: 'o(╥﹏╥)o暂无数据',
                mask: true,
                icon: 'none'
              });

              return;
            } else if (res.data.code == 1) {
              for (var i = 0; i < res.data.data.length; i++) {
                getlist.push(res.data.data[i]);
              }
              that.setData({
                myMerchantList: getlist
              });
              wx.hideLoading();
            }
          }
        })
      },
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
    let that = this;
    that.myMerchantList();
    
   
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
    let that = this;
    if (that.data.selected == 1) {
      let that = this;
      that.loadeMoreData();
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {


  }
})