// pages/demand/index.js
var app = getApp();
var WxParse = require('../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    onePicShow: true,
    adshowid: 1,
    ADShopshow: true,
    selected: 1,
    classifyIndex: Number,
    classifyArr: [],
    cityIndex: Number,
    cityArr: [],
    demandListPic: {},
    demandPic: [],
    addPicShow: true,
    scrollHeight: app.globalData.screenHeight,
    APIURL: app.globalData.APIURL
  },

  selectADshow(e) {
    let that = this;
    console.log(e.currentTarget.dataset.adshowid);
    if (e.currentTarget.dataset.adshowid == 1) {
      that.setData({
        ADShopshow: true,
        ADdemandshow: false,
        adshowid: 1
      });
    } else if (e.currentTarget.dataset.adshowid == 2) {
      that.setData({
        ADShopshow: false,
        ADdemandshow: true,
        adshowid: 2
      });
    }
  },
  thumbnailU(){
    let that = this;
    wx.chooseImage({
      count: 1,  //最多可以选择的图片总数  
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
        var tempFilePaths = res.tempFilePaths;
        //启动上传等待中...  
        that.setData({
          thumbnailN: tempFilePaths
        });

      }
    });
  },

  demandPic: function (i) {
    console.log(i.currentTarget.dataset.imgid);
    let that = this;
      wx.chooseImage({
        count: 1,  //最多可以选择的图片总数  
        sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有  
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
          var tempFilePaths = res.tempFilePaths;
          //启动上传等待中...  
          wx.showLoading({
            title: '正在上传...',
            icon: 'loading',
            mask: true,
            duration: 10000
          })
          wx.uploadFile({
            url: app.globalData.APIURL + '/api/ad/upload',
            filePath: tempFilePaths[0],
            name: 'image',
            formData: {
              'image': tempFilePaths[0]
            },
            success: function (res) {
              var e = JSON.parse(res.data);
              console.log(e.data);
              if(e.code==1){
                wx.request({
                  url: app.globalData.APIURL + '/api/ad/updAdImg',
                  method: 'POST',
                  data: {
                    id: i.currentTarget.dataset.imgid,
                    img_url: e.data
                  },
                  success: function (e) {
                    console.log(e);

                  }
                })
              }
              that.getAdInfo();
              wx.hideLoading();
             
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
      });
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
  checkaddress(e) {
    var that = this;
    let address = e.currentTarget.dataset.name;
    that.setData({
      address: e.detail.value.replace(/\s+/g, "")
    })
  },
  checkdemandInfo(e) {
    var that = this;
    let demandInfo = e.currentTarget.dataset.name;
    that.setData({
      demandInfo: e.detail.value.replace(/\s+/g, "")
    })
  },
  upAd: function (e) {
    let that = this;
    console.log(e);
    if (e.detail.value.demandName == "") {
      wx.showToast({
        title: '广告名称不能为空！',
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
    } else if (e.detail.value.address == "") {
      wx.showToast({
        title: '地址不能为空！',
        mask: true,
        icon: 'none',
      });
      return false;
    } else if (e.detail.value.demandInfo == "") {
      wx.showToast({
        title: '广告描述不能为空！',
        mask: true,
        icon: 'none',
      });
      return false;
    } else if (e.detail.value.fmdemandPic == "") {
      wx.showToast({
        title: '请上传缩略图！',
        mask: true,
        icon: 'none',
      });
      return false;
    } else {
      var cityInfo = wx.getStorageSync('cityInfo');
      wx.showLoading({
        title: '正在加载中',
        icon: 'none',
        mask: true
      })
      console.log(that.data.adid);
      wx.getStorage({
        key: 'loginStatus',
        success: function (res) {
          wx.request({
            url: app.globalData.APIURL + '/api/ad/upd',
            method: 'POST',
            header: {
              'content-type': 'application/json'
            },
            data: {
              id: that.data.adid,
              title: e.detail.value.demandName,
              tel: e.detail.value.demandNum,
              content: e.detail.value.demandInfo,
              address: e.detail.value.address,
              uid: res.data.userID,
              area_id: cityInfo.cityID,
              thumbnail: e.detail.value.fmdemandPic,
              the_where: that.data.adshowid //广告位置 1 商家页 2 便民页

            },
            success: function (res) {
              console.log(res);
              wx.hideLoading();
              if (res.data.code == 1) {
                setTimeout(function () {
                  wx.hideLoading();
                  wx.navigateTo({
                    url: '../adPay/index?adid=' + res.data.data + '&title=' + e.detail.value.demandName,
                  });
                  
                }, 600);

              }
            },
            fail: function (e) {
              wx.showToast({
                title: '发布失败',
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


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(options);
    that.setData({
      adid:options.adid
    });
    that.getAdInfo();

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
  getAdInfo(){
    /**
    * 获取更新数据
    * */
    var that=this;
    wx.showLoading({
      title: '正在加载...',
      mask: true,
      success: function () {
        wx.request({
          url: app.globalData.APIURL + '/api/ad/info1',
          method: 'POST',
          data: {
            id:that.data.adid
          },
          success: function (e) {
            if (e.data.code == 1) {
              console.log(e.data.data);
              if (e.data.data.the_where == 1) {
                that.setData({
                  ADShopshow: true,
                  ADdemandshow: false,
                  adshowid: 1
                });
              } else if (e.data.data.the_where == 2) {
                that.setData({
                  ADShopshow: false,
                  ADdemandshow: true,
                  adshowid: 2
                });
              }
              that.setData({
                adInfo: e.data.data,
                demandName: e.data.data.title,
                address: e.data.data.address,
                demandInfo: e.data.data.content,
                thumbnail: e.data.data.thumbnail
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