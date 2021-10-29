exports.post = ({ appSdk, admin }, req, res) => {
  /**
   * Requests coming from Modules API have two object properties on body: `params` and `application`.
   * `application` is a copy of your app installed by the merchant,
   * including the properties `data` and `hidden_data` with admin settings configured values.
   * JSON Schema reference for the Create Transaction module objects:
   * `params`: https://apx-mods.e-com.plus/api/v1/create_transaction/schema.json?store_id=100
   * `response`: https://apx-mods.e-com.plus/api/v1/create_transaction/response_schema.json?store_id=100
   *
   * Examples in published apps:
   * https://github.com/ecomplus/app-pagarme/blob/master/functions/routes/ecom/modules/create-transaction.js
   * https://github.com/ecomplus/app-custom-payment/blob/master/functions/routes/ecom/modules/create-transaction.js
   */

  const { params, application } = req.body
  const { storeId } = req
  const appData = Object.assign({}, application.data, application.hidden_data)
  const transaction = {}

  const orderId = params.order_id
  const { amount, buyer, payer, to, items } = params

  if(clubeshowStorefrontOfferId){
    //getAppData({appSdk, storeId}).then(appData => {
    if(appData.instancia){
      axios.post(appData.instancia + '/cgi-bin/webworks/bin/sharkview_api_v1', {
        // id : appData.id,
        // token : appData.token,
        // cmd : "get_points",
        // cpf : req.body.cpf
        id : "alpix",
        token : "t3st3Integracao",
        cmd : "points_redemption",
        cpf : buyer.doc_number,
        order: orderId,
        id_prize: clubeshowStorefrontOfferId
      })      
    }    
  }

  res.send({
    redirect_to_payment: redirectToPayment,
    transaction
  })
}
