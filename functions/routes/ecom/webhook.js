// read configured E-Com Plus app data
const getAppData = require('./../../lib/store-api/get-app-data')

const SKIP_TRIGGER_NAME = 'SkipTrigger'
const ECHO_SUCCESS = 'SUCCESS'
const ECHO_SKIP = 'SKIP'
const ECHO_API_ERROR = 'STORE_API_ERR'

exports.post = ({ appSdk }, req, res) => {
  // receiving notification from Store API
  const { storeId } = req

  /**
   * Treat E-Com Plus trigger body here
   * Ref.: https://developers.e-com.plus/docs/api/#/store/triggers/
   */
  const trigger = req.body
console.log(JSON.stringify(trigger))
  // get app configured options
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

      if (appData.instancia) {      
        admin.firestore().doc(`prizes/${storeId}_${params.customer._id}`).get()
        .then(function(result){
          const reg = result.data()
          let prize_id = reg.selected_prize_id
          if (reg.selected_prize_id) {
            const docNumber = reg.doc_number
            const crmUrl = `${appData.instancia}/cgi-bin/webworks/bin/sharkview_api_v1?id=${appData.id}&token=${appData.token}&cmd=points_redemption&cpf=${docNumber}&order=${order}&id_prize=${prize_id}`
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

      // all done
      res.send(ECHO_SUCCESS)
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
