App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      wx.showToast({ title: '请使用2.16.0以上基础库', icon: 'none' })
    } else {
      wx.cloud.init({
        env: "cloud1-d8gpa7gwk8c800b39", // 替换成你的云开发环境ID
        traceUser: true
      })
    }
  },
  globalData: {
    adminPwd: "2026" // 管理员密码，可修改
  }
})