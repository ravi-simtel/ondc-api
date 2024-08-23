import { bppSelect } from "../../../utils/bppApis/index.js";
import { protocolSelect } from "../../../utils/protocolApis/index.js";
import ContextFactory from "../../../factories/ContextFactory.js";

class BppSelectService {
  /**
   * bpp select order
   * @param {Object} context
   * @param {Object} order
   * @returns
   */
  async select(request) {
    try {
      const { context = {}, message = {} } = request || {};
      const { cart = {}, fulfillments = [] } = message.order || {};
      const provider = cart?.items?.[0]?.provider || {};
      console.log("provider", provider);

      const selectRequest = {
        context: context,
        message: {
          order: {
            items:
              cart.items.map((cartItem) => {
                return {
                  id: cartItem?.id?.toString(),
                  quantity: cartItem?.quantity,
                  location_id: provider.locations[-1],
                };
              }) || [],
            provider: provider,
            fulfillments:
              fulfillments && fulfillments.length ? [...fulfillments] : [],
          },
        },
      };

      console.log("Select Request: ", JSON.stringify(selectRequest, null, 4));

      let bpp_uri = Object.values(context.bpp_uri).join("");
      console.log("bpp uri", bpp_uri);

      // const response = await protocolSelect(selectRequest);
      const response = await bppSelect(bpp_uri, selectRequest);

      return { context: context, message: response.message };
    } catch (err) {
      throw err;
    }
  }
}

export default BppSelectService;
