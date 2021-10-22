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
exports.post = ({ appSdk, admin }, req, res) => {  
  const { storeId } = req
  getAppData({appSdk, storeId}).then(appData => {
    res.send(appData);

  })
}