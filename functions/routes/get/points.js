const axios = require('axios')
const FormData = require('form-data')
const getAppData = require('./../../lib/store-api/get-app-data')

exports.post = ({ appSdk }, req, res) => {  
  const { storeId } = req.body
  getAppData({ appSdk, storeId }).then(appData => {
    if (appData.instancia) {
      // const data = new FormData()
      // data.append('id', appData.id)
      // data.append('token', appData.token)
      // data.append('cmd', "get_points")
      // data.append('cpf', "43335443608")
      // data.append('id_location', "")
      // const url = `${appData.instancia}/cgi-bin/webworks/bin/sharkview_api_v1`
      // console.log(JSON.stringify({ storeId, url, data }))
      // axios.post(url, data, {
      //   headers: {
      //    'Content-Type': 'multipart/form-data'
      //   }
      // })
      const url = `${appData.instancia}/cgi-bin/webworks/bin/sharkview_api_v1?id=${appData.id}&token=${appData.token}&cmd=get_points&cpf=43335443608&id_location=`
      axios.get(url)
        .then(({ data }) => {
          res.send(data)
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
