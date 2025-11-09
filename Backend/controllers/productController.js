import path from "path";
import fs from "fs";
import Product from "../models/Product.js";
import Review from "../models/Review.js";

export const createProduct = async (req, res) => {
  try {
    const { name, desc, price, category, condition, colors } = req.body;

    // --- 🎨 Parse Colors safely ---
    let parsedColors = [];
    if (colors) {
      try {
        parsedColors = Array.isArray(colors) ? colors : JSON.parse(colors);
        parsedColors = parsedColors
          .map((c) => {
            if (typeof c === "string") return { name: c, code: "" };
            if (c && typeof c === "object") {
              return {
                name: c.name || "",
                code: c.code && /^#[0-9A-Fa-f]{6}$/.test(c.code) ? c.code : "",
              };
            }
            return null;
          })
          .filter(Boolean);
      } catch {
        parsedColors = [];
      }
    }

    // --- 🧩 Build Specs safely ---
    let specs = {};
    if (req.body.specKey && req.body.specValue) {
      const keys = Array.isArray(req.body.specKey)
        ? req.body.specKey
        : [req.body.specKey];
      const values = Array.isArray(req.body.specValue)
        ? req.body.specValue
        : [req.body.specValue];
      keys.forEach((key, i) => {
        if (key && values[i]) specs[key] = values[i];
      });
    } else if (req.body.specs && typeof req.body.specs === "object") {
      specs = req.body.specs;
    }

    // --- 🖼️ Handle Uploaded Images safely ---
    const images =
      req.files?.images && Array.isArray(req.files.images)
        ? req.files.images.map((file) => `/uploads/${file.filename}`)
        : [];

    // --- ✅ Create Product ---
    const product = await Product.create({
      name,
      desc,
      price,
      category,
      condition,
      colors: parsedColors,
      specs,
      images,
      seller: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);

    if (error.name === "MulterError") {
      return res.status(400).json({
        success: false,
        message: "Image upload failed",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// ✅ Get all products belonging to the logged-in seller
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .populate("category", "name")
      .populate("reviews")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("❌ Error fetching seller products:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching seller products",
    });
  }
};

// ✅ Get all products (with optional filters)
export const getAllProducts = async (req, res) => {
  try {
    const { category, keyword, minPrice, maxPrice } = req.query;

    let query = {};

    if (category) query.category = category;
    if (keyword) query.name = { $regex: keyword, $options: "i" };
    if (minPrice || maxPrice)
      query.price = {
        ...(minPrice ? { $gte: minPrice } : {}),
        ...(maxPrice ? { $lte: maxPrice } : {}),
      };

    const products = await Product.find(query)
      .populate("seller", "name email")
      .populate("reviews");

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
};

// ✅ Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: "seller",
        select: "name email sellerInfo avatar bio roles followers",
        model: "User",
      })
      .populate({
        path: "reviews",
        // Review schema uses `author` as the reference to User
        populate: { path: "author", select: "name email avatar" },
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 🧠 Prevent counting seller's own views
    const userId = req.user?._id?.toString();
    const sellerId = product.seller?._id?.toString();

    if (userId && userId === sellerId) {
      // Seller viewing their own product → do not count
      return res.status(200).json({ success: true, product });
    }

    // 🧠 Count view only once per user (if logged in)
    if (userId) {
      const alreadyViewed = product.viewedBy?.some(
        (viewerId) => viewerId.toString() === userId
      );

      if (!alreadyViewed) {
        product.views = (product.views || 0) + 1;
        product.viewedBy = [...(product.viewedBy || []), userId];
        await product.save();
      }
    } else {
      // 🧠 Guest user → always count
      product.views = (product.views || 0) + 1;
      await product.save();
    }

    // Normalize seller info for frontend
    const isUserFollowing = product.seller.followers?.some(
      (followerId) => followerId.toString() === userId
    );

    const normalized = {
      ...product.toObject(),
      seller: {
        _id: product.seller._id,
        name: product.seller.name,
        email: product.seller.email,
        storeName:
          product.seller.sellerInfo?.storeName ||
          product.seller.name ||
          "Unknown Seller",
        description:
          product.seller.sellerInfo?.description ||
          product.seller.bio ||
          "No seller story yet",
        logo: product.seller.avatar || "../images/guy.png",
        followers: product.seller.followers || [],
        followerCount: (product.seller.followers || []).length,
        bio: product.seller.bio || "No bio available",
        isFollowing: isUserFollowing,
      },
    };

    res.status(200).json({
      success: true,
      product: normalized,
    });
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("🟢 Updating product:", productId);

    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    // --- Update text fields
    const fields = [
      "name",
      "price",
      "stock",
      "status",
      "desc",
      "category",
      "condition",
    ];
    for (const key of fields) {
      if (req.body[key] !== undefined) product[key] = req.body[key];
    }

    // --- Update specs
    if (req.body.specKey && req.body.specValue) {
      const keys = Array.isArray(req.body.specKey)
        ? req.body.specKey
        : [req.body.specKey];
      const values = Array.isArray(req.body.specValue)
        ? req.body.specValue
        : [req.body.specValue];
      product.specs = {};
      keys.forEach((k, i) => k && values[i] && (product.specs[k] = values[i]));
    } else if (req.body.specs && typeof req.body.specs === "object") {
      product.specs = req.body.specs;
    }

    // --- Colors normalization
    if (req.body.colors) {
      const colors = Array.isArray(req.body.colors)
        ? req.body.colors
        : JSON.parse(req.body.colors);
      product.colors = colors.map((c) =>
        typeof c === "object"
          ? { name: c.name || String(c), code: c.code || "" }
          : { name: String(c), code: "" }
      );
    }

    // --- Handle images
    const uploadDir = path.join(process.cwd(), "uploads");
    product.images = Array.isArray(product.images) ? product.images : [];

    // Remove images from DB & disk
    let removeImages = [];
    if (req.body.removeImages) {
      try {
        removeImages = Array.isArray(req.body.removeImages)
          ? req.body.removeImages
          : JSON.parse(req.body.removeImages);
      } catch {
        removeImages = String(req.body.removeImages)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      // Remove from DB
      product.images = product.images.filter(
        (img) => !removeImages.includes(img)
      );

      // Remove from disk
      removeImages.forEach((img) => {
        const filePath = path.join(uploadDir, path.basename(img));
        fs.unlink(filePath, (err) => {
          if (err) console.warn("⚠️ Could not delete:", filePath);
          else console.log("🗑️ Deleted file:", filePath);
        });
      });
    }

    // Add new uploads
    let uploadedImages = [];
    if (req.files?.images && Array.isArray(req.files.images)) {
      uploadedImages = req.files.images.map((f) => `/uploads/${f.filename}`);
    }

    // Replace or merge
    product.images =
      req.body.replaceImages === "true" || req.body.replaceImages === true
        ? uploadedImages
        : Array.from(new Set([...product.images, ...uploadedImages]));

    // --- Save
    const updatedProduct = await product.save();
    console.log("✅ Updated Product in DB:", updatedProduct);

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// ✅ Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    // only seller can delete
    if (product.seller.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await product.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete product" });
  }
};

// ✅ Add review to product
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
    });

    product.reviews.push(review._id);
    await product.save();

    res.status(201).json({ success: true, message: "Review added", review });
  } catch (error) {
    console.error("❌ Error adding review:", error);
    res.status(500).json({ success: false, message: "Failed to add review" });
  }
};

