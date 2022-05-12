// read configured E-Com Plus app data
const axios = require('axios')
const getAppData = require('../../lib/store-api/get-app-data')

const SKIP_TRIGGER_NAME = 'SkipTrigger'
const ECHO_SUCCESS = 'SUCCESS'
const ECHO_SKIP = 'SKIP'
const ECHO_API_ERROR = 'STORE_API_ERR'

exports.post = ({ appSdk, admin }, req, res) => {
  // receiving notification from Store API
  const { storeId } = req
  /**
   * Treat E-Com Plus trigger body here
   * Ref.: https://developers.e-com.plus/docs/api/#/store/triggers/
   */
  const trigger = req.body
  const resourceId = trigger.resource_id || trigger.inserted_id
  
  getAppData({ appSdk, storeId }).then(appData => {
      if (!appData.instancia || !appData.id || !appData.token || !appData.location_id || trigger.resource !== 'orders') {
        const err = new Error('Denied')
        err.name = SKIP_TRIGGER_NAME
        throw err
      }
      appSdk.getAuth(storeId).then((auth) => {
        appSdk.apiRequest(storeId, `/orders/${resourceId}.json`,'GET',null, auth).then(({response}) => {
          const order = response.data
          //console.log(order)
          const customerId = order.buyers && order.buyers[0] && order.buyers[0]._id
          if (!customerId) {
            return res.sendStatus(204)
          }
          if (trigger.resource === 'orders' && trigger.body.status === 'cancelled') {
            if(order.extra_discount){
              let joinDiscount = order.extra_discount.join()
              let regExp = /\[id_debit:(.*?)\]/;
              let match = regExp.exec(joinDiscount)
              let docNumber = order.buyers && order.buyers[0] && order.buyers[0].doc_number
              if(match[1]){
                const crmUrl = `${appData.instancia}/cgi-bin/webworks/bin/sharkview_api_v1?id=${appData.id}&token=${appData.token}&cmd=cancel_redemption&cpf=${docNumber}&id_debit=${match[1]}`
                axios.get(crmUrl).then(({ data }) => {
                  console.log({
                    customer : docNumber,
                    id_debit: match[1],
                    message: 'success'
                  })
                  res.status(200).send({
                    customer : docNumber,
                    id_debit: match[1],
                    message: 'success'
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
            }
          }else{
            admin.firestore().doc(`prizes/${storeId}_${customerId}`).get().then(function(result){
              const reg = result.data()
              let prize_id = reg.selected_prize_id
              if (reg.selected_prize_id && reg.selected_prize_id !== -1) {
                const docNumber = reg.doc_number              
                const crmUrl = `${appData.instancia}/cgi-bin/webworks/bin/sharkview_api_v1?id=${appData.id}&token=${appData.token}&cmd=points_redemption&cpf=${docNumber}&order=${order}&id_prize=${prize_id}`
                axios.get(crmUrl).then(({ data }) => {
                  console.log(data)
                  let id_debit = data.id_debit
                  order.extra_discount.flags.push('[id_debit:' + id_debit + ']')
                  const body = { extra_discount :  order.extra_discount}
                  console.log(body)
                  //atualiza pedido
                  appSdk.apiRequest(storeId, `/orders/${resourceId}.json`,'PATCH',body, auth)
                  .then(({ response }) => {
                    console.log('api-request')
                    admin.firestore().doc(`prizes/${storeId}_${customerId}`).delete().then(function(){
                      console.log('firestore remove')
                      res.status(200).send({
                        prize: customerId + ' - ' + prize_id,
                        message: 'success'
                      })
                    })
                    .catch(err => {
                      console.log(customerId + ' - ' + resourceId)
                      console.log(err)
                    })
                  }).catch(err => {
                    res.status(500)
                    const { message } = err
                    res.send({
                      error: ECHO_API_ERROR,
                      message
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
        .catch( err => {
          console.log(err)
        })     
      })
      .catch( err => {
        console.log(err)
      })    
    })
    .catch(err => {
      if (err.name === SKIP_TRIGGER_NAME) {
        // trigger ignored by app configuration
        res.send(ECHO_SKIP)
      } else if (err.appWithoutAuth === true) {
        const msg = `Webhook for ${storeId} unhandled with no authentication found`
        const error = new Error(msg)
        error.trigger = JSON.stringify(trigger)
        console.error(error)
        res.status(412).send(msg)
      } else {
        // console.error(err)
        // request to Store API with error response
        // return error status code
        res.status(500)
        const { message } = err
        res.send({
          error: ECHO_API_ERROR,
          message
        })
      }
    })
}
