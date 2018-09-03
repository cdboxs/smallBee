// pages/checkIn/index.js
const app = getApp();
var WxParse = require('../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classifyIndex: Number,
    classifyArr: [],
    cityIndex: Number,
    cityArr: [],
    start_time: '00:00',
    stop_time: '23:59',
    shopListPic: {},
    shopPicArr: [],
    APIURL: app.globalData.APIURL,
    payStatus:'0',
    activityType:'',
    checked:false,
    addPicShow:true,
    sendDisabled:false,
    activityShow:false,
    activityType:0
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
    let startString = e.detail.value.split(':');
    let endString = that.data.stop_time.split(':');
    if (parseInt(startString[0])< parseInt(endString[0])) {
      that.setData({
        start_time: e.detail.value
      })

    } else if (parseInt(startString[0]) == parseInt(endString[0])&& parseInt(startString[1]) > parseInt(endString[1])) {
      wx.showToast({
        title: '开始时间有误,请重新选择',
        mask: true,
        icon: 'none'
      });
      that.setData({
        start_time: "00:00"
      })
    }else{
      wx.showToast({
        title: '开始时间有误,请重新选择',
        mask: true,
        icon: 'none'
      });
      that.setData({
        start_time: "00:00"
      })
    } 
  },
  stop_time: function (e) {
    let that = this;
    let startString = that.data.start_time.split(':');
    let endString = e.detail.value.split(':');
    if (parseInt(startString[0]) < parseInt(endString[0])){
      that.setData({
        stop_time: e.detail.value
      })
      
    } else if (parseInt(startString[0]) ==parseInt(endString[0])&&parseInt(startString[1]) < parseInt(endString[1])){
      wx.showToast({
        title: '关闭时间有误,请重新选择',
        mask: true,
        icon: 'none'
      });
      that.setData({
        stop_time: "23:59"
      })
    }else{
      wx.showToast({
        title: '关闭时间有误,请重新选择',
        mask: true,
        icon: 'none'
      });
      that.setData({
        stop_time: "23:59"
      })
    }
    
  },
  selectActivity:function(e){
    var that=this;
    if (e.detail.value){
        that.setData({
          activityShow:true,
          activityType:1
        });
    }else{
      that.setData({
        activityShow: false,
        activityType:0
      });
    }
  },
  /**
   * 上传店铺实景图
   *  //console.log(tempFilePaths.length);
         //服务器返回格式: { "Catalog": "testFolder", "FileName": "1.jpg", "Url": "https://test.com/1.jpg" }
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            //启动上传等待中...
   * **/
  merchantPic: function () {
    var that = this;

    wx.chooseImage({
      count: 6,  //最多可以选择的图片总数  
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {
       
        var tempFilePaths = res.tempFilePaths;
      
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
              var productInfo = that.data.shopListPic;
              if (productInfo.bannerInfo == null) {
                productInfo.bannerInfo = [];
              }
              productInfo.bannerInfo.push({
                "imgs": e.data,
              });
  
              var arr = [];
              for (var i = 0; i < productInfo.bannerInfo.length; i++) {
                if (productInfo.bannerInfo.length>6){
                  wx.showToast({
                    title: '最多上传6张',
                  })
                  return;
                }
                arr.push(productInfo.bannerInfo[i].imgs);
              }
              var arrJson = JSON.stringify(arr);
              if (arrJson){
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
  payStatus:function(e){
    let that=this;
   if(e.detail.value[0]){
     that.setData({
       payStatus: '1',
       checked:true
     });
   }else{
     that.setData({
       payStatus: '0',
       checked: false
     });
   }
  },
  /**
   * 入驻添加数据
   * */
  checkName: function (e){
    var that=this;
    let shopName = e.currentTarget.dataset.name;
    that.setData({
      shopName: e.detail.value.replace(/\s+/g,"")
    })
  },
  checkAddress: function (e) {
    var that = this;
    let shopAddress = e.currentTarget.dataset.shopAddress;
    that.setData({
      shopAddress: e.detail.value.replace(/\s+/g,"")
    })
  },
  checkInF: function (e) {
    let that = this;
    if (e.detail.value.shopName==""){
      wx.showToast({
        title: '商户名不得为空！',
        mask:true,
        icon:'none',
      });
      return false;
    } else if (e.detail.value.shopPhone == "" || e.detail.value.shopPhone.length !=11){
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
        title: '定位失败,请重新定位！',
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
    } else if (e.detail.value.start_time == "" || e.detail.value.stop_time=="") {
      wx.showToast({
        title: '营业时间有误！',
        mask: true,
        icon: 'none',
      });
      return false; 
    } else{
      wx.showLoading({
        title: '正在加载中',
        icon:'none',
        mask:true
      })
      // that.setData({
      //   sendDisabled:true
      // });
      if (that.data.payStatus == 1) {
        wx.getStorage({
          key: 'loginStatus',
          success: function (res) {
            wx.request({
              url: app.globalData.APIURL + '/api/shop/join',
              method: 'POST',
              header: {
                'content-type': 'application/json'
              },
              data: {
                uid: res.data.userID,//
                area_id: e.detail.value.shopCityID,//城市ID
                class_id: e.detail.value.shopClassIfyID,//分类ID
                name: e.detail.value.shopName,//商户名称
                tel: e.detail.value.shopPhone,//商户电话
                address: e.detail.value.shopAddress,//详细地址
                start_time: e.detail.value.start_time,//开始时间
                stop_time: e.detail.value.stop_time,//结束时间
                description: e.detail.value.shopJJ,//介绍
                img: e.detail.value.shopics,//实景图
                type: that.data.activityType,//活动状态
                promotion_description: e.detail.value.activityInfo,//活动内容
                status: 0
              },
              success: function (o) {
                
                if (o.data.code == 1) {
                  setTimeout(function(){
                    wx.navigateTo({
                      url: '../pay/index?shopid=' + o.data.data + '&shop_name=' + o.data.shop_name,
                    });
                    wx.hideLoading();
                  },600);
                  
                } else if (o.data.code == 3){
                  setTimeout(function(){
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
                  },1000);
                 
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
              url: app.globalData.APIURL + '/api/shop/join',
              method: 'POST',
              header: {
                'content-type': 'application/json'
              },
              data: {
                uid: res.data.userID,//
                area_id: e.detail.value.shopCityID,//城市ID
                class_id: e.detail.value.shopClassIfyID,//分类ID
                name: e.detail.value.shopName,//商户名称
                tel: e.detail.value.shopPhone,//商户电话
                address: e.detail.value.shopAddress,//详细地址
                start_time: e.detail.value.start_time,//开始时间
                stop_time: e.detail.value.stop_time,//结束时间
                description: e.detail.value.shopJJ,//介绍
                img: e.detail.value.shopics,//实景图
                type: that.data.activityType,//活动状态
                promotion_description: e.detail.value.activityInfo,//活动内容
                status: 1
              },
              success: function (o) {
                if (o.data.code == 1) {
                  setTimeout(function(){
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
                  },1000);
                  }else if (o.data.code == 3){
                    setTimeout(function(){
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
                    },1000);
                  
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    /**
     * 获取分类数据初始化
     * **/
     if(options.classname){
       that.setData({
         classname:options.classname,
         classid: options.classid
       });
     }
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
     * 获取入住头部标题
     * */ 
    wx.showLoading({
      title: '正在加载...',
      mask: true,
      success: function () {
        wx.request({
          url: app.globalData.APIURL + '/api/shop/notice',
          method: 'GET',
          dataType: 'json',
          success: function (e) {
           WxParse.wxParse('article', 'html', e.data.data, that, 5)
          }
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
           if(e.data.code==1){
             WxParse.wxParse('Agreement', 'html', e.data.data, that, 5);
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