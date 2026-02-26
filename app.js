// app.js
App({
  onLaunch() {
    this.getOpenid();
  },
  // 获取 openid
  getOpenid() {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.request({
            url: 'https://www.yangyijin.asia/getOpenid',
            // url: 'http://localhost:2910/getOpenid',
            method: 'POST',
            data: { code: res.code },
            success: (response) => {
              if (response.data.openid) {
                console.log('response.data.openid', response.data.openid);
                // 将 openid 存储到 globalData
                this.globalData.openid = response.data.openid;
                // 触发 openid 更新事件
                this.emitOpenidUpdate();
              } else {
                wx.showToast({ title: '获取 openid 失败', icon: 'none' });
              }
            },
            fail: (err) => {
              wx.showToast({ title: '网络请求失败', icon: 'none' });
            }
          });
        } else {
          wx.showToast({ title: '登录失败', icon: 'none' });
        }
      }
    });
  },
  // 触发 openid 更新事件
  emitOpenidUpdate() {
    if (this.openidUpdateCallback) {
      this.openidUpdateCallback(this.globalData.openid);
    }
  },
  // 注册 openid 更新回调
  onOpenidUpdate(callback) {
    this.openidUpdateCallback = callback;
  },
  globalData: {
    openid: null // 用于存储 openid
  }
})
