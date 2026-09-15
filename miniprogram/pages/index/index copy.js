const db = wx.cloud.database()
Page({
  data:{
    allDish:[],     // 全部菜品
    filterDish:[],  // 当前筛选菜品
    cateArr:[],     // 所有分类（去重）
    activeCate:"全部"
  },
  onShow(){
    this.getDishList()
  },
  // 获取云端所有菜品
  getDishList(){
    db.collection("dishes").get().then(res=>{
      const list = res.data
      // 提取所有分类并去重
      let cates = []
      list.forEach(item=>{
        if(!cates.includes(item.category)){
          cates.push(item.category)
        }
      })
      this.setData({
        allDish:list,
        filterDish:list,
        cateArr:cates
      })
    })
  },
  // 切换分类筛选
  changeCate(e){
    const targetCate = e.currentTarget.dataset.cate
    let resList = []
    if(targetCate === "全部"){
      resList = this.data.allDish
    }else{
      resList = this.data.allDish.filter(item=>item.category === targetCate)
    }
    this.setData({
      activeCate:targetCate,
      filterDish:resList
    })
  },
  // 加入购物车
  addCart(e){
    const id = e.currentTarget.dataset.id
    const target = this.data.allDish.find(v=>v._id === id)
    let cart = wx.getStorageSync("cart") || []
    const index = cart.findIndex(v=>v._id === id)
    if(index === -1){
      cart.push({...target,num:1})
    }else{
      cart[index].num += 1
    }
    wx.setStorageSync("cart",cart)
    wx.showToast({title:"加入购物车成功"})
  }
})