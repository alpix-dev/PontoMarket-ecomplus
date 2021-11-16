const axios = require('axios')
const FormData = require('form-data')
const getAppData = require('./../../lib/store-api/get-app-data')

exports.post = ({ appSdk }, req, res) => {  
  const { storeId } = req.body
  getAppData({ appSdk, storeId }).then(appData => {
    if (appData.instancia) {      
        return admin.firestore().doc(`prizes/${storeId}_${params.customer._id}`).set({
          selected_prize_id : params.prize_id,
          doc_number: params.customer.doc_number
        });
    }
  })
  .catch(err => {
    console.error(err)
    res.send(err.message)
  })
}
