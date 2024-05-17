const Item = require("../models/Item");

// @desc        Get all items;
// @routes      Get /api/items
// @access      Public
exports.getItems = async (req, res, next) => {
  try {
    let query;

    //Copy req.query
    const reqQuery = { ...req.query };

    //Fields to exclude
    const removeFields = ["select", "sort", "page", "limit"];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);

    //Create operators {$gt, $gte, etc}
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    //finding resource
    query = Item.find(JSON.parse(queryStr));

    //Select Feilds
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    //Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Item.countDocuments();

    query = query.skip(startIndex).limit(limit);

    //Executing query
    const items = await query;

    //Pagination query
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: items.length,
      pagination,
      data: items,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
    });
  }
};

// @desc        Get single item
// @routes      GET /api/items/:id
// @access      Public
exports.getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc        Create a item
// @routes      POST /api/items
// @access      Private
exports.createItem = async (req, res, next) => {
  // console.log(req.body);
  const item = await Item.create(req.body);
  res.status(201).json({ success: true, data: item });
};

// @desc        Update single item
// @routes      PUT /api/items/:id
// @access      Private
exports.updateItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc        Delete single item
// @routes      DELETE /api/items/:id
// @access      Private
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(400).json({
        success: false,
        message: `Bootcamp not found with id of ${req.params.id}`,
      });
    }

    await item.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
