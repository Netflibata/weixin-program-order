const app = getApp()
Page({
  data: {
    pwd: ""
  },
  inputPwd(e) {
    this.setData({ pwd: e.detail.value })
  },
  async login() {
    const input = this.data.pwd
    const real = app.globalData.adminPwd
    wx.showLoading({ title: '校验中' })
    try {
      const res = await wx.cloud.callFunction({
        name: "loginAdmin",
        data: { inputPwd: input, realPwd: real }
      })
      wx.hideLoading()
      if (res.result.success) {
        wx.navigateTo({ url: "/pages/orderList/orderList" })
      } else {
        wx.showToast({ title: '密码错误', icon: 'error' })
      }
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '校验失败，请检查云函数', icon: 'none' })
      console.log("云函数报错：", err)
    }
  }
})