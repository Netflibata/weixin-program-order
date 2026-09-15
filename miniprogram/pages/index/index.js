const db = wx.cloud.database()
Page({
  data:{
    allDish:[],
    filterDish:[],
    cateArr:[],
    activeCate:"全部"
  },
  onShow(){
    this.getAllDishData()
  },
  // 循环分页拉取所有菜品，突破20条限制
  async getAllDishData(){
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
    // 统一清洗分类，兼容所有菜品
    allList = allList.map(item=>{
      if(!item.category) item.category = "未分类"
      item.category = item.category.trim()
      return item
    })
    // 分类去重
    let cates = []
    allList.forEach(item=>{
      if(!cates.includes(item.category)) cates.push(item.category)
    })
    this.setData({
      allDish:allList,
      filterDish:allList,
      cateArr:cates
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