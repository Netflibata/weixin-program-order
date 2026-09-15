// 引入云开发SDK
const cloud = require('wx-server-sdk')
// 使用当前环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口
exports.main = async (event, context) => {
  try {
    const { inputPwd, realPwd } = event
    // 密码比对
    const isOk = inputPwd === realPwd
    return {
      success: isOk
    }
  } catch (err) {
    return {
      success: false,
      msg: '云函数内部异常',
      error: err
    }
  }
}