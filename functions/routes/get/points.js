const axios = require('axios')
const FormData = require('form-data');
const getAppData = require('./../../lib/store-api/get-app-data')


exports.post = ({ appSdk }, req, res) => {  
  const { storeId } = req.body
  getAppData({appSdk, storeId}).then(appData => {
    if(appData.instancia){
      // let data = {
      //   id : appData.id,
      //   token : appData.token,
      //   cmd : "get_points",
      //   // cpf : req.body.cpf
      //   // id : id,
      //   // token : token,
      //   // cmd : cmd,
      //   cpf : "43335443608"
      // }
      let formData = new FormData();
      formData.append('id', appData.id)
      formData.append('token', appData.token)
      formData.append('cmd', "get_points")
      formData.append('cpf', "43335443608")
      
      // return axios({
      //   method:"post",
      //   url: appData.instancia + '/cgi-bin/webworks/bin/sharkview_api_v1',
      //   data: formData,
      //   headers: {'Content-Type': 'multipart/form-data'}
      // }).then((response) => {
      //   console.log(response)
      //   res.send(response)
      // })
      // .catch((err) => {
      //   console.log(err)
      //   res.send(err)        
      // })
      try {
        let clubeShow = axios.post(appData.instancia + '/cgi-bin/webworks/bin/sharkview_api_v1', formData , {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        res.send(clubeShow)
      }catch(e){
        console.log(e)
        res.send(e)
      }     
    }
  })
  .catch(err => {
    console.log(err)
    res.send(err)
  })
}