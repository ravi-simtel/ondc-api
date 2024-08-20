import SearchService from "./search.service.js";
import BadRequestParameterError from "../../lib/errors/bad-request-parameter.error.js";
import NoRecordFoundError from "../../lib/errors/no-record-found.error.js";
import BPPService from "./bpp.service.js";
import ContextFactory from "../../factories/ContextFactory.js";

const searchService = new SearchService();
const bppService = new BPPService();

class SearchController {
  /**
   * search
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
  search(req, res, next) {
    const searchRequest = req.body;

    searchService
      .search(searchRequest)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  /**
   * on search
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
  onSearch = async (req, res, next) => {
    console.log("On search request: ", JSON.stringify(req.body, null, 4));
    let onSearchResponse = {};
    try {
      // Retain old message id from BPP
      const { context = {}, message = {} } = req;
      const message_id = context.message_id;
      if (message_id) {
        const contextFactory = new ContextFactory();
        const protocolContext = contextFactory.create({
          message_id: message_id,
        });

        const request = {
          context: protocolContext,
          message: message,
        };

        // Prepare response
        onSearchResponse = await bppService.onSearchResponse(request);

        if (onSearchResponse) {
          console.log("On Search Response: ", onSearchResponse);
          res.sendStatus(200).send(onSearchResponse);
        }
      }
    } catch (err) {
      console.log("Issue with catalog ");
      onSearchResponse = {
        context: context,
        message: {
          ack: {
            status: "NACK",
          },
        },
        error: {
          type: "DOMAIN-ERROR",
          code: "20000",
          message: "Invalid Catalog",
        },
      };
      console.log("On Search Response: ", onSearchResponse);
      res.send(200).send(onSearchResponse);
    }
  };

  /**
   * filter
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
  getFilterParams(req, res, next) {
    const { query } = req;
    const { messageId } = query;

    if (messageId) {
      bppService
        .getFilterParams(query)
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          next(err);
        });
    } else throw new BadRequestParameterError();
  }
}

export default SearchController;
