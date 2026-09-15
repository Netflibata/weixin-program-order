const db = wx.cloud.database()
// 删掉错误的 const storage = wx.cloud.storage()
Page({
  data: {
    orderArr: [],
    dishList: []
  },
  onShow() {
    this.getAllOrder()
    this.getAllDish()
  },
  // 获取所有订单
  getAllOrder() {
    db.collection('orders').orderBy('timestamp', 'desc').get().then(res => {
      this.setData({ orderArr: res.data })
    })
  },
    // 分页获取全部菜品（突破20条限制）
  async getAllDish() {
    let allList = []
    let skipNum = 0
    const batch = 20
    while(true){
      const res = await db.collection("dishes")
        .orderBy("_id","desc")
        .skip(skipNum)
        .limit(batch)
        .get()
      if(res.data.length === 0) break
      allList = allList.concat(res.data)
      skipNum += batch
    }
    this.setData({ dishList: allList })
  },
  // 跳转上传菜品
  goUpload() {
    wx.navigateTo({
      url: "/pages/dishUpload/dishUpload"
    })
  },
  // 跳转编辑菜品
  goEditDish(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/dishEdit/dishEdit?id=${id}`
    })
  },
  // 删除菜品：删除云存储图片 + 数据库菜品
  delDish(e) {
    const dishId = e.currentTarget.dataset.id
    const fileID = e.currentTarget.dataset.img
    wx.showModal({
      title: "确认删除菜品",
      content: "删除后菜品及图片无法恢复，确定删除？",
      success: async res => {
        if (res.confirm) {
          wx.showLoading({ title: "删除中" })
          try {
            // 正确API：wx.cloud.deleteFile
            await wx.cloud.deleteFile({
              fileList: [fileID]
            })
            // 删除数据库菜品记录
            await db.collection("dishes").doc(dishId).remove()
            wx.hideLoading()
            wx.showToast({ title: "菜品删除成功" })
            this.getAllDish()
          } catch (err) {
            wx.hideLoading()
            wx.showToast({ title: "删除失败", icon: "error" })
            console.error("删菜品错误：", err)
          }
        }
      }
    })
  },
  // 删除订单（仅删除订单记录）
  deleteOrder(e) {
    const orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: "确认删除订单",
      content: "删除后订单记录无法恢复，是否确认？",
      success: async res => {
        if (res.confirm) {
          wx.showLoading({ title: "删除中" })
          try {
            await db.collection("orders").doc(orderId).remove()
            wx.hideLoading()
            wx.showToast({ title: "订单删除成功" })
            this.getAllOrder()
          } catch (err) {
            wx.hideLoading()
            wx.showToast({ title: "删除失败", icon: "error" })
            console.error("删订单错误：", err)
          }
        }
      }
    })
  }
})