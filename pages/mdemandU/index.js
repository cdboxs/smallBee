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
    classifyIndex: Number,
    classifyArr: [],
    cityIndex: Number,
    cityArr: [],
    demandListPic: {},
    demandPic: [],
    page: 1,
    addPicShow: true,
    scrollHeight: app.globalData.screenHeight,
    APIURL: app.globalData.APIURL
  },



  menuS: function (e) {
    var that = this;
    if (e.target.dataset.id) {
      that.setData({
        selected: e.target.dataset.id
      });
    }
  },
  checkName: function (e) {
    var that = this;
    let demandName = e.currentTarget.dataset.name;
    that.setData({
      demandName: e.detail.value.replace(/\s+/g, "")
    })
  },
  demandU: function (e) {
    let that = this;

    if (e.detail.value.demandName == "") {
      wx.showToast({
        title: '便民名称不能为空！',
        mask: true,
        icon: 'none',
      });
      return false;
    } else if (e.detail.value.demandNum == "") {
      wx.showToast({
        title: '电话不能为空！',
        mask: true,
        icon: 'none',
      });
      return false;
    } else if (e.detail.value.demandClassIfy == "") {
      wx.showToast({
        title: '请选择分类',
        mask: true,
        icon: 'none',
      });
      return false;
    } else if (e.detail.value.demandCity == "") {
      wx.showToast({
        title: '请选择地区',
        mask: true,
        icon: 'none',
      });
      return false;
    } else if (e.detail.value.demandInfo == "") {
      wx.showToast({
        title: '详细便民不能为空',
        mask: true,
        icon: 'none',
      });
      return false;
    } else {
      wx.showLoading({
        title: '正在加载中',
        icon: 'none',
        mask: true
      })
        wx.getStorage({
          key: 'loginStatus',
          success: function (res) {
            wx.request({
              url: app.globalData.APIURL + '/api/news/upd',
              method: 'POST',
              header: {
                'content-type': 'application/json'
              },
              data: {
                id: that.data.demanduid,
                title: e.detail.value.demandName,
                tel: e.detail.value.demandNum,
                content: e.detail.value.demandInfo,
                uid: res.data.userID,
                area_id: e.detail.value.shopCityID,
                address: e.detail.value.address,
                class_id: e.detail.value.demandClassIfy,

              },
              success: function (res) {
                console.log(res);
                if (res.data.code == 1) {
                  setTimeout(function () {
                    wx.hideLoading();
                   wx.navigateBack({
                     delta:1
                   })
                    wx.hideLoading();
                  }, 600);

                } 
              },
              fail: function (e) {
                wx.showToast({
                  title: '更新失败',
                  mask: true,
                  icon: 'none',
                  duration: 2000
                });
              }
            })
          },
        })


    }


  },


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
    });

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(options.demanduid);
    that.setData({
      demanduid:options.demanduid
    });
    /**
    * 获取分类数据初始化
    * **/
    wx.showLoading({
      title: '正在加载...',
      mask: true,
      success: function () {
        wx.request({
          url: app.globalData.APIURL + '/api/News/classList',
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
    that.getAdInfo();
    /**
 * 获取入住协议
 * */
    wx.showLoading({
      title: '正在加载...',
      mask: true,
      success: function () {
        wx.request({
          url: app.globalData.APIURL + '/api/news/agreement',
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
  getAdInfo() {
    /**
    * 获取更新数据
    * */
    var that = this;
    wx.showLoading({
      title: '正在加载...',
      mask: true,
      success: function () {
        wx.request({
          url: app.globalData.APIURL + '/api/News/newsInfo',
          method: 'POST',
          data: {
            id: that.data.demanduid
          },
          success: function (e) {
            if (e.data.code == 1) {
              console.log(e.data.data);
           
              that.setData({
                demandInfo: e.data.data,
                demandName: e.data.data.title,
                address: e.data.data.address,
                content: e.data.data.content,
                classname: e.data.data.class_name,
                classid: e.data.data.class_id,
                tel: e.data.data.tel
              });
              wx.hideLoading();
            }

          }
        })
      }
    });
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
  onShareAppMessage: function (res) {


  }
})