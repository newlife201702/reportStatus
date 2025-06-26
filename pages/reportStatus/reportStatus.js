// reportStatus.js
Page({
    data: {
      purchaseOrder: '', // 订单单号
      serialNumber: '', // 序号
      companyOrder: '', // 公司订单号
      lineNumber: '', // 行号
      drawingNumber: '', // 图号
      orderName: '', // 名称
      processOptions: [], // 工序名称下拉框选项
      normalProcessOptions: [], // 正常工序名称下拉框选项
      restartProcessOptions: [], // 重新开始工序名称下拉框选项
      alreadyProcessOptions: [], // 已加工工序名称下拉框选项
      selectedProcess: '', // 选择的工序名称
      customProcess: '', // 自定义工序名称
      photoUrl: '', // 上传的照片 URL
      showPicker: false, // 是否显示下拉框
      showInput: false, // 是否显示输入框
      name: null, // 用户名称
      department: null, // 用户部门
      orderDepartment: null, // 订单部门
      isRestart: false, // 重新开始标志
    },
  
    onLoad(options) {
      // 获取事件通道
      const eventChannel = this.getOpenerEventChannel();
      // 监听 acceptData 事件，获取订单数据
      eventChannel.on('acceptData', (data) => {
        this.setData({
          purchaseOrder: data.订单单号,
          serialNumber: data.序号,
          companyOrder: data.公司订单号,
          lineNumber: data.行号,
          drawingNumber: data.图号,
          orderName: data.名称,
          name: data.name,
          department: data.department,
          orderDepartment: data.加工部门
        });
        // 加载工序名称下拉框选项
        this.loadProcessOptions(data.图号, data.物料编码, data.图纸版本号, data.订单单号, data.序号, data.公司订单号);
      });
    },
    
    // 重新开始复选框点击处理
    onRestartChange() {
      // 由于使用bindtap，需要手动切换状态
      const newIsRestart = !this.data.isRestart;
      
      this.setData({
        isRestart: newIsRestart,
        processOptions: newIsRestart ? this.data.restartProcessOptions : this.data.normalProcessOptions,
        selectedProcess: '' // 清空已选工序
      });
      
      // 如果开启了重新开始并且有显示选择器
      if (newIsRestart && this.data.showPicker) {
        // 计算已经报废的次数：统计alreadyProcessOptions中包含restartProcessOptions第一项的个数
        let scrapCount = 0;
        const firstRestartOption = this.data.restartProcessOptions[0];
        
        if (firstRestartOption) {
          // 遍历已加工工序，计算报废次数
          this.data.alreadyProcessOptions.forEach(process => {
            if (process === firstRestartOption) {
              scrapCount++;
            }
          });
          
          // 显示报废次数提示
          wx.showToast({
            title: `第${scrapCount}次报废`,
            icon: 'none',
            duration: 2000
          });
        }
      }
    },
  
    // 加载工序名称下拉框选项
    loadProcessOptions(drawingNumber, materialNumber, drawingVersion, purchaseOrder, serialNumber, companyOrder) {
      wx.request({
        url: 'https://gongxuchaxun2.weimeigu.com.cn/getProcessOptions',
        // url: 'http://localhost:2910/getProcessOptions',
        method: 'POST',
        data: { drawingNumber, materialNumber, drawingVersion, purchaseOrder, serialNumber, companyOrder },
        success: (res) => {
          if (res.data.error) {
            wx.showToast({ title: res.data.error, icon: 'none' });
          } else {
            const processOptions = res.data.processOptions;
            const restartProcessOptions = res.data.restartProcessOptions;
            const alreadyProcessOptions = res.data.alreadyProcessOptions;
            console.log('processOptions', processOptions);
            console.log('restartProcessOptions', restartProcessOptions);
            console.log('alreadyProcessOptions', alreadyProcessOptions);
            this.setData({
              processOptions,
              normalProcessOptions: processOptions,
              restartProcessOptions,
              alreadyProcessOptions,
              showPicker: processOptions.length > 0, // 如果有下拉选项，显示下拉框
              showInput: processOptions.length === 0 // 如果没有下拉选项，显示输入框
            });
          }
        }
      });
    },
  
    // 选择工序名称
    onProcessChange(e) {
      this.setData({ selectedProcess: this.data.processOptions[e.detail.value] });
    },
  
    // 输入自定义工序名称
    onCustomProcessInput(e) {
      this.setData({ customProcess: e.detail.value });
    },
  
    // 上传照片
    uploadPhoto() {
      wx.chooseImage({
        count: 1,
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          wx.uploadFile({
            url: 'https://gongxuchaxun.weimeigu.com.cn/uploadPhoto',
            // url: 'http://localhost:2910/uploadPhoto',
            filePath: tempFilePath,
            name: 'photo',
            success: (uploadRes) => {
              const photoUrl = JSON.parse(uploadRes.data).url;
              this.setData({ photoUrl });
            }
          });
        }
      });
    },
  
    // 提交加工状态
    submitProcess() {
      const { purchaseOrder, serialNumber, companyOrder, lineNumber, drawingNumber, orderName, selectedProcess, customProcess, photoUrl, showPicker, name, orderDepartment, isRestart } = this.data;
      const process = showPicker ? selectedProcess : customProcess;
  
      if (!process) {
        wx.showToast({ title: showPicker ? '请选择工序名称' : '请输入工序名称', icon: 'none' });
        return;
      }
  
      wx.request({
        url: 'https://gongxuchaxun2.weimeigu.com.cn/reportStatus',
        // url: 'http://localhost:2910/reportStatus',
        method: 'POST',
        data: { purchaseOrder, serialNumber, companyOrder, lineNumber, drawingNumber, orderName, process: isRestart ? process + '(零件报废)' : process, photoUrl, name, department: orderDepartment },
        success: (res) => {
          if (res.data.success) {
            wx.showToast({ title: '上报成功' });
            wx.navigateBack();
          } else {
            wx.showToast({ title: '上报失败', icon: 'none' });
          }
        }
      });
    }
  });