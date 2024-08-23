import { onOrderSelect } from "../../../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../../../utils/constants.js";
import { RetailsErrorCode } from "../../../utils/retailsErrorCode.js";

import ContextFactory from "../../../factories/ContextFactory.js";
import BppSelectService from "./bppSelect.service.js";

const bppSelectService = new BppSelectService();

class SelectOrderService {
  /**
   *
   * @param {Array} items
   * @returns Boolean
   */
  areMultipleBppItemsSelected(items) {
    return items
      ? [...new Set(items.map((item) => item.bpp_id))].length > 1
      : false;
  }

  /**
   *
   * @param {Array} items
   * @returns Boolean
   */
  areMultipleProviderItemsSelected(items) {
    console.log("items:", items);
    return items
      ? [...new Set(items.map((item) => item.provider.id))].length > 1
      : false;
  }

  /**
   * select order
   * @param {Object} orderRequest
   */
  async selectOrder(orderRequest) {
    try {
      const { context: requestContext, order = {} } = orderRequest || {};

      console.log("Context:", requestContext);
      const { cart = {}, fulfillments = [] } = order;

      console.log("cart: ", cart);
      console.log("fulfillment: ", fulfillments);

      const contextFactory = new ContextFactory();
      const context = contextFactory.create({
        action: PROTOCOL_CONTEXT.SELECT,
        transactionId: requestContext?.transaction_id,
        bppId: requestContext?.bpp_id,
        bppUrl: requestContext?.bpp_url,
        city: requestContext?.city,
        state: requestContext?.state,
      });

      if (!(cart?.items || cart?.items?.length)) {
        return {
          context,
          error: { message: "Empty order received" },
        };
      } else if (this.areMultipleBppItemsSelected(cart?.items)) {
        return {
          context,
          error: {
            message: "More than one BPP's item(s) selected/initialized",
          },
        };
      } else if (this.areMultipleProviderItemsSelected(cart?.items)) {
        return {
          context,
          error: {
            message: "More than one Provider's item(s) selected/initialized",
          },
        };
      }

      const request = {
        context: context,
        message: {
          order: {
            cart: cart,
            fulfillments: fulfillments,
          },
        },
      };
      console.log("Final Request", JSON.stringify(request, null, 4));
      return await bppSelectService.select(request);
    } catch (err) {
      throw err;
    }
  }

  /**
   * select multiple orders
   * @param {Array} requests
   */
  async selectMultipleOrder(requests) {
    const selectOrderResponse = await Promise.all(
      requests.map(async (request) => {
        try {
          const response = await this.selectOrder(request);
          return response;
        } catch (err) {
          return err.response.data;
        }
      })
    );

    return selectOrderResponse;
  }

  /**
   * on select order
   * @param {Object} messageId
   */
  async onSelectOrder(request) {
    console.log("queryParams", JSON.stringify(request, null, 4));
    try {
      const contextFactory = new ContextFactory();
      const context = contextFactory.create({
        message_id: request.context.message_id,
      });

      return {
        context,
        message: {
          status: "ACK",
        },
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * on select multiple order
   * @param {Object} messageId
   */
  async onSelectMultipleOrder(messageIds) {
    try {
      const onSelectOrderResponse = await Promise.all(
        messageIds.map(async (messageId) => {
          try {
            const onSelectResponse = await this.onSelectOrder(messageId);
            return { ...onSelectResponse };
          } catch (err) {
            throw err;
          }
        })
      );

      return onSelectOrderResponse;
    } catch (err) {
      throw err;
    }
  }
}

export default SelectOrderService;
