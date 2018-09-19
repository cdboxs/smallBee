// pages/city/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showSearch: false,
    noSearch: false
  },
 
//获取地区列表数据
  getCityList: function () {
    let that = this;
    wx.request({
      url: app.globalData.APIURL + '/api/shop/areaList',
      method: 'GET',
      dataType: 'json',
      success: function (e) {
        let cityArr = [];//城市名称
        let cityArrInArr = [];//城市名称
        let cityLetter = [];//城市首字母
        let region = [];
        let arrCityKeys={};
    
        for (var cityKey in e.data.data) {
          cityLetter.push(cityKey);
          cityArr.push(e.data.data[cityKey][0]);
          region.push(e.data.data[cityKey][0].data);
        }
        for (var i = 0; i < cityArr.length; i++){
          for (var j = 0; j < cityArr[i].length; j++) {
            cityArrInArr.push(cityArr[i][j]);
          }
        }
       
         for (var i = 0; i < cityArr.length;i++){
           var arr = Object.keys(cityArr[i]);
           var len = arr.length;
           //console.log(len - 1);
           var b = [];
           for (var objkey in cityArr[i]) {
             
            b.push(objkey);
            
           }
           //console.log(b);
           b.pop();
           arrCityKeys[i]=b;
         }
        //console.log(e.data.data['C'][1].data);
        that.setData({
          cityLetter: cityLetter,
          cityArr: cityArr,
          arrCityKeys: arrCityKeys,
          cityArrInArr: cityArrInArr
        });
      }
    })
  },

  getRegion: function (e) {
    if (e.target.dataset.districtname){
      var datas = {
        indexShowCity: 0,
        cityName: e.currentTarget.dataset.cityname,
        cityID: e.target.dataset.districtid,
        district: e.target.dataset.districtname
      }
     
    } else{
      var datas = {
        indexShowCity: 0,
        cityName: e.currentTarget.dataset.cityname,
        cityID: e.currentTarget.dataset.cityid,
        district: ''
      }
     
    }
    wx.setStorage({
      key: 'cityInfo',
      data: datas,
    })
    //获取页面栈
    var pages = getCurrentPages();
    if (pages.length > 1) { //说明有上一页存在
      //上一个页面实例对象
      var prePageyes = pages[pages.length - 2];
      //关键在这里，调用上一页的函数
      prePageyes.onReady(datas.cityID);
    }

    setTimeout(function(){
      wx.switchTab({
        url: '../index/index',
      })
    },300);
  },

  //获取搜索结果
  getCity: function (e) {
    let that=this;
    let getResult = e.currentTarget.dataset;
    if(getResult.status==1){
      var datas = {
        indexShowCity:1,
        topName: '',
        cityName: getResult.cityname,
        cityID: getResult.cityid,
        districtID: getResult.cityid
      }
    } else if (getResult.status == 2) {
        var datas = {
          indexShowCity: 2,
          topName: getResult.topname,
          cityName: getResult.cityname,
          cityID: getResult.cityid,
          districtID: getResult.cityid
        }
    } else if (getResult.status == 3) {
      var datas = {
        indexShowCity: 3,
        topName: getResult.topname,
        cityName: getResult.cityname,
        cityID: getResult.cityid,
        districtID: getResult.cityid
      }
    }else{
      var datas = {
        indexShowCity: 0,
        topName: getResult.topname,
        cityName: getResult.cityname,
        cityID: getResult.cityid,
        district: getResult.district
      }
    }
    wx.setStorage({
      key: 'cityInfo',
      data: datas,
    })
    //获取页面栈
    var pages = getCurrentPages();
    if (pages.length > 1) { //说明有上一页存在
      //上一个页面实例对象
      var prePageyes = pages[pages.length - 2];
      //关键在这里，调用上一页的函数
      prePageyes.onReady(datas.cityID);
    }
    setTimeout(function () {
      wx.switchTab({
        url: '../index/index',
      })
    }, 300);
  },
  //检索地级市
  searchCity: function (e) {
    let that = this;
    wx.showLoading({
      title: '正在搜索...',
      mask:true
    })
    setTimeout(function(){
      wx.request({
        url: app.globalData.APIURL + '/api/shop/areaid',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          area: e.detail.value
        },
        success: function (res) {
          // code=1：只有县级别结果
          if (res.data.code == 1) {
            wx.hideLoading();
            that.setData({
              cityStatus: 1,
              sCityName: res.data.data[0].name,
              sCityID: res.data.data[0].id,
              showSearch: true
            });
          }else if(res.data.code==2){
            wx.hideLoading();
            that.setData({
              cityStatus: 2,
              topCity: res.data.name,
              sCityName: res.data.data,
              showSearch: true
            });
          } else if (res.data.code == 3) {
            wx.hideLoading();
            that.setData({
              cityStatus: 3,
              sCityName: res.data.data,
              showSearch: true
            });
          } else if (res.data.code == 0) {
            wx.hideLoading();
            that.setData({
              cityStatus: 0,
              sCityName: '未找到结果',
              showSearch: true
            });
          }
        }
      })
    },2000);
  
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    that.getCityList();
    wx.getStorage({
      key: 'myCity',
      success: function (res) {
        if(res.data.district){
          that.setData({
            myCityName: res.data.cityName,
            myCityID: res.data.myCityID,
            district: res.data.district,
          });
        }else{
          that.setData({
            myCityName: res.data.cityName,
            myCityID: res.data.myCityID,
            district: '',
          });
        }
       
      },
    })
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