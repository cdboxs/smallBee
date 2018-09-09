// pages/merchantList/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showMask:false,
    hideMask:'',
    hasMask:'',
    noData:false,
    yesData:true,
    page:1,
    getClassID:'',
    classId:'',
    merchantList:[],
    moneyShopList:[],
    screenWidth: app.globalData.screenWidth,
    screenHeight: app.globalData.screenHeight,
    APIURL: app.globalData.APIURL,
    loading: true,
    hidden: 'hidden'
  },

  hidemask:function(){
    let that = this;
    that.setData({
      showMask: false,
    });
  },
  mask:function(){
    let that=this;
    if (that.data.showMask){
      that.setData({
        showMask: false,
      });
    }else{
      that.setData({
        showMask: true,
      });
    }
    
  },
  merchantInfo: function (e) {

    wx.navigateTo({
      url: '../merchantInfo/index?id=' + e.currentTarget.dataset.shopid,
    })
  },
  /*
    入驻前判断是否登录授权，
  */
  checkIn: function (e) {
    console.log(e);
    var that=this;
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
              url: '../checkIn/index?classname=' + e.currentTarget.dataset.classname + '&classid=' + e.currentTarget.dataset.classid,
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


  /**
   * 获取列表页分类数据
   * **/ 
  merchantClassify:function(e){
    let that = this;
    wx.request({
      url: app.globalData.APIURL + '/api/shop/classList',
      method: 'GET',
      dataType: 'json',
      success: function (e) {
        that.setData({
          Listclassify: e.data.data
        });
      },
      fail:function(e){
        wx.showToast({
          title: '数据请求失败,请检测网络',
          mask: true,
          icon:'none'
        });
      }
    })
  },
  /**
   * 列表页分类点击切换数据
   * **/ 
  checkClass:function(e){
    console.log(e);
    let that=this;
    that.setData({
      page: 1,
      getClassID: e.currentTarget.dataset.id,
      classId: e.currentTarget.dataset.id,
      className: e.currentTarget.dataset.classname
    });
    that.getMerChantList(that.data.getClassID, that.data.page);
    that.hidemask();  
  },
  // showShopData:function(e){
  //   let that = this;
  //   that.setData({
  //     page:1,
  //     classId:e.target.dataset.id
  //   });
  //   that.getMerChantList(e.target.dataset.id,that.data.page);
  //     that.hidemask();   
  // },
  /**
   * 列表页展示数据
   * **/ 
  getMerChantList: function (class_id,postpage){
    let that=this; 
    if (class_id) {
      wx.getStorage({
        key: 'cityInfo',
        success: function (res) {
              wx.request({
                url: app.globalData.APIURL + '/api/shop/shopList1',
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                  area_id: res.data.cityID,
                  p: postpage,
                  class_id: class_id
                },
                success: function (e) {
                  if (e.data.code == 1) {
                    for (let i = 0; i < e.data.data.length; i++) {
                      e.data.data[i].description = e.data.data[i].description.substring(0, 56);
                    }
                  }
                  if (e.data.code == 0) {
                    setTimeout(function () {
                      that.setData({
                        merchantList: [],
                        yesData: false,
                        noData: true,
                        loading: false,
                        hidden: 'auto'
                      });
                    }, 800);
                    return;
                  };
                  if (postpage==1){
                    setTimeout(function () {
                      that.setData({
                        merchantList: e.data.data,
                        moneyShopList:e.data.top,
                        yesData: true,
                        noData: false,
                        loading: false,
                        hidden: 'auto'
                      });
                      wx.hideLoading();
                    }, 300);
                    
                  } else if (postpage > e.data.pages){
                      wx.showToast({
                        title: '没有更多数据了',
                        mask:true,
                        icon:'none'
                      })
                  }else{
                    var getList = that.data.merchantList;
                   
                    for (var i = 0; i < e.data.data.length; i++) {
                      getList.push(e.data.data[i]);
                    }
                   
                    setTimeout(function () {
                      that.setData({
                        merchantList: getList,
                        yesData: true,
                        noData: false,
                        loading: false,
                        hidden: 'auto'
                      });
                      wx.hideLoading();
                    }, 300);
                  }
                 

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
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    that.setData({
      classId: options.classId,
      className: options.classname
    });
    if (that.data.classId) {
      setTimeout(function () {
        that.merchantClassify();
        that.getMerChantList(that.data.classId, 1);
        wx.hideLoading();
      }, 800);
    };
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
   
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (e) {
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
    let that = this;
    that.setData({
      page:1
    });
  
    if(that.data.classId){
      setTimeout(function () {
        that.merchantClassify();
        that.getMerChantList(that.data.classId,that.data.page);
        wx.stopPullDownRefresh();
        wx.hideLoading();
      }, 500);
    }
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that=this;
    
    if (that.data.classId) {
      // 显示加载图标  
      wx.showLoading({
        title: '正在加载中...',
        mask:true,
        icon:'none'
      })  
     
      that.data.page = that.data.page + 1;
      that.getMerChantList(that.data.classId, that.data.page);
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})