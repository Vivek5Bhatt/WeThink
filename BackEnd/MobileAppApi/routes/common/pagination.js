const middlewares = {};

let DEFAULT_LIMIT = 20;

middlewares.setValues = (req, res, next) => {
  const { page_number, limit} = req.query;
  req.query = {
    ...req.query,
    userId: req._userId,
    page: Number(page_number || 1),
    offset:  Number(page_number ? (page_number-1)*(limit || DEFAULT_LIMIT) : 0),
    limit: Number(limit || DEFAULT_LIMIT)
  }
  next();
}

middlewares.getMeta = (req, res, next) =>{
  const { page, limit } = req.query;
  const totalRecords = req._totalRecords;
  req._paginationMeta = {
    limit,
    currentPage: page,
    totalPages: Math.ceil(totalRecords/limit),
    totalRecords
  }
  next();
}

module.exports = middlewares;