const db = wx.cloud.database()
Page({
  data: {
    imgUrl: "",
    tempFilePath: "",
    name: "",
    price: "",
    uploading: false // 上传锁，防止重复点击
  },

  chooseImg() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: res => {
        const temp = res.tempFiles[0].tempFilePath
        this.setData({
          tempFilePath: temp,
          imgUrl: temp
        })
      }
    })
  },

  inputName(e) {
    this.setData({ name: e.detail.value })
  },
  inputPrice(e) {
    this.setData({ price: e.detail.value })
  },

  async uploadDish() {
    const { tempFilePath, name, price, uploading } = this.data
    // 上锁判断，正在上传直接拦截
    if (uploading) return wx.showToast({ title: "正在上传，请勿重复点击", icon: "none" })
    if (!tempFilePath) return wx.showToast({ title: "请选择图片", icon: "none" })
    if (!name.trim()) return wx.showToast({ title: "请填写菜品名", icon: "none" })
    if (!price || Number(price) < 0) return wx.showToast({ title: "价格输入错误", icon: "none" })

    this.setData({ uploading: true })
    wx.showLoading({ title: "上传中..." })
    try {
      // 兼容各种图片后缀，不用正则匹配
      const cloudPath = `dishImg/${Date.now()}.jpg`
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath
      })
      const fileID = uploadRes.fileID

      // 写入菜品数据库
      await db.collection("dishes").add({
        data: {
          name: name.trim(),
          price: Number(price),
          img: fileID
        }
      })

      wx.hideLoading()
      wx.showToast({ title: "菜品上传成功" })
      // 清空表单
      this.setData({
        imgUrl: "",
        tempFilePath: "",
        name: "",
        price: "",
        uploading: false
      })
    } catch (err) {
      wx.hideLoading()
      this.setData({ uploading: false })
      wx.showToast({ title: "上传失败", icon: "error" })
      console.error("上传错误详情：", err)
    }
  }
})