// orderList.js
Page({
    data: {
      orders: [], // 订单列表数据
      page: 1, // 当前页码
      pageSize: 10, // 每页条数
      total: 0, // 总条数
      loading: false, // 是否正在加载
      hasMore: true, // 是否还有更多数据
      customerCode: '', // 客户编码筛选条件
      companyOrder: '', // 公司订单号筛选条件
      lineNumber: '', // 行号筛选条件
      drawingNumber: '', // 图号筛选条件
      name: '', // 名称筛选条件
      singleOrderView: false, // 是否为单个订单查看模式
      // 查看的单个订单信息
      purchaseOrder: '', // 订单单号
      serialNumber: '', // 序号
      singleCompanyOrder: '', // 单个订单的公司订单号
    },
  
    onLoad(options) {
      // 获取事件通道
      const eventChannel = this.getOpenerEventChannel();
      // 监听 acceptData 事件，获取用户角色和部门
      eventChannel.on('acceptData', (data) => {
        this.setData({
          role: data.role,
          department: data.department,
          singleOrderView: data.singleOrderView || false,
          purchaseOrder: data.订单单号,
          serialNumber: data.序号,
          singleCompanyOrder: data.公司订单号,
        });
        
        // 根据模式选择加载方式
        if (this.data.singleOrderView && this.data.purchaseOrder && this.data.serialNumber && this.data.singleCompanyOrder) {
          this.loadSingleOrder(); // 加载单个订单
          wx.setNavigationBarTitle({
            title: '订单详情'
          });
        } else {
          this.loadOrders(); // 加载订单列表
        }
      });
    },

    // 输入客户编码
    onCustomerCodeInput(e) {
      this.setData({ customerCode: e.detail.value });
    },

    // 输入公司订单号
    onCompanyOrderInput(e) {
      this.setData({ companyOrder: e.detail.value });
    },

    // 输入行号
    onLineNumberInput(e) {
      this.setData({ lineNumber: e.detail.value });
    },

    // 输入图号
    onDrawingNumberInput(e) {
      this.setData({ drawingNumber: e.detail.value });
    },

    // 输入名称
    onNameInput(e) {
      this.setData({ name: e.detail.value });
    },

    // 应用筛选条件
    applyFilter() {
      this.setData({
        orders: [], // 清空当前列表
        page: 1, // 重置页码
        hasMore: true // 重置是否有更多数据
      });
      this.loadOrders(); // 重新加载数据
    },
    
    // 加载单个订单数据
    loadSingleOrder() {
      if (this.data.loading) return;
      
      this.setData({ loading: true });
      
      const { role, department, purchaseOrder, serialNumber, singleCompanyOrder } = this.data;
      wx.request({
        url: 'https://gongxuchaxun.weimeigu.com.cn/viewOrder',
        // url: 'http://localhost:2910/viewOrder',
        method: 'POST',
        data: { role, department, purchaseOrder, serialNumber, companyOrder: singleCompanyOrder },
        success: (res) => {
          if (res.data.error) {
            wx.showToast({ title: res.data.error, icon: 'none' });
          } else if (res.data.success === false) {
            // 订单不存在
            wx.showToast({ title: '订单不存在', icon: 'none' });
            // 延迟返回上一页
            setTimeout(() => {
              wx.navigateBack({ delta: 1 });
            }, 1500);
          } else if (res.data.success === true && res.data.order) {
            // 订单存在，显示详情
            const order = res.data.order;
            // 处理照片路径
            const orderWithPhotos = {
              ...order,
              photoList: order['图片存储路径'] ? order['图片存储路径'].split('→').filter(path => path.split('号')[1]).map(item => ({
                date: item.split('号')[0],
                url: item.split('号')[1]
              })) : []
            };
            
            this.setData({
              orders: [orderWithPhotos], // 只设置这一个订单
              hasMore: false // 单个订单模式没有更多数据
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
  
    // 加载订单数据
    loadOrders() {
      if (this.data.loading || !this.data.hasMore) return;
  
      this.setData({ loading: true });
  
      const { role, department, page, pageSize, customerCode, companyOrder, lineNumber, drawingNumber, name } = this.data;
      wx.request({
        url: 'https://gongxuchaxun.weimeigu.com.cn/viewOrders',
        // url: 'http://localhost:2910/viewOrders',
        method: 'POST',
        data: { role, department, page, pageSize, customerCode, companyOrder, lineNumber, drawingNumber, name },
        success: (res) => {
          if (res.data.error) {
            wx.showToast({ title: res.data.error, icon: 'none' });
          } else {
            const { orders, total } = res.data;
            const newOrders = orders.map(item => ({
              ...item,
              photoList: item['图片存储路径'] ? item['图片存储路径'].split('→').filter(path => path.split('号')[1]).map(item2 => ({
                date: item2.split('号')[0],
                url: item2.split('号')[1]
              })) : []
            }));
            this.setData({
              orders: this.data.orders.concat(newOrders), // 追加新数据
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
      if (!this.data.singleOrderView) {
        this.loadOrders();
      }
    }
  });