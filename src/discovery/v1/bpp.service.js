import { bppSearch } from "../../utils/bppApis/index.js";

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
        context: context,
        searchRequest: searchRequest,
        message: response.message,
      };
    } catch (err) {
      throw err;
    }
  }
}

export default BPPService;
