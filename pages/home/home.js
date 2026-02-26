const app = getApp();

Page({
    data: {
        showScanButton: false, // 是否显示"扫描二维码"按钮
        showViewButton: false, // 是否显示"查看订单"按钮
        showAdminScanButton: false, // 是否显示"扫码查看"按钮（管理员用）
      userName: null, // 用户名称
      userRole: null, // 用户角色
      userDepartment: null // 用户部门
    },
  
    onLoad() {
      // 如果app.globalData中已有openid，直接使用
      if (app.globalData.openid) {
        this.setData({ openid: app.globalData.openid });
        this.checkUserRole();
      } else {
        // 监听 openid 更新
        app.onOpenidUpdate((openid) => {
            this.setData({ openid });
            this.checkUserRole();
        });
      }
    },
  
    // 检查用户角色
    checkUserRole() {
        const openid = this.data.openid;
      console.log('openid', openid);
      wx.request({
        url: 'https://www.yangyijin.asia/auth',
        // url: 'http://localhost:2910/auth',
        method: 'POST',
        data: { openid },
        success: (res) => {
            console.log('auth_res.data', res.data);
          if (res.data.error) {
            wx.showToast({ title: res.data.error, icon: 'none' });
          } else {
            const { name, role, department } = res.data;
            this.setData({
              userName: name,
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
        showViewButton: false,
        showAdminScanButton: false
      });
    } else if (role === '超级管理员' || role === '部门管理员') {
      this.setData({
        showScanButton: false,
        showViewButton: true,
        showAdminScanButton: true
      });
    } else {
      this.setData({
        showScanButton: false,
        showViewButton: false,
        showAdminScanButton: false
      });
    }
  },
  
    // 扫描二维码（普通用户）
    scanCode() {
      const { userName, userDepartment } = this.data;
      wx.scanCode({
        success: (res) => {
          wx.request({
            url: 'https://www.yangyijin.asia/scan',
            // url: 'http://localhost:2910/scan',
            method: 'POST',
            data: { qrCodeData: res.result },
            success: (response) => {
              if (response.data.status === 'found') {
                // 跳转到上报加工状态页面，并传递订单数据
                wx.navigateTo({
                    url: '/pages/reportStatus/reportStatus',
                    success: (res) => {
                    res.eventChannel.emit('acceptData', {
                      ...response.data.data,
                      name: userName,
                      department: userDepartment
                    });
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
    
    // 扫描二维码（管理员）
    adminScanCode() {
      const { userRole, userDepartment } = this.data;
      wx.scanCode({
        success: (res) => {
          wx.request({
            url: 'https://www.yangyijin.asia/adminScan',
            // url: 'http://localhost:2910/adminScan',
            method: 'POST',
            data: { qrCodeData: res.result },
            success: (response) => {
              if (response.data.status === 'found') {
                // 管理员可以查看未完成状态的订单详情
                wx.navigateTo({
                  url: '/pages/orderList/orderList',
                  success: (res) => {
                    // 通过事件通道传递用户角色和部门信息以及订单ID
                    res.eventChannel.emit('acceptData', {
                      ...response.data.data,
                      role: userRole,
                      department: userDepartment,
                      singleOrderView: true // 标记为单个订单查看模式
                    });
                  }
                });
              } else if (response.data.status === 'completed') {
                wx.showToast({ title: '订单已完成', icon: 'none' });
              } else if (response.data.status === 'not_found') {
                wx.showToast({ title: '订单不存在', icon: 'none' });
              }
            },
            fail: (err) => {
              console.error('扫码查询失败', err);
              wx.showToast({ title: '网络请求失败', icon: 'none' });
            }
          });
        },
        fail: (err) => {
          console.log('扫码失败', err);
          if (err.errMsg !== 'scanCode:fail cancel') {
            wx.showToast({ title: '扫码失败', icon: 'none' });
          }
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