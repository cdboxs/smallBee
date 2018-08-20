// pages/checkIn/index.js
const app = getApp();
var WxParse = require('../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    setclassifyID: '',
    classifyIndex: Number,
    classifyArr: [],
    cityIndex: Number,
    cityArr: [],
    start_time: '00:00',
    stop_time: '23:59',
    shopid:'',
    logoURL: '',
    shopListPic: {},
    shopPicArr: [],
    APIURL: app.globalData.APIURL
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
  
 
  /**
  * 上传店铺实景图
  * **/
  merchantPic: function () {
    var that = this;

    wx.chooseImage({
      count: 4,  //最多可以选择的图片总数  
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
                arr.push(productInfo.bannerInfo[i].imgs);
              }
              var arrJson = JSON.stringify(arr);
     
              that.setData({
                shopListPic: productInfo,
                shopPicArr: arrJson
              });
       
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
  /**
   * 入驻添加数据
   * */
  checkName: function (e) {
    console.log(e);
    var that = this;
    let name = e.currentTarget.dataset.name;
    that.setData({
      name: e.detail.value.replace(/\s+/g, "")
    })
  },
  checkAddress: function (e) {
    var that = this;
    let address = e.currentTarget.dataset.shopAddress;
    that.setData({
      address: e.detail.value.replace(/\s+/g, "")
    })
  },
  checkInF: function (e) {
    let that = this;

    if (e.detail.value.shopName == "") {
      wx.showToast({
        title: '商户名不得为空！',
        mask: true,
        icon: 'none',
      });
      return false;
    } else if (e.detail.value.shopPhone == "" || e.detail.value.shopPhone.length != 11) {
      wx.showToast({
        title: '电话输入有误！',
        mask: true,
        icon: 'none',
      });
      return false;
    } else if (e.detail.value.shopClassIfyID == "") {
      wx.showToast({
        title: '请选择商店分类！',
        mask: true,
        icon: 'none',
      });
      return false;
    } else if (e.detail.value.shopCityID == "") {
      wx.showToast({
        title: '请选择所在城市（县）！',
        mask: true,
        icon: 'none',
      });
      return false;
    } else if (e.detail.value.shopAddress == "") {
      wx.showToast({
        title: '详细地址不能为空！',
        mask: true,
        icon: 'none',
      });
      return false;
    } else if (e.detail.value.start_time == "" || e.detail.value.stop_time == "") {
      wx.showToast({
        title: '营业时间有误！',
        mask: true,
        icon: 'none',
      });
      return false;
    }else {
      wx.getStorage({
        key: 'loginStatus',
        success: function (res) {

          wx.request({
            url: app.globalData.APIURL + '/api/user/updShop',
            method: 'POST',
            header: {
              'content-type': 'application/json'
            },
            data: {
              id: e.detail.value.shopid,//店铺id
              area_id: e.detail.value.shopCityID,//城市ID
              class_id: e.detail.value.shopClassIfyID,//分类ID
              name: e.detail.value.shopName,//商户名称
              tel: e.detail.value.shopPhone,//商户电话
              address: e.detail.value.shopAddress,//详细地址
              start_time: e.detail.value.start_time,//开始时间
              stop_time: e.detail.value.stop_time,//结束时间
              description: e.detail.value.shopJJ,//介绍
              img: e.detail.value.shopics//实景图
              //logo: e.detail.value.shopLogo,//商户logo
            },
            success: function (e) {
              if (e.data.code == 1) {
                wx.showModal({
                  title: '提示',
                  content: '更新成功',
                  showCancel: false,
                  success: function () {
                    wx.switchTab({
                      url: '../index/index',
                    });
                  }
                })
              } else if (e.data.code == 0) {
                wx.showModal({
                  title: '提示',
                  content: '更新失败,请联系管理员',
                  showCancel: false,
                  success: function () {
                    wx.switchTab({
                      url: '../member/index',
                    });
                  }
                })
              }

            },
            fail: function (e) {
              wx.showToast({
                title: '服务器错误',
                icon: 'success',
                mask: true,
                duration: 1500,
                success: function () {
                  wx.switchTab({
                    url: '../index/index',
                  });
                }
              })
            }
          })
        }
      })
    }


  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      shopid: options.shopid
    });
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
              classifyArr: arr,
            });
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
         * 获取入住头部标题
         * */
        wx.request({
          url: app.globalData.APIURL + '/api/shop/notice',
          method: 'GET',
          dataType: 'json',
          success: function (e) {
            WxParse.wxParse('article', 'html', e.data.data, that, 5)
          }
        });


      }
    });

    /*加载我的店铺数据*/ 
    setTimeout(function () {
      var getStorage = wx.getStorageSync('loginStatus');
      if (getStorage) {
        wx.request({
          url: app.globalData.APIURL + '/api/user/shopInfo',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: { id: that.data.shopid },
          success: function (e) {
            if (e.data.code == 1) {

              that.setData({
              
                  id: e.data.data.id,//
                  name: e.data.data.name,//商户名称
                  tel: e.data.data.tel,//商户电话
                  address: e.data.data.address,//详细地址
                  description: e.data.data.description,//介绍
                  //imgs: e.data.data.imgs,
                
                //logoURL: e.data.data.logo,//商户logo
                //classifyIndex: e.data.data.class_id,
                //cityIndex: e.data.data.area_id-1,
                start_time: e.data.data.start_time,//开始时间
                stop_time: e.data.data.stop_time,//结束时间
              });
              for (var i = 0; i < that.data.classifyArr.length; i++) {
                if (e.data.data.class_id == that.data.classifyArr[i].id) {
                  that.setData({
                    classifyIndex: i
                  });
                }
              }
              for (var i = 0; i < that.data.cityArr.length; i++) {
                if (that.data.cityArr[i].id == e.data.data.area_id) {
                  that.setData({
                    cityIndex: i
                  });
                }
              }
              wx.hideLoading();
              //console.log(that.data.cityIndex);
            }
          }
        })
      }
    }, 800);
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