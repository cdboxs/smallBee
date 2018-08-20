// pages/pay/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    days: ['1', '5', '15', '30'],
    index: 0,
    selectDay:0,
    discountTip:'/无折扣',
    discount:0
  },
  checkDay: function (e) {
    let that = this;
    this.setData({
      index: e.detail.value,
      selectDay: that.data.days[e.detail.value]
    });
    switch (e.detail.value){
      case'0':
        this.setData({
          discountTip:'/无折扣',
          discount:1
        });
      break;
      case '1':
        this.setData({
          discountTip: '/9.5折',
          discount:0.95
        });
      break;
      case '2':
        this.setData({
          discountTip: '/9折',
          discount:0.9
        });
      break;
      case '3':
        this.setData({
          discountTip: '/8折',
          discount:0.8
        });
      break;
    }
    wx.request({
      url: app.globalData.APIURL + '/api/pay/price',
      method: 'GET',
      success: function (res) {
        that.setData({
          money: that.data.days[e.detail.value] * res.data.data * that.data.discount
        });
      },
      error: function (res) {

      }
    });
  },
  order:function(e){
      if (e.detail.value.ktimes == "") {
        wx.showToast({
          title: '开通天数不能为空！',
          icon: 'none',
          mask: true
        });
        return;
      } else if (isNaN(parseFloat(e.detail.value.ktimes))) {
        wx.showToast({
          title: '开通天数必须是数字！',
          icon: 'none',
          mask: true
        });
        return;
      }else{
        wx.showLoading({
          title: '正在下单中...',
          mask:true,
        });
        wx.request({
          url: app.globalData.APIURL + '/api/pay/getOrder',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            shop_id: e.detail.value.shopID,
            days: parseFloat(e.detail.value.ktimes),
            order_amount: parseFloat(e.detail.value.payMoney)
          },
          success: function (res) {
            wx.hideLoading();
            if(res.data.code==1){
              wx.getStorage({
                key: 'loginStatus',
                success: function (l) {

                  wx.request({
                    url: app.globalData.APIURL + '/api/pay/pay',
                    method: 'POST',
                    header: {
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    data: {
                      order_id: res.data.data,
                      openid: l.data.openid
                    },
                    success: function (e) {
                     
                      let timeStamp = e.data.data.timeStamp.toString();
                      if (e.data.code == 1 && timeStamp){
                       wx.requestPayment({
                         timeStamp: timeStamp,
                         nonceStr: e.data.data.nonceStr,
                         package: e.data.data.package,
                         signType: e.data.data.signType,
                         paySign: e.data.data.paySign,
                         success: function (e) {
                           wx.showToast({
                             title: '入驻成功',
                             mask: true,
                             icon: 'success',
                             success: function () {
                               setTimeout(function () {
                                 wx.switchTab({
                                   url: '../index/index',
                                 })
                               }, 1500);

                             }
                           })

                         },
                         fail: function (e) {
                           wx.showToast({
                             title: '支付失败',
                             mask: true,
                             icon: 'success',
                             success: function () {
                               wx.switchTab({
                                 url: '../member/index',
                               })
                             }
                           })

                         }
                       })
                     }
                     
                    },
                    fail: function (e) {
                      console.log(e);
                    }
                  })
                },
              })
             
            }
          },
          fail: function (res) {
            wx.showToast({
              title: '下单失败，请重新下单',
              mask: true,
              icon: 'none',
            })
          }
        });
      }
   
  },
  calculation:function(e){
   
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   let that=this;
   that.setData({
     shopid:options.shopid,
     shop_name: options.shop_name
   });
   /*加载默认价格*/
   wx.showLoading({
     title: '正在加载...',
     mask: true,
   });
   setTimeout(function () {
     wx.request({
       url: app.globalData.APIURL + '/api/pay/price',
       method: 'GET',
       success: function (res) {

         that.setData({
           money: that.data.days[that.data.selectDay] * res.data.data * that.data.days[that.data.discount],
         });
         wx.hideLoading();
       },
       error: function (res) {

       }
     });
   }, 300);
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
  onShareAppMessage: function () {
  
  }
})