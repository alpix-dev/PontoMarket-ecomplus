const axios = require('axios')
const FormData = require('form-data')
const getAppData = require('./../../lib/store-api/get-app-data')

exports.post = ({ appSdk, admin}, req, res) => {  
  const { storeId, params } = req.body
  getAppData({ appSdk, storeId }).then(appData => {
    if (appData.instancia) {      
        admin.firestore().doc(`prizes/${storeId}_${params.customer._id}`).set({
          selected_prize_id : params.prize_id,
          doc_number: params.customer.doc_number
        })
        .then(function(){
          res.send({error:false})
        });
    }
  })
  .catch(err => {
    console.error(err)
    res.send(err.message)
  })
}
