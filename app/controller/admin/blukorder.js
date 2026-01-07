const Product = require("../../model/product");
const Bulkorder=require("../../model/bulkorder")

exports.createBulkOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return Helper.response(false, "Invalid payload", {}, res, 400);
    }

    const product = await Product.findByPk(productId, { transaction: t });

    if (!product) {
      await t.rollback();
      return Helper.response(false, "Product not found", {}, res, 404);
    }

    if (product.stock < quantity) {
      await t.rollback();
      return Helper.response(false, "Insufficient stock", {}, res, 400);
    }

    const totalPrice = quantity * product.price;

    const order = await Bulkorder.create(
      { productId, quantity, totalPrice },
      { transaction: t }
    );

    product.stock -= quantity;
    await product.save({ transaction: t });

    await t.commit();

    return Helper.response(true, "Bulk order created", order, res, 201);
  } catch (err) {
    await t.rollback();
    return Helper.response(false, err.message, {}, res, 500);
  }
};

exports.updateBulkOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const order = await Bulkorder.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return Helper.response(false, "Order not found", {}, res, 404);
    }

    const product = await Product.findByPk(order.productId, { transaction: t });

    // restore previous quantity
    product.stock += order.quantity;

    if (product.stock < quantity) {
      await t.rollback();
      return Helper.response(false, "Insufficient stock", {}, res, 400);
    }

    order.quantity = quantity;
    order.totalPrice = quantity * product.price;

    product.stock -= quantity;

    await order.save({ transaction: t });
    await product.save({ transaction: t });

    await t.commit();

    return Helper.response(true, "Bulk order updated", order, res, 200);
  } catch (err) {
    await t.rollback();
    return Helper.response(false, err.message, {}, res, 500);
  }
};

exports.deleteBulkOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const order = await Bulkorder.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return Helper.response(false, "Order not found", {}, res, 404);
    }

    const product = await Product.findByPk(order.productId, { transaction: t });

    product.stock += order.quantity;
    await product.save({ transaction: t });

    await order.destroy({ transaction: t });

    await t.commit();

    return Helper.response(true, "Bulk order deleted", {}, res, 200);
  } catch (err) {
    await t.rollback();
    return Helper.response(false, err.message, {}, res, 500);
  }
};

exports.listBulkOrders = async (req, res) => {
  try {
    const orders = await Bulkorder.findAll({
      include: [{ model: Product, attributes: ["name", "price"] }],
      order: [["createdAt", "DESC"]],
    });

    return Helper.response(true, "Bulk orders list", orders, res, 200);
  } catch (err) {
    return Helper.response(false, err.message, {}, res, 500);
  }
};
