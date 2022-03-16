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
  //console.log(JSON.stringify(trigger))
  // get app configured options
  console.log('Checkpoint 1.')
  getAppData({ appSdk, storeId })
    .then(appData => {
      if (
        Array.isArray(appData.ignore_triggers) &&
        appData.ignore_triggers.indexOf(trigger.resource) > -1
      ) {
        // ignore current trigger
        const err = new Error()
        err.name = SKIP_TRIGGER_NAME
        throw err
      }

      /* DO YOUR CUSTOM STUFF HERE */
      console.log(storeId)
      console.log('XXX')
      if (appData.instancia && trigger.resource === 'orders' && trigger.action === 'create') {
        appSdk.getAuth(storeId).then(authorization => {
          console.log('a')
          appSdk.apiRequest(storeId, `orders/${resourceId}.json`, 'GET', null, authorization).then(({ order }) => {
            const customerId = order.buyers && order.buyers[0] && order.buyers[0]._id
            if (!customerId) {
              return res.sendStatus(204)
            }
            admin.firestore().doc(`prizes/${storeId}_${customerId}`).get()
            .then(function(result){
              const reg = result.data()
              let prize_id = reg.selected_prize_id
              if (reg.selected_prize_id) {
                const docNumber = reg.doc_number
                const crmUrl = `${appData.instancia}/cgi-bin/webworks/bin/sharkview_api_v1?id=${appData.id}&token=${appData.token}&cmd=points_redemption&cpf=${docNumber}&order=${order}&id_prize=${prize_id}`
                axios.get(crmUrl)
                  .then(({ data }) => {
                    admin.firestore().doc(`prizes/${storeId}_${customerId}`).delete()
                    .then(function(){
                      res.status(200).send({
                        prize: customerId + ' - ' + prize_id,
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
          })
          .catch((err) => {
            res.status(500)
            const { message } = err
            res.send({
              error: ECHO_API_ERROR,
              message
            })
          }) 
        })
      }

      // all done
      res.send(ECHO_SUCCESS)
    })

    .catch(err => {
      console.log('Checkpoint 3.')
      console.log(err)
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
