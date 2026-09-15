const db = wx.cloud.database()
Page({
  data: {
    imgUrl: "",
    tempFilePath: "",
    name: "",
    // 新增分类字段
    category: "",
    price: "",
    uploading: false
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
  // 新增：监听分类输入
  inputCategory(e) {
    this.setData({ category: e.detail.value })
  },
  inputPrice(e) {
    this.setData({ price: e.detail.value })
  },

  async uploadDish() {
    const { tempFilePath, name, category, price, uploading } = this.data
    // 防重复点击
    if (uploading) return wx.showToast({ title: "正在上传，请勿重复点击", icon: "none" })
    if (!tempFilePath) return wx.showToast({ title: "请选择图片", icon: "none" })
    if (!name.trim()) return wx.showToast({ title: "请填写菜品名", icon: "none" })
    // 新增：分类非空校验
    if (!category.trim()) return wx.showToast({ title: "请填写菜品分类", icon: "none" })
    if (price === "" || Number(price) < 0) return wx.showToast({ title: "价格不能为负数，可填0", icon: "none" })

    this.setData({ uploading: true })
    wx.showLoading({ title: "上传中..." })
    try {
      const cloudPath = `dishImg/${Date.now()}.jpg`
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath
      })
      const fileID = uploadRes.fileID

      // 新增 category 存入数据库
      await db.collection("dishes").add({
        data: {
          name: name.trim(),
          category: category.trim(),
          price: Number(price),
          img: fileID
        }
      })

      wx.hideLoading()
      wx.showToast({ title: "菜品上传成功" })
      // 清空表单，包含分类
      this.setData({
        imgUrl: "",
        tempFilePath: "",
        name: "",
        category: "",
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