// userInfo.js
const app = getApp();

Page({
  data: {
    name: '',
    role: '',
    department: '',
    openid: '',
    submitLoading: false,
    focusField: '' // 当前焦点输入框
  },
  
  onLoad: function() {
    // 获取用户的openid
    this.getOpenid();
  },
  
  // 分享给好友
  onShareAppMessage: function () {
    return {
      title: '请填写您的用户信息',
      path: '/pages/userInfo/userInfo',
      imageUrl: '/assets/images/bg.jpg'
    }
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
  
  // 输入框获取焦点
  inputFocus: function(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      focusField: field
    });
  },
  
  // 输入框失去焦点
  inputBlur: function() {
    this.setData({
      focusField: ''
    });
  },
  
  // 输入框内容变化时触发
  inputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value
    });
  },
  
  // 返回首页
  backToHome: function() {
    wx.navigateTo({
      url: '/pages/home/home'
    });
  },
  
  // 提交表单
  submitForm: function() {
    const { name, role, department, openid } = this.data;
    
    // 表单验证
    if (!name.trim()) {
      this.showToast('请输入姓名');
      return;
    }
    
    if (!role.trim()) {
      this.showToast('请输入角色');
      return;
    }
    
    if (!department.trim()) {
      this.showToast('请输入部门');
      return;
    }
    
    if (!openid) {
      this.showToast('获取用户信息失败，请重试');
      return;
    }
    
    // 设置提交状态
    this.setData({
      submitLoading: true
    });
    
    // 显示加载提示
    wx.showLoading({
      title: '提交中...',
    });
    
    // 调用接口提交数据
    wx.request({
      url: 'https://gongxuchaxun.weimeigu.com.cn/saveUserInfo',
      // url: 'http://localhost:2910/saveUserInfo',
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
          this.showSuccess('提交成功');
          
          // 提交成功后跳转到首页
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/home/home'
            });
          }, 1500);
        } else {
          this.showToast(res.data.message || '提交失败，请重试');
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('提交失败', err);
        this.showToast('网络错误，请重试');
      },
      complete: () => {
        this.setData({
          submitLoading: false
        });
      }
    });
  },
  
  // 显示普通提示
  showToast: function(title) {
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 2000
    });
  },
  
  // 显示成功提示
  showSuccess: function(title) {
    wx.showToast({
      title: title,
      icon: 'success',
      duration: 2000
    });
  }
}) 