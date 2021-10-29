const axios = require('axios')
const getAppData = require('./../../lib/store-api/get-app-data')

// getAppData({appSdk, storeId}).then(appData => {
// const { params, application } = req.body
//   const { storeId } = req
//   const response = {}
//   const appData = Object.assign({}, application.data, application.hidden_data)
//   if (appData.instancia) {
//     return axios.post(appData.instancia, {
//       id: appData.id,
//       token: appData.token,
//       cpf: req.body.cpf
//     })
//       .then(({ data }) => res.send(data))
//       .catch(console.error)
//   }
//   res.send({})
// })
exports.post = ({ appSdk }, req, res) => {  
  const { storeId } = req.body
  getAppData({appSdk, storeId})
  .then(appData => {
    //res.send(appData);
    console.log(appData)
    axios.post(appData.data.instancia + '/cgi-bin/webworks/bin/sharkview_api_v1', {
        id : appData.data.id,
        token : appData.data.token,
        cmd : "get_points",
        cpf : req.body.cpf
        // id_location: mail.replyTo
    }).then(pmarketResponse => {
      console.log(pmarketResponse)
      res.send(pmarketResponse)
    }).catch(err =>{
      console.log(err)
      res.send(err)  
    })

  })
  .catch(err => {
    res.send(err)
  })
}