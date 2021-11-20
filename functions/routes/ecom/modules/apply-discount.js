const axios = require('axios')
exports.post = ({ appSdk, admin }, req, res) => {
  /**
   * Requests coming from Modules API have two object properties on body: `params` and `application`.
   * `application` is a copy of your app installed by the merchant,
   * including the properties `data` and `hidden_data` with admin settings configured values.
   * JSON Schema reference for the Apply Discount module objects:
   * `params`: https://apx-mods.e-com.plus/api/v1/apply_discount/schema.json?store_id=100
   * `response`: https://apx-mods.e-com.plus/api/v1/apply_discount/response_schema.json?store_id=100
   *
   * Complete (advanced) example in our default discouts app:
   * https://github.com/ecomplus/discounts/blob/master/routes/ecom/modules/apply-discount.js
   */
  const { storeId } = req
  const { params, application } = req.body
  const response = {}
  // merge all app options configured by merchant
  const appData = Object.assign({}, application.data, application.hidden_data)

  if (appData.available_extra_discount) {
    response.available_extra_discount = appData.available_extra_discount
  }
 
  if (params.customer?._id) {
      console.log(`--- checkpoint prizes/${storeId}_${params.customer._id}`)
    admin.firestore().doc(`prizes/${storeId}_${params.customer._id}`).get()
    .then(function(result){
      const reg = result.data()
      console.log(reg)
      if (reg.selected_prize_id) {
        // Double check discount available on CRM
        const docNumber = reg.doc_number
        const crmUrl = `${appData.instancia}/cgi-bin/webworks/bin/sharkview_api_v1?id=${appData.id}&token=${appData.token}&cmd=get_points&cpf=${docNumber}&id_location=`
        //const crmUrl = `${appData.instancia}/cgi-bin/webworks/bin/sharkview_api_v1?id=${appData.id}&token=${appData.token}&cmd=get_points&cpf=43335443608&id_location=`
        axios.get(crmUrl)
          .then(({ data }) => {
            console.log('--- checkpoint c')
            console.log(data)
            const prize = data.prize_list?.find(prize => (prize.id_prize == prizeId))
            console.log('----checkpont======')
            console.log(prize)
            if (prize && prize.prize_value > 0) {
              console.log('--- checkpoint d')
              response.discount_rule = {
                label: prize.name,
                description: `Resgate de pontos ID ${prize.id_prize}`,
                extra_discount: {
                  value: prize.prize_value,
                  flags: ['clube-show', `${String(prize.id_prize).slice(0, 20)}`]
                }
              }
            }
            //res.send(response)
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
    // admin.firestore().doc(`prizes/${storefrontId}_${params.customer._id}`).get(documentSnapshot => {
    //   console.log('--- checkpoint b')
    //   if (documentSnapshot.exist) {
    //     console.log('--- checkpoint b 1')
    //     const prizeId = documentSnapshot.get('selected_prize_id')
    //     if (prizeId) {
    //       console.log('--- checkpoint b 2')
    //       // Double check discount available on CRM
    //       const docNumber = documentSnapshot.get('doc_number')
    //       //const crmUrl = `${appData.instancia}/cgi-bin/webworks/bin/sharkview_api_v1?id=${appData.id}&token=${appData.token}&cmd=get_points&cpf=${docNumber}&id_location=`
    //       const crmUrl = `${appData.instancia}/cgi-bin/webworks/bin/sharkview_api_v1?id=${appData.id}&token=${appData.token}&cmd=get_points&cpf=43335443608&id_location=`
    //       axios.get(crmUrl)
    //         .then(({ data }) => {
    //           console.log('--- checkpoint c')
    //           const prize = data.prize_list?.find(prize => (prize.id_prize == prizeId))
    //           if (prize && prize.prize_value > 0) {
    //             console.log('--- checkpoint d')
    //             response.discount_rule = {
    //               label: prize.name,
    //               description: `Resgate de pontos ID ${prize.id_prize}`,
    //               extra_discount: {
    //                 value: prize.prize_value,
    //                 flags: ['clube-show', `${String(prize.id_prize).slice(0, 20)}`]
    //               }
    //             }
    //           }
    //           res.send(response)
    //         })
    //         .catch(err => {
    //           console.log(JSON.stringify({
    //             url,
    //             resStatus: err.response?.status,
    //             resData: err.response?.data
    //           }))
    //           res.status(409).send({
    //             error: '1',
    //             message: err.message
    //           })
    //         })
    //     }
    //   }
    //   res.send(response)
    // })
  }

  /* DO THE STUFF HERE TO FILL RESPONSE OBJECT WITH DISCOUNT OPTIONS */

  /**
   * Sample snippets:
  // set discount value
  response.discount_rule = {
    label: 'X Campaign',
    extra_discount: {
      value: 20.5,
      flags: ['x-coupon']
    }
  }
  */

  res.send(response)
}