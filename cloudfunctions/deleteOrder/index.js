const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
exports.main = async (event) => {
  try {
    await db.collection("orders").doc(event.orderId).remove()
    return { success: true }
  } catch (err) {
    return { success: false, msg: err.message }
  }
}