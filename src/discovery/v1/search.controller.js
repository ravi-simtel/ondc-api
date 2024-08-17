import SearchService from "./search.service.js";
import BadRequestParameterError from "../../lib/errors/bad-request-parameter.error.js";
import NoRecordFoundError from "../../lib/errors/no-record-found.error.js";
import { SSE_CONNECTIONS } from "../../utils/sse.js";

const searchService = new SearchService();

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

    console.log("Search Request", searchRequest);

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
  onSearch(req, res, next) {
    console.log("On search response", req.body);

    const { context = {}, message = {} } = req.body;
    const messageId = context.message_id;
    console.log("message id", messageId);

    // Parse each response from the buyer
    if (messageId) {
      searchService
        .onSearch(req.body)
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          next(err);
        });
    } else throw new BadRequestParameterError();
  }

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
      searchService
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
