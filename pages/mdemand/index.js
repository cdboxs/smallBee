// pages/demand/index.js
var app = getApp();
var WxParse = require('../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected: 1,
    payStatus:0,
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
  goNewsPay:function(e){
    let that=this;
    wx.navigateTo({
      url: '../demandPay/index?demandid=' + e.currentTarget.dataset.demandid + '&title=' + e.currentTarget.dataset.title,
    })
  },
  demandU(e){
    wx.navigateTo({
      url: '../mdemandU/index?demanduid=' + e.currentTarget.dataset.id
    })
  },
  demandPic: function (e) {
    let that = this;
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
            url: app.globalData.APIURL + '/api/news/upload',
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
                arr.push(productInfo.bannerInfo[i].imgs);
              }
              var arrJson = JSON.stringify(arr);
  
              that.setData({
                demandListPic: productInfo,
                demandPic: arrJson
              });
              if (arr.length >= 6) {
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
          url: app.globalData.APIURL + '/api/news/myNews',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            p:1,
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
  addDemand: function (e) {
    let that = this;

    if (e.detail.value.demandName=="") {
      wx.showToast({
        title: '便民名称不能为空！',
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
    }else{
      wx.showLoading({
        title: '正在加载中',
        icon:'none',
        mask:true
      })
      if (that.data.payStatus == 1) {
        wx.getStorage({
          key: 'loginStatus',
          success: function (res) {
            wx.request({
              url: app.globalData.APIURL + '/api/news/add',
              method: 'POST',
              header: {
                'content-type': 'application/json'
              },
              data: {
                title: e.detail.value.demandName,
                tel: e.detail.value.demandNum,
                content: e.detail.value.demandInfo,
                uid: res.data.userID,
                area_id: e.detail.value.shopCityID,
                address: e.detail.value.address,
                class_id: e.detail.value.demandClassIfy,
                img: e.detail.value.demandPic,
                status: 0

              },
              success: function (res) {
                if (res.data.code == 1) {
                  setTimeout(function(){
                    wx.hideLoading();
                    wx.navigateTo({
                      url: '../demandPay/index?demandid=' + res.data.data + '&title=' + res.data.title,
                    });
                    wx.hideLoading();
                  },600);
                 
                } else if (res.data.code == 3) {
                  wx.hideLoading();
                  wx.showModal({
                    title: '提示',
                    content: res.data.msg,
                    showCancel: false,
                    success: function () {
                      wx.switchTab({
                        url: '../member/index',
                      })
                    }
                  });
                  
                }
              },
              fail: function (e) {
                wx.showToast({
                  title: '发布失败',
                  mask: true,
                  icon: 'none',
                  duration:2000
                });
              }
            })
          },
        })
      } else if (that.data.payStatus == 0){
        wx.getStorage({
          key: 'loginStatus',
          success: function (res) {
            wx.request({
              url: app.globalData.APIURL + '/api/news/add',
              method: 'POST',
              header: {
                'content-type': 'application/json'
              },
              data: {
                title: e.detail.value.demandName,
                tel: e.detail.value.demandNum,
                content: e.detail.value.demandInfo,
                uid: res.data.userID,
                address: e.detail.value.address,
                area_id: e.detail.value.shopCityID,
                class_id: e.detail.value.demandClassIfy,
                img: e.detail.value.demandPic,
                status: 1

              },
              success: function (res) {

                if (res.data.code == 1) {
                  wx.hideLoading();
                  wx.showToast({
                    title: '发布成功',
                    icon: 'success',
                    mask: true,
                    duration: 1500,
                    success: function () {
                      wx.switchTab({
                        url: '../demand/index',
                      });
                    }
                  })
                  
                } else if (res.data.code == 3) {
                  wx.hideLoading();
                  wx.showModal({
                    title: '提示',
                    content: res.data.msg,
                    showCancel: false,
                    success: function () {
                      wx.switchTab({
                        url: '../member/index',
                      })
                    }
                  })
                }
              },
              fail: function (e) {
                wx.showToast({
                  title: '发布失败',
                  mask: true,
                  icon: 'none',
                  duration:2000
                });
              }
            })
          },
        })
      }

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
            url: app.globalData.APIURL + '/api/news/del',
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