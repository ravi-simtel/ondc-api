import {Router} from 'express';
import { authentication } from '../../middlewares/index.js';

import SearchController from './search.controller.js';

const router = new Router();
const searchController = new SearchController();

// search
router.post(
    '/search', 
    authentication(),
    searchController.search,
);

// on search
router.post('/on_search', searchController.onSearch);

// filter
router.get('/getFilterParams', searchController.getFilterParams);

export default router;
