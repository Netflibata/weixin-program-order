const db = wx.cloud.database()
Page({
  data: {
    cart: [],
    total: 0
  },
  onShow() {
    this.calcCart()
  },
  calcCart() {
    const cart = wx.getStorageSync('cart') || []
    let total = 0
    cart.forEach(item => total += item.price * item.num)
    this.setData({ cart, total })
  },
  cutNum(e) {
    const id = e.currentTarget.dataset.id
    let cart = this.data.cart
    const idx = cart.findIndex(v => v._id === id)
    if (cart[idx].num > 1) {
      cart[idx].num -= 1
    } else {
      cart.splice(idx, 1)
    }
    wx.setStorageSync('cart', cart)
    this.calcCart()
  },
  addNum(e) {
    const id = e.currentTarget.dataset.id
    let cart = this.data.cart
    const idx = cart.findIndex(v => v._id === id)
    cart[idx].num += 1
    wx.setStorageSync('cart', cart)
    this.calcCart()
  },
  // 提交订单存入云数据库
  async submitOrder() {
  let cart = wx.getStorageSync('cart') || []
  if (cart.length === 0) {
    wx.showToast({ title: "购物车为空", icon: "none" })
    return
  }
  let totalPrice = 0
  cart.forEach(item => {
    totalPrice += item.price * item.num
  })
  wx.showLoading({ title: "提交订单中" })
  try {
    const openid = wx.cloud.getCloudEnv().OPENID
    await db.collection("orders").add({
      data: {
        dishList: cart,
        totalPrice: totalPrice,
        timestamp: Date.now(),
        createTime: new Date().toLocaleString(),
        openid: openid // 关键：绑定下单人
      }
    })
    wx.hideLoading()
    wx.showToast({ title: "下单成功" })
    wx.setStorageSync("cart", [])
  } catch (err) {
    wx.hideLoading()
    wx.showToast({ title: "下单失败", icon: "error" })
    console.error(err)
  }
}
})