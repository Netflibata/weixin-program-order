const db = wx.cloud.database()
Page({
  data: {
    dishId: "",
    oldImgFileID: "",
    previewImg: "",
    tempImgPath: "",
    dishName: "",
    // 新增分类字段
    category: "",
    dishPrice: "",
    uploading: false
  },
  onLoad(options) {
    const id = options.id
    this.setData({ dishId: id })
    // 查询菜品数据，回显分类
    db.collection("dishes").doc(id).get().then(res => {
      const info = res.data
      this.setData({
        oldImgFileID: info.img,
        previewImg: info.img,
        dishName: info.name,
        // 回显原有分类
        category: info.category,
        dishPrice: info.price
      })
    })
  },
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album"],
      success: res => {
        const temp = res.tempFiles[0].tempFilePath
        this.setData({
          tempImgPath: temp,
          previewImg: temp
        })
      }
    })
  },
  inputName(e) {
    this.setData({ dishName: e.detail.value })
  },
  // 监听分类修改
  inputCategory(e) {
    this.setData({ category: e.detail.value })
  },
  inputPrice(e) {
    this.setData({ dishPrice: e.detail.value })
  },
  async saveEdit() {
    const { dishName, category, dishPrice, tempImgPath, oldImgFileID, dishId, uploading } = this.data
    if (uploading) return wx.showToast({ title: "保存中，请勿重复点击", icon: "none" })
    if (!dishName.trim()) return wx.showToast({ title: "请填写菜品名称", icon: "none" })
    // 分类非空校验
    if (!category.trim()) return wx.showToast({ title: "请填写菜品分类", icon: "none" })
    if (dishPrice === "" || Number(dishPrice) < 0) return wx.showToast({ title: "价格不能为负数，可填0", icon: "none" })

    this.setData({ uploading: true })
    wx.showLoading({ title: "保存上传中" })
    let finalImgId = oldImgFileID
    try {
      if (tempImgPath) {
        const cloudPath = `dishImg/${Date.now()}.jpg`
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath,
          filePath: tempImgPath
        })
        finalImgId = uploadRes.fileID
      }
      // 更新数据库，同步新分类
      await db.collection("dishes").doc(dishId).update({
        data: {
          name: dishName.trim(),
          category: category.trim(),
          price: Number(dishPrice),
          img: finalImgId
        }
      })
      wx.hideLoading()
      wx.showToast({ title: "修改成功" })
      setTimeout(() => wx.navigateBack(), 1200)
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: "保存失败", icon: "error" })
      console.error(err)
    } finally {
      this.setData({ uploading: false })
    }
  }
})