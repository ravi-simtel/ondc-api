import SelectOrderService from "./selectOrder.service.js";
import BadRequestParameterError from "../../../lib/errors/bad-request-parameter.error.js";

const selectOrderService = new SelectOrderService();

class SelectOrderController {
  /**
   * select order
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
  selectOrder(req, res, next) {
    const { body: request } = req;
    console.log("Request", request);
    selectOrderService
      .selectOrder(request)
      .then((response) => {
        res.json({ ...response });
      })
      .catch((err) => {
        next(err);
      });
  }

  /**
   * select multiple orders
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
  selectMultipleOrder(req, res, next) {
    console.log("Multiple Order Request: ", req.body);
    const { body: requests } = req;

    if (requests && requests.length) {
      selectOrderService
        .selectMultipleOrder(requests)
        .then((response) => {
          res.json(response);
        })
        .catch((err) => {
          next(err);
        });
    } else throw new BadRequestParameterError();
  }

  /**
   * on select order
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
  onSelectOrder(req, res, next) {
    console.log("On Select Req", JSON.stringify(req.body, null, 4));

    // TODO: Validation of data pending

    selectOrderService
      .onSelectOrder(req.body)
      .then((order) => {
        res.json(order);
      })
      .catch((err) => {
        next(err);
      });
  }

  /**
   * on select multiple order
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
  onSelectMultipleOrder(req, res, next) {
    const { query } = req;
    const { messageIds } = query;

    if (messageIds && messageIds.length && messageIds.trim().length) {
      const messageIdArray = messageIds.split(",");

      selectOrderService
        .onSelectMultipleOrder(messageIdArray)
        .then((orders) => {
          res.json(orders);
        })
        .catch((err) => {
          next(err);
        });
    } else throw new BadRequestParameterError();
  }
}

export default SelectOrderController;
