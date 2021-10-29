const axios = require('axios')
const getAppData = require('./../../lib/store-api/get-app-data')

exports.post = ({ appSdk }, req, res) => {  
  const { storeId } = req.body
  getAppData({appSdk, storeId}).then(appData => {
    if(appData.instancia){
      return axios.post(appData.instancia + '/cgi-bin/webworks/bin/sharkview_api_v1', {
        // id : appData.id,
        // token : appData.token,
        // cmd : "get_points",
        // cpf : req.body.cpf
        id : "alpix",
        token : "t3st3Integracao",
        cmd : "get_points",
        cpf : "43335443608"
      })
      .then(({data}) => {res.send(data)})
      .catch(console.error)
    }
  })
  .catch(err => {
    res.send(err)
  })
}