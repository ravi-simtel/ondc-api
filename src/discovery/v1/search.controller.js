import SearchService from "./search.service.js";
import BadRequestParameterError from "../../lib/errors/bad-request-parameter.error.js";
import NoRecordFoundError from "../../lib/errors/no-record-found.error.js";
import { SSE_CONNECTIONS } from "../../utils/sse.js";
import BPPService from "./bpp.service.js";
import { response } from "express";
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
    console.log("On search response", JSON.stringify(req.body, null, 4));

    // Retain old message id from BPP
    const { context = {}, message = {} } = req.body;
    const message_id = context.message_id;
    console.log("message id", message_id);
    if (message_id) {
      const contextFactory = new ContextFactory();
      const protocolContext = contextFactory.create({
        message_id: message_id,
      });

      const response = {
        context: protocolContext,
        message: message,
      };

      // Prepare response
      const result = await bppService.onSearchResponse(response);

      if (result) {
        res.send(200).senf(result);
      }
    } else throw new BadRequestParameterError();
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
