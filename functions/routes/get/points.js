const axios = require('axios')
const getAppData = require('./../../lib/store-api/get-app-data')


exports.post = ({ appSdk }, req, res) => {  
  const { storeId } = req.body
  getAppData({appSdk, storeId}).then(appData => {
    if (appData.instancia) {
      const params = {
        id : appData.id,
        token : appData.token,
        cmd : "get_points",
        cpf : "43335443608"
      }      
      return axios.post(appData.instancia + '/cgi-bin/webworks/bin/sharkview_api_v1', {
        params,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(({ data }) => res.send(data))
      .catch(console.error)
    }  
  })
  .catch(err => {
    console.log(err)
    res.send(err)
  })
}