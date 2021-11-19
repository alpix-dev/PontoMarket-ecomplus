const axios = require('axios')
const FormData = require('form-data')
const getAppData = require('./../../lib/store-api/get-app-data')

exports.post = ({ appSdk }, req, res) => {  
  const { storeId } = req.body
  getAppData({ appSdk, storeId }).then(appData => {
    if (appData.instancia) {
      const url = `${appData.instancia}/cgi-bin/webworks/bin/sharkview_api_v1?id=${appData.id}&token=${appData.token}&cmd=get_points&cpf=43335443608&id_location=${appData.location_id}`
      console.log(url)
      axios.get(url)
        .then(({ data }) => {
          admin.firestore().doc(`prizes/${storeId}_${params.customer._id}`).set({
            selected_prize_id : params.prize_id,
            doc_number: params.customer.doc_number
          }).then(function(result){
            res.send({pm: data, fb: result})
          })
          
        })
        .catch(err => {
          console.log(JSON.stringify({
            url,
            resStatus: err.response?.status,
            resData: err.response?.data
          }))
          res.send(err.message)
        })
    }
  })
  .catch(err => {
    console.error(err)
    res.send(err.message)
  })
}
