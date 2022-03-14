const axios = require('axios')
const getAppData = require('../../lib/store-api/get-app-data')

exports.post = ({ appSdk, admin }, req, res) => {  
  const { storeId } = req
  const { params } = req.body
  console.log(JSON.stringify(params))
  getAppData({ appSdk, storeId }).then(appData => {
    console.log(JSON.stringify(appData))
    if (appData.instancia) {      
      console.log(`prizes/${storeId}_${params.customer._id}`)
      admin.firestore().doc(`prizes/${storeId}_${params.customer._id}`).get()
      .then(function(result){
        console.log(JSON.stringify(result))
        const reg = result.data()
        let prize_id = reg.selected_prize_id
        if (reg.selected_prize_id) {
          console.log('reg.selected_prize_id')
          const docNumber = reg.doc_number
          const crmUrl = `${appData.instancia}/cgi-bin/webworks/bin/sharkview_api_v1?id=${appData.id}&token=${appData.token}&cmd=points_redemption&cpf=${docNumber}&order=${order}&id_prize=${prize_id}`
          console.log(crmUrl)
          axios.get(crmUrl)
            .then(({ data }) => {
              admin.firestore().doc(`prizes/${storeId}_${params.customer._id}`).delete()
              .then(function(){
                res.status(200).send({
                  prize: params.customer._id + ' - ' + prize_id,
                  message: 'success'
                })
              })
            })
            .catch(err => {
              console.log(JSON.stringify({
                crmUrl,
                resStatus: err.response?.status,
                resData: err.response?.data
              }))
              res.status(409).send({
                error: '1',
                message: err.message
              })
            })
        }      
      })
    }
  })
  .catch(err => {
    console.error(err)
    res.send(err.message)
  })
}

