const MenuItem = require('../models/menuItem');
// Creating new menu item
exports.createMenuItem = async (req, res) => {
  try {
    console.log('req.user:', req.user);
    const { name, price, category, tags, available } = req.body;
    const restaurantId = req.user.restaurant; 
    console.log('🧾 Logged-in user restaurant ID:', restaurantId);
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID missing in user data',
      });
    }
    
    const savedItem = new MenuItem({
      name,
      price,
      category,
      tags,
      available,
      restaurant: restaurantId  // ✅ assign here
    });
    await savedItem.save();
    res.status(201).json({
      success: true,
      message: 'Menu item added successfully!',
      data: savedItem
    });
  } catch (err) {
    console.error('CreateMenuItem error:', err); 
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors
      });
    }

    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// READ / SEARCH menu items
// Assuming MenuItem is imported at top: const MenuItem = require('../models/MenuItem');

exports.getMenuItems = async (req, res) => {
  try {
    const { name, category, tags, sort, minPrice, maxPrice, page, limit, showDeleted, order } = req.query;
    console.log('Received query params:', req.query);

    let filter = {};

    // Handle active/deleted items
    if (order === 'true') {
      // Only active & available items if order param is true
      filter.isActive = true;
      filter.available = true;
    } else if (showDeleted === 'true') {
      // Show all, no filter on isActive
    } else {
      // Default: show only active items
      filter.isActive = true;
    }

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim());
      filter.tags = { 
        $in: tagList.map(tag => new RegExp(`^${tag}$`, 'i')) 
      };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Pagination params
    const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
    const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 10;
    const skip = (pageNum - 1) * limitNum;

    let query = MenuItem.find(filter).populate({
      path: 'restaurant',
      select: 'name',
      options: { strictPopulate: false } // prevents hard error if missing
    });

    // Sorting
    if (sort) {
      switch (sort) {
        case 'price_asc':
          query = query.sort({ price: 1 });
          break;
        case 'price_desc':
          query = query.sort({ price: -1 });
          break;
        case 'name_asc':
          query = query.sort({ name: 1 });
          break;
        case 'name_desc':
          query = query.sort({ name: -1 });
          break;
      }
    }

    const totalCount = await MenuItem.countDocuments(filter);
    const items = await query.skip(skip).limit(limitNum);

    console.log(`Returning ${items.length} items out of ${totalCount}`);

    res.json({
      success: true,
      results: items.length,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      data: items
    });
  } catch (err) {
    console.error('Error fetching menu items:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching menu items',
      error: err.message
    });
  }
};

//get menu item by id
exports.getMenuItemById = async (req, res) => {
  console.log('GET request for menu item:', req.params.id); // Add this
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item || !item.isActive) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching menu item', error: err.message });
  }
};

//Updating menu items
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Optionally, validate updates here or rely on schema validation

    const updatedItem = await MenuItem.findByIdAndUpdate(id, updates, {
      new: true,            // Return the updated document
      runValidators: true,  // Run schema validators on update
    });

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: updatedItem
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating menu item',
      error: err.message
    });
  }
};

//soft deleting menu items
exports.softDeleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Invalid value for isActive. Must be true or false.',
      });
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      message: `Menu item is now marked as ${isActive ? 'active' : 'inactive'}`,
      data: updatedItem
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating menu item status',
      error: err.message
    });
  }
};

//changes availability
exports.updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    const item = await MenuItem.findByIdAndUpdate(id, { available }, { new: true });

    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.deleteAllMenuItems = async (req, res) => {
  try {
    await MenuItem.deleteMany({});
    res.json({ success: true, message: 'All menu items deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
