// userInfo.js
const app = getApp();

Page({
  data: {
    name: '',
    role: '',
    department: '',
    openid: ''
  },
  
  onLoad: function() {
    // 获取用户的openid
    this.getOpenid();
  },
  
  // 获取用户openid
  getOpenid: function() {
    // 如果app.globalData中已有openid，直接使用
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      });
      console.log('获取到openid:', app.globalData.openid);
    } else {
      // 如果没有，注册回调函数等待openid更新
      app.onOpenidUpdate(openid => {
        this.setData({
          openid: openid
        });
        console.log('通过回调获取到openid:', openid);
      });
    }
  },
  
  // 输入框内容变化时触发
  inputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value
    });
  },
  
  // 提交表单
  submitForm: function() {
    const { name, role, department, openid } = this.data;
    
    // 表单验证
    if (!name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }
    
    if (!role.trim()) {
      wx.showToast({
        title: '请输入角色',
        icon: 'none'
      });
      return;
    }
    
    if (!department.trim()) {
      wx.showToast({
        title: '请输入部门',
        icon: 'none'
      });
      return;
    }
    
    if (!openid) {
      wx.showToast({
        title: '获取用户信息失败，请重试',
        icon: 'none'
      });
      return;
    }
    
    // 显示加载提示
    wx.showLoading({
      title: '提交中...',
    });
    
    // 调用接口提交数据
    wx.request({
      url: 'https://gongxuchaxun.weimeigu.com.cn/saveUserInfo', // 根据实际接口修改
      method: 'POST',
      data: {
        openid: openid,
        name: name,
        role: role,
        department: department
      },
      success: (res) => {
        wx.hideLoading();
        
        if (res.statusCode === 200 && res.data.success) {
          wx.showToast({
            title: '提交成功',
            icon: 'success'
          });
          
          // 提交成功后跳转到首页或其他页面
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.message || '提交失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('提交失败', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  }
}) 