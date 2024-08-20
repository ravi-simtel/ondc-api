import { bppSearch } from "../../utils/bppApis/index.js";
import crypto from "crypto";
import NoRecordFoundError from "../../lib/errors/no-record-found.error.js";

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
            ...((criteria?.provider_id || criteria?.provider_category_id) && {
              provider: {
                ...(criteria?.provider_id && {
                  id: criteria?.provider_id,
                }),
                ...(criteria?.category_id && {
                  category_id: criteria.provider_category_id,
                }),
                ...(criteria?.provider_name && {
                  descriptor: {
                    name: criteria?.provider_name,
                  },
                }),
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
          },
        },
      };

      const fulfillment = this.prepareFulFillment(criteria);
      if (fulfillment) {
        searchRequest.message.intent["fulfillment"] = fulfillment;
      }

      const tags = this.prepareTags(criteria);
      if (tags && tags.length > 0) {
        console.log(tags);
        searchRequest.message.intent["tags"] = tags;
      }

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

  // Prepare a JSONOBject
  prepareFulFillment(criteria) {
    let fulfillment = criteria.fulfillment
      ? Object.values(criteria.fulfillment).join("")
      : "";

    if (fulfillment.localeCompare("Delivery") === 0)
      return {
        type: criteria?.fulfillment,
        end: {
          location: {
            gps: criteria?.gps,
            address: {
              area_code: criteria?.delivery_area_code,
            },
          },
        },
      };
    // TODO: Pickup pending
    // TODO: Delivery and Pickup pending
    else return undefined;
  }

  prepareTags(criteria) {
    console.log("criteria", criteria);
    let tags = [];
    let bap_terms = criteria.bap_terms
      ? Object.values(criteria.bap_terms).join("")
      : "";
    let catalog = criteria.catalog
      ? Object.values(criteria.catalog).join("")
      : "";
    let inc_mode = criteria.inc_mode
      ? Object.values(criteria.inc_mode).join("")
      : null;
    let start_time = criteria.start_time
      ? Object.values(criteria.start_time).join("")
      : null;
    let end_time = criteria.end_time
      ? Object.values(criteria.end_time).join("")
      : null;
    let payload_type = criteria.payload_type
      ? Object.values(criteria.payload_type).join("")
      : null;
    if (catalog.localeCompare("catalog_inc") === 0) {
      let tag_list = [];
      if (inc_mode) {
        tag_list.push({
          code: "mode",
          value: inc_mode,
        });
      }
      if (start_time) {
        tag_list.push({
          code: "start",
          value: start_time,
        });
      }
      if (end_time) {
        tag_list.push({
          code: "end",
          value: end_time,
        });
      }
      if (payload_type) {
        tag_list.push({
          code: "payload_type",
          value: payload_type,
        });
      }
      console.log("Tags", tag_list);
      if (tag_list && tag_list.length > 0) {
        tags.push({
          code: "catalog_inc",
          list: tag_list,
        });
      }
    }
    if (catalog.localeCompare("catalog_full") === 0) {
      tags.push({
        code: "catalog_full",
        list: [
          {
            code: "payload_type",
            value: criteria.payload_type ? criteria.payload_type : "inline",
          },
        ],
      });
    }
    if (bap_terms.localeCompare("true") === 0) {
      tags.push({
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
      });
    }
    console.log("tags:", tags);
    return tags;
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
    let response = {};
    let error_code = {};
    try {
      const { context = {}, message = {} } = req || {};
      const bpp_provider = message.catalog["bpp/providers"];
      if (!bpp_provider) {
        error_code = {
          type: "DOMAIN-ERROR",
          code: "20003",
          message: "Provider ID not found",
        };
        throw new NoRecordFoundError("Provider Id not found");
      }
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
              ...(items?.length && { sku_count: items?.length }),
              deep_link_web: this.calculateHash(str),
              deep_link_android: this.calculateHash(str + ":android"),
              deep_link_ios: this.calculateHash(str + ":ios"),
            };
            provider_link.push(provider);
          });
        }
      });
      console.log(provider_link);
      response = {
        context: context,
        message: {
          ack:
            provider_link.length > 0
              ? {
                  status: "ACK",
                  tags: provider_link.map(function (obj) {
                    if (!obj.provider_id) {
                      error_code = {
                        type: "DOMAIN-ERROR",
                        code: "20003",
                        message: "Provider ID not found",
                      };
                      throw new NoRecordFoundError("Provider Id not found");
                    }
                    if (!obj.location_id) {
                      error_code = {
                        type: "DOMAIN-ERROR",
                        code: "20004",
                        message: "Location ID not found",
                      };
                      throw new NoRecordFoundError("Location Id not found");
                    }

                    if (!obj.sku_count) {
                      error_code = {
                        type: "DOMAIN-ERROR",
                        code: "20005",
                        message: "Item not found",
                      };
                      throw new NoRecordFoundError("Item not found");
                    }
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
                          value: obj.sku_count ? obj.sku_count : 0,
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
      return response;
    } catch (err) {
      response = {
        context: context,
        message: {
          ack: {
            status: "NACK",
          },
        },
        error: error_code
          ? error_code
          : {
              type: "DOMAIN-ERROR",
              code: "20000",
              message: "Invalid Catalog",
            },
      };
      console.log("response:", response);
      console.log("Error: ", err);

      return response;
    }
  }

  async select(req) {
    const { context = {}, message = {} } = req;

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
