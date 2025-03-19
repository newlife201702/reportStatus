// orderList.js
Page({
    data: {
      orders: [], // 订单列表数据
      page: 1, // 当前页码
      pageSize: 10, // 每页条数
      total: 0, // 总条数
      loading: false, // 是否正在加载
      hasMore: true // 是否还有更多数据
    },
  
    onLoad(options) {
      // 获取事件通道
      const eventChannel = this.getOpenerEventChannel();
      // 监听 acceptData 事件，获取用户角色和部门
      eventChannel.on('acceptData', (data) => {
        this.setData({
          role: data.role,
          department: data.department
        });
        this.loadOrders(); // 加载第一页数据
      });
    },
  
    // 加载订单数据
    loadOrders() {
      if (this.data.loading || !this.data.hasMore) return;
  
      this.setData({ loading: true });
  
      const { role, department, page, pageSize } = this.data;
      wx.request({
        url: 'https://gongxuchaxun.weimeigu.com.cn/viewOrders',
        // url: 'http://localhost:2910/viewOrders',
        method: 'POST',
        data: { role, department, page, pageSize },
        success: (res) => {
          if (res.data.error) {
            wx.showToast({ title: res.data.error, icon: 'none' });
          } else {
            const { orders, total } = res.data;
            this.setData({
              orders: this.data.orders.concat(orders), // 追加新数据
              total,
              page: this.data.page + 1, // 页码加 1
              hasMore: this.data.orders.length + orders.length < total // 是否还有更多数据
            });
          }
        },
        fail: (err) => {
          wx.showToast({ title: '网络请求失败', icon: 'none' });
        },
        complete: () => {
          this.setData({ loading: false });
        }
      });
    },
  
    // 上拉加载更多
    onReachBottom() {
      this.loadOrders();
    }
  });