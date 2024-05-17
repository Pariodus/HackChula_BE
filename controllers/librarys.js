const Library = require("../models/Library");

// @desc        Get all librarys;
// @routes      Get /api/librarys
// @access      Public
exports.getLibrarys = async (req, res, next) => {
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
        query = Library.find(JSON.parse(queryStr)).populate("reservations");
    
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
        const total = await Room.countDocuments();
    
        query = query.skip(startIndex).limit(limit);
    
        //Executing query
        const librarys = await query;
    
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
          count: librarys.length,
          pagination,
          data: librarys,
        });
      } catch (err) {
        res.status(400).json({
          success: false,
        });
      }
};

// @desc        Get single library
// @routes      GET /api/librarys/:id
// @access      Public
exports.getLibrary = async (req, res, next) => {
  try {
    const library = await Library.findById(req.params.id);

    if (!library) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({
      success: true,
      data: library
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc        Create a library
// @routes      POST /api/librarys
// @access      Private
exports.createLibrary = async (req, res, next) => {
  // console.log(req.body);
  const library = await Library.create(req.body);
  res.status(201).json({ success: true, data: library });
};

// @desc        Update single library
// @routes      PUT /api/librarys/:id
// @access      Private
exports.updateLibrary = async (req, res, next) => {
  try {
    const library = await Library.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!library) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({
      success: true,
      data: library,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};