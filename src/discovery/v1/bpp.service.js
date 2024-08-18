import { bppSearch } from "../../utils/bppApis/index.js";
import crypto from "crypto";

class BPPService {
  /**
   *
   * @param {Object} context
   * @param {Object} req
   * @returns
   */
  async search(context = {}, req = {}) {
    try {
      const { criteria = {}, payment = {} } = req || {};

      const searchRequest = {
        context: context,
        message: {
          intent: {
            ...(criteria?.search_string && {
              item: {
                descriptor: {
                  name: criteria.search_string,
                },
              },
            }),
            ...((criteria?.provider_id ||
              criteria?.category_id ||
              criteria?.provider_name) && {
              provider: {
                ...(criteria?.provider_id && {
                  id: criteria?.provider_id,
                }),
                ...(criteria?.category_id && {
                  category_id: criteria.category_id,
                }),
                ...(criteria?.provider_name && {
                  descriptor: {
                    name: criteria?.provider_name,
                  },
                }),
              },
            }),
            ...(criteria.delivery_location || criteria.area_code
              ? {
                  fulfillment: {
                    type: "Delivery",
                    ...(criteria.delivery_location && {
                      end: {
                        location: {
                          gps: criteria?.delivery_location,
                          ...(criteria.delivery_area_code && {
                            address: {
                              area_code: criteria?.delivery_area_code,
                            },
                          }),
                        },
                      },
                    }),
                  },
                }
              : {
                  fulfillment: {
                    type: "Delivery",
                  },
                }),
            ...((criteria?.category_id || criteria?.category_name) && {
              category: {
                ...(criteria?.category_id && {
                  id: criteria?.category_id,
                }),
                ...(criteria?.category_name && {
                  descriptor: {
                    name: criteria?.category_name,
                  },
                }),
              },
            }),
            payment: {
              "@ondc/org/buyer_app_finder_fee_type":
                payment?.buyer_app_finder_fee_type ||
                process.env.BAP_FINDER_FEE_TYPE,
              "@ondc/org/buyer_app_finder_fee_amount":
                payment?.buyer_app_finder_fee_amount ||
                process.env.BAP_FINDER_FEE_AMOUNT,
            },
            tags: [
              {
                ...(criteria?.catalog
                  ? {
                      code: "catalog_inc",
                      list: [
                        {
                          ...(criteria.inc_mode && {
                            code: "mode",
                            value: criteria.inc_mode,
                          }),
                        },
                        {
                          ...(criteria.start_time && {
                            code: "start",
                            value: criteria.start_time,
                          }),
                        },
                        {
                          ...(criteria.end_time && {
                            code: "end",
                            value: criteria.end_time,
                          }),
                        },
                        {
                          code: "payload_type",
                          value: criteria?.payload_type,
                        },
                      ],
                    }
                  : {
                      code: "catalog_full",
                      list: [
                        {
                          code: "payload_type",
                          value: criteria?.payload_type
                            ? criteria?.payload_type
                            : "inline",
                        },
                      ],
                    }),
              },
              {
                code: "bap_terms",
                list: [
                  {
                    code: "static_terms",
                    value:
                      "https://github.com/ONDC-Official/static-terms/SimtelAI/1.0/static_terms.pdf",
                  },
                  {
                    code: "static_terms_new",
                    value:
                      "https://github.com/ONDC-Official/NP-Static-Terms/buyerNP_BNP/1.0/tc.pdf",
                  },
                  {
                    code: "effective_date",
                    value: "2024-09-01T00:00:00.000Z",
                  },
                ],
              },
            ],
          },
        },
      };

      console.log("Search Query:", JSON.stringify(searchRequest, null, 4));
      const response = await bppSearch(process.env.BPP_URL, searchRequest);

      console.log("Search Response:", response);

      return {
        response,
      };
    } catch (err) {
      throw err;
    }
  }

  calculateHash = function (somestring) {
    return crypto.createHash("md5").update(somestring).digest("hex").toString();
  };

  /*
   * This function create the response object to send back to BPP
   * to ACK/NACK along with
   *  Provider ID
   *  Provider Link on our Webpage/Android/iOS app
   *
   *
   * */
  async onSearchResponse(req) {
    try {
      const { context = {}, message = {} } = req || {};
      const bpp_provider = message.catalog["bpp/providers"];
      console.log("bpp_provider:", JSON.stringify(bpp_provider, null, 4));
      let provider_link = [];
      bpp_provider.forEach((provider) => {
        let str = "";
        console.log("provider-id", provider.id);
        let id = provider.id;
        let items = provider.items;
        console.log("location-id", provider.locations);
        if (provider.id && provider.locations) {
          provider.locations.forEach((location) => {
            str = id + ":" + location;
            console.log("Str:", str);

            const provider = {
              provider_id: id,
              location_id: location,
              sku_count: items.length,
              deep_link_web: this.calculateHash(str),
              deep_link_android: this.calculateHash(str + ":android"),
              deep_link_ios: this.calculateHash(str + ":ios"),
            };
            provider_link.push(provider);
          });
        }
      });
      console.log(provider_link);
      const response = {
        context: context,
        message: {
          ack:
            provider_link.length > 0
              ? {
                  status: "ACK",
                  tags: provider_link.map(function (obj) {
                    return {
                      code: "bap_provider_link",
                      list: [
                        {
                          code: "provider_id",
                          value: obj?.provider_id ? obj.provider_id : null,
                        },
                        {
                          code: "location_id",
                          value: obj.location_id ? obj.location_id : null,
                        },
                        {
                          code: "sku_count",
                          value: obj.sku_count ? obj.sku_count : NULL,
                        },
                        {
                          code: "link1_type",
                          value: "web",
                        },
                        {
                          code: "link1_value",
                          value: obj.deep_link_web,
                        },
                        {
                          code: "link2_type",
                          value: "android",
                        },
                        {
                          code: "link2_value",
                          value: obj.deep_link_android,
                        },
                        {
                          code: "link3_type",
                          value: "ios",
                        },
                        {
                          code: "link3_value",
                          value: obj.deep_link_ios,
                        },
                      ],
                    };
                  }),
                }
              : {
                  status: "NACK",
                },
        },
      };
    } catch (err) {
      console.log("Error", err);
    }
  }

  async select(req) {
    const { context = {}, message = {} } = req;

    const message_id = context.message_id;

    const items = message.order.items;
    const fulfillments = message.order.fulfillments;
    const payment = message.order.payment;

    const selectRequest = {
      context: context,
      message: {
        order: {
          provider: {
            id: provider?.provider_id,
            locations: [
              {
                id: provider?.location_id,
              },
            ],
          },
          items: items.map((item) => {
            return {
              id: item.id,
              parent_item_id: item.parent_item_id,
              location_id: item.location_id,
              quantity: {
                count: item.quantity,
              },
              tags: item.tags,
            };
          }),
          fulfillments: fulfillments,
          payment: payment,
        },
      },
    };

    return selectRequest;
  }
}

export default BPPService;
