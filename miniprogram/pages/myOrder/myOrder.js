const db = wx.cloud.database()
Page({
  data: {
    orderArr: [],
    currentOpenid: ""
  },
  onShow() {
    this.loadAllOrder()
  },
  async loadAllOrder() {
    // 和下单代码统一，调用login云函数获取openid
    const loginRes = await wx.cloud.callFunction({ name: "login" })
    const openid = loginRes.result.openid
    this.setData({ currentOpenid: openid })

    // 查询全部订单，按最新排序
    const res = await db.collection("orders")
      .orderBy("timestamp", "desc")
      .get()
    console.log("拉取到的所有订单：", res.data)
    console.log("当前用户openid：", openid)
    this.setData({ orderArr: res.data })
  },
  deleteMyOrder(e) {
    const orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: "确认删除",
      content: "删除后订单记录无法恢复",
      success: async res => {
        if (!res.confirm) return
        wx.showLoading({ title: "删除中" })
        try {
          await db.collection("orders").doc(orderId).remove()
          wx.hideLoading()
          wx.showToast({ title: "删除成功" })
          this.loadAllOrder()
        } catch (err) {
          wx.hideLoading()
          wx.showToast({ title: "仅可删除自己创建的订单", icon: "error" })
          console.error(err)
        }
      }
    })
  }
})