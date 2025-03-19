const app = getApp();

Page({
    data: {
        showScanButton: false, // 是否显示“扫描二维码”按钮
        showViewButton: false, // 是否显示“查看订单”按钮
      userRole: null, // 用户角色
      userDepartment: null // 用户部门
    },
  
    onLoad() {
        // 监听 openid 更新
        app.onOpenidUpdate((openid) => {
            this.setData({ openid });
            this.checkUserRole();
        });
    },
  
    // 检查用户角色
    checkUserRole() {
        const openid = this.data.openid;
      console.log('openid', openid);
      wx.request({
        url: 'https://gongxuchaxun.weimeigu.com.cn/auth',
        // url: 'http://localhost:2910/auth',
        method: 'POST',
        data: { openid },
        success: (res) => {
            console.log('auth_res.data', res.data);
          if (res.data.error) {
            wx.showToast({ title: res.data.error, icon: 'none' });
          } else {
            const { role, department } = res.data;
            this.setData({
              userRole: role,
              userDepartment: department
            });
            this.updateButtonVisibility(role); // 根据角色更新按钮显示状态
          }
        }
      });
    },

    // 根据角色更新按钮显示状态
  updateButtonVisibility(role) {
    if (role === '用户') {
      this.setData({
        showScanButton: true,
        showViewButton: false
      });
    } else if (role === '超级管理员' || role === '部门管理员') {
      this.setData({
        showScanButton: false,
        showViewButton: true
      });
    } else {
      this.setData({
        showScanButton: false,
        showViewButton: false
      });
    }
  },
  
    // 扫描二维码
    scanCode() {
      wx.scanCode({
        success: (res) => {
          wx.request({
            url: 'https://gongxuchaxun.weimeigu.com.cn/scan',
            // url: 'http://localhost:2910/scan',
            method: 'POST',
            data: { qrCodeData: res.result },
            success: (response) => {
              if (response.data.status === 'found') {
                // 跳转到上报加工状态页面，并传递订单数据
                wx.navigateTo({
                    url: '/pages/reportStatus/reportStatus',
                    success: (res) => {
                    res.eventChannel.emit('acceptData', response.data.data);
                    }
                });
              } else if (response.data.status === 'completed') {
                wx.showToast({ title: '订单已完成' });
              } else {
                wx.showToast({ title: '订单不存在', icon: 'none' });
              }
            }
          });
        }
      });
    },
  
    // 查看订单
  viewOrders() {
    const { userRole, userDepartment } = this.data;
    wx.navigateTo({
      url: '/pages/orderList/orderList',
      success: (res) => {
        // 通过事件通道传递用户角色和部门信息
        res.eventChannel.emit('acceptData', {
          role: userRole,
          department: userDepartment
        });
      }
    });
  }
  });