// NOTE: Variant APIs removed to avoid SKU unique-index conflicts.

export const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }, // exclude current product
    })
      .limit(8)
      .select("_id name price images image");

    res.json(related);
  } catch (err) {
    console.error("❌ Error fetching related products:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdvertisedProducts = async (req, res) => {
  try {
    // Adjust this to your schema — maybe you use "isAdvertised" or "featured"
    const advertisedProducts = await Product.find({ isAdvertised: true }).limit(
      10
    );
    res.json(advertisedProducts);
  } catch (error) {
    console.error("Error fetching advertised products:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching advertised products" });
  }
};

export const filterAndSortProducts = async (req, res) => {
  try {
    const { categories, conditions, prices, sort } = req.query;
    const query = {};

    // ---------------------------
    // 🔍 CATEGORY FILTER
    // ---------------------------
    if (categories) {
      const catArray = categories.split(",").map((c) => new RegExp(c, "i"));
      query.category = { $in: catArray };
    }

    // ---------------------------
    // ⚙️ CONDITION FILTER
    // ---------------------------
    if (conditions) {
      const condArray = conditions.split(",").map((c) => new RegExp(c, "i"));
      query.condition = { $in: condArray };
    }

    // ---------------------------
    // 💰 PRICE FILTER
    // ---------------------------
    if (prices) {
      const priceRanges = prices.split(",");
      const orConditions = [];

      priceRanges.forEach((r) => {
        if (r === "under-50") orConditions.push({ price: { $lt: 50 } });
        if (r === "50-100")
          orConditions.push({ price: { $gte: 50, $lte: 100 } });
        if (r === "100-200")
          orConditions.push({ price: { $gte: 100, $lte: 200 } });
        if (r === "above-200") orConditions.push({ price: { $gt: 200 } });
      });

      if (orConditions.length > 0) {
        query.$or = orConditions;
      }
    }

    // ---------------------------
    // 🧮 SORT LOGIC
    // ---------------------------
    let sortQuery = {};
    if (sort === "price-low") sortQuery = { price: 1 };
    else if (sort === "price-high") sortQuery = { price: -1 };
    else if (sort === "newest") sortQuery = { createdAt: -1 };
    else if (sort === "oldest") sortQuery = { createdAt: 1 };

    // ---------------------------
    // 📦 GET PRODUCTS
    // ---------------------------
    const products = await Product.find(query).sort(sortQuery);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error filtering/sorting products:", error);
    res.status(500).json({ message: "Error filtering/sorting products" });
  }
};

// POST /products/:id/view
export const trackProductView = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const userId = req.user?._id?.toString();
    const sellerId = product.seller?.toString();

    // Seller viewing own product should not increment
    if (userId && userId === sellerId)
      return res
        .status(200)
        .json({ message: "Self view ignored", views: product.views || 0 });

    let incremented = false;

    if (userId) {
      // Only increment if user hasn't viewed before
      product.viewedBy = product.viewedBy || [];
      if (!product.viewedBy.includes(userId)) {
        product.views = (product.views || 0) + 1;
        product.viewedBy.push(userId);
        incremented = true;
      }
    } else {
      // Anonymous visitor: always increment
      product.views = (product.views || 0) + 1;
      incremented = true;
    }

    if (incremented) await product.save();

    res.status(200).json({ success: true, views: product.views });
  } catch (err) {
    console.error("❌ Error tracking view:", err);
    res.status(500).json({ message: "Server error tracking view" });
  }
};
