// pages/demand/index.js
var app = getApp();
var WxParse = require('../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    onePicShow:true,
    adshowid:1,
    ADShopshow:true,
    selected: 1,
    classifyIndex: Number,
    classifyArr: [],
    cityIndex: Number,
    cityArr: [],
    demandListPic:{},
    demandPic: [],
    page:1,
    addPicShow:true,
    scrollHeight: app.globalData.screenHeight,
    APIURL: app.globalData.APIURL
  },

  selectADshow(e){
    let that = this;
    console.log(e.currentTarget.dataset.adshowid);
    if (e.currentTarget.dataset.adshowid==1){
      that.setData({
        ADShopshow:true,
        ADdemandshow:false,
        adshowid: 1
      });
    } else if (e.currentTarget.dataset.adshowid == 2){
      that.setData({
        ADShopshow: false,
        ADdemandshow: true,
        adshowid:2
      });
    }
  },
  goNewsPay:function(e){
    let that=this;
    wx.navigateTo({
      url: '../demandPay/index?demandid=' + e.currentTarget.dataset.demandid + '&title=' + e.currentTarget.dataset.title,
    })
  },
  ueditorAd(e){
    let that = this;
    wx.navigateTo({
      url: '../myAdU/index?adid=' + e.currentTarget.dataset.adid
    })
  },
  demandPic: function (e) {
    let that = this;
    if (e.currentTarget.dataset.uploadtype==1){
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
                'image': tempFilePaths[0][0]
              },
              success: function (res) {
               var e = JSON.parse(res.data);
                wx.hideLoading();
                that.setData({
                  fmdemandListPic: e.data,
                  fmdemandPic: e.data,
                  onePicShow:false
                });
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
    }else if (e.currentTarget.dataset.uploadtype==2){
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
              url: app.globalData.APIURL + '/api/ad/upload',
              filePath: tempFilePaths[i],
              name: 'image',
              success: function (res) {
                uploadImgCount++;
                var e = JSON.parse(res.data);
                //服务器返回格式: { "Catalog": "testFolder", "FileName": "1.jpg", "Url": "https://test.com/1.jpg" }  
                var productInfo = that.data.demandListPic;
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

                that.setData({
                  demandListPic: productInfo,
                  demandPic: arrJson
                });
                if (arr.length >=6) {
                  that.setData({
                    addPicShow: false
                  });
                }
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
    }


},

menuS: function (e) {
    var that = this;
    if (e.target.dataset.id) {
      that.setData({
        selected: e.target.dataset.id
      });
    }
  },
  demandList: function () {
    let that = this;
    that.setData({
      page:1
    });
    wx.getStorage({
      key: 'loginStatus',
      success: function (res) {
        wx.request({
          url: app.globalData.APIURL + '/api/ad/myad',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            uid: res.data.userID
          },
          success: function (res) {
            if(res.data.code==1){
                that.setData({
                  myDemandList:res.data.data
                });
            }else if(res.data.code==0){
              that.setData({
                myDemandList:[]
              });
            }

          }
        })
      },
    })
  },
  checkName: function (e) {
    var that = this;
    let demandName = e.currentTarget.dataset.name;
    that.setData({
      demandName: e.detail.value.replace(/\s+/g, "")
    })
  },
  checkaddress(e){
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
  addAd: function (e) {
    let that = this;
    if (e.detail.value.demandName=="") {
      wx.showToast({
        title: '广告名称不能为空！',
        mask: true,
        icon: 'none',
      });
      return false;
    } else if (e.detail.value.demandNum == ""){
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
    } else{
      var cityInfo = wx.getStorageSync('cityInfo');
      wx.showLoading({
        title: '正在加载中',
        icon:'none',
        mask:true
      })
      wx.getStorage({
        key: 'loginStatus',
        success: function (res) {
          wx.request({
            url: app.globalData.APIURL + '/api/ad/add',
            method: 'POST',
            header: {
              'content-type': 'application/json'
            },
            data: {
              title: e.detail.value.demandName,
              tel: e.detail.value.demandNum,
              content: e.detail.value.demandInfo,
              address: e.detail.value.address,
              uid: res.data.userID,
              area_id: cityInfo.cityID,
              thumbnail: e.detail.value.fmdemandPic,
              img: e.detail.value.demandPic,
              the_where:1 //广告位置 1 商家页 2 便民页

            },
            success: function (res) {
              if (res.data.code == 1) {
                setTimeout(function () {
                  wx.hideLoading();
                  wx.navigateTo({
                    url: '../adPay/index?adid=' + res.data.data + '&title=' + e.detail.value.demandName,
                  });
                  wx.hideLoading();
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
  del: function (e) {
    let that=this;
    wx.showModal({
      title: '小蜜蜂提示',
      content: '确定要删除此信息？',
      success: function (m) {
        if (m.confirm==true) {
          wx.request({
            url: app.globalData.APIURL + '/api/ad/delAd',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            data: {
              id: e.currentTarget.dataset.id
            },
            success: function (res) {
              if (res.data.code == 1) {
                that.setData({
                  selected: 1
                });
                that.demandList();
              }
            }
          })
        } else if (m.cancel==true){
          return;
        }
      }
    })
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    
    if(options.select==2){
      if (options.classname){
        that.setData({
          selected: '2',
          classname: options.classname,
          classid: options.classid
        });
      }else{
        that.setData({
          selected: '2'
        });
      }
      
    } else if (options.select == 1){
      that.setData({
        selected: '1'
      });
    }else{
      that.setData({
        selected: '1'
      });
    }
    
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
            } else if(res.data.indexShowCity == 1){
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
                indexShowCity:3,
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
  loadeMoreData:function(){
    let that = this;
    that.data.page = that.data.page + 1;
    wx.showLoading({
      title: '正在加载',
      mask:true
    })
    wx.getStorage({
      key: 'loginStatus',
      success: function (res) {
        wx.request({
          url: app.globalData.APIURL + '/api/news/myNews',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            p: that.data.page,
            uid: res.data.userID
          },
          success: function (res) {

            var getlist = that.data.myDemandList
            if (res.data.code == 0) {
              wx.hideLoading();
              wx.showToast({
                title: 'o(╥﹏╥)o暂无数据',
                mask: true,
                icon: 'none'
              });
             
              return;
            } else if (res.data.code == 1){
              for (var i = 0; i < res.data.data.length; i++) {
                getlist.push(res.data.data[i]);
              }
              that.setData({
                myDemandList: getlist
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
    that.demandList();
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
    let that=this;
    if (that.data.selected==1){
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