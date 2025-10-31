const { Op, fn, col, literal } = require("sequelize");
const OrderItem = require("../../../model/OrderItem");
const Order = require("../../../model/order");
const User = require("../../../model/user");
const Helper = require("../../helper/helper");
const Product = require("../../../model/product");
const Category = require("../../../model/category");
const moment = require("moment");
const Address = require("../../../model/address");

// Helper to generate current month labels until today
function generateMonthLabels() {
  const now = new Date();
  const currentMonth = now.toLocaleString("default", { month: "short" });
  const today = now.getDate();

  const labels = [];
  for (let i = 1; i <= today; i++) {
    labels.push(`${String(i).padStart(2, "0")} ${currentMonth}`);
  }
  return labels;
}

// Helper for random dataset points
function randomData(length, min = 85, max = 140) {
  return Array.from(
    { length },
    () => Math.floor(Math.random() * (max - min + 1)) + min
  );
}

exports.getDashboardData = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    // ---- SALES STATS ----
    const overAllSales = await Order.sum("total_amount", {
      where: { payment_status: "paid" },
    });
    const last_month_sales = await Order.sum("total_amount", {
      where: {
        payment_status: "paid",
        createdAt: {
          [Op.gte]: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          [Op.lt]: startOfMonth,
        },
      },
    });
    const this_week_sales = await Order.sum("total_amount", {
      where: {
        payment_status: "paid",
        createdAt: { [Op.gte]: startOfWeek },
      },
    });

    const last_week_sales = await Order.sum("total_amount", {
      where: {
        payment_status: "paid",
        createdAt: {
          [Op.between]: [
            new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14),
            new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
          ],
        },
      },
    });

    const percent_change =
      last_week_sales > 0
        ? parseFloat(
            ((this_week_sales - last_week_sales) / last_week_sales) * 100
          ).toFixed(2)
        : 0;
    const growth = this_week_sales >= last_week_sales;

    const labels = generateMonthLabels();
    const totalSalesData = randomData(labels.length);

    const totalSales = {
      overAllSales: Number(overAllSales || 0),
      last_month_sales: Number(last_month_sales || 0),
      this_week_sales: Number(this_week_sales || 0),
      percent_change,
      growth,
      totalSales: {
        labels,
        dataUnit: "Sales",
        lineTension: 0.3,
        datasets: [
          {
            label: "Sales",
            borderColor: "#9d72ff",
            backgroundColor: "rgba(157, 114, 255, 0.25)",
            borderWidth: 2,
            fill: true,
            pointBorderColor: "transparent",
            pointBackgroundColor: "transparent",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#9d72ff",
            pointBorderWidth: 2,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 2,
            pointRadius: 4,
            pointHitRadius: 4,
            data: totalSalesData,
          },
        ],
      },
    };

    // ---- STORE STATS ----
    const storeStats = [
      {
        title: "Orders",
        count: await Order.count(),
        icon: "bag",
        class: "bg-primary-dim",
      },
      {
        title: "Customers",
        count: await User.count(),
        icon: "users",
        class: "bg-info-dim",
      },
      {
        title: "Products",
        count: Product ? await Product.count() : 674,
        icon: "box",
        class: "bg-pink-dim",
      },
      {
        title: "Categories",
        count: Category ? await Category.count() : 68,
        icon: "server",
        class: "bg-purple-dim",
      },
    ];

    // ---- CUSTOMER DATA ----
    const customerLabels = labels;
    const customerPoints = randomData(customerLabels.length, 85, 135);
    const customerData = {
      total: 15254,
      growth: true,
      percent_change: 3.27,
      totalCustomers: {
        labels: customerLabels,
        dataUnit: "Customers",
        lineTension: 0.3,
        datasets: [
          {
            label: "Customers",
            borderColor: "#83bcff",
            backgroundColor: "rgba(131, 188, 255, 0.25)",
            borderWidth: 2,
            fill: true,
            pointBorderColor: "transparent",
            pointBackgroundColor: "transparent",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#83bcff",
            pointBorderWidth: 2,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 2,
            pointRadius: 4,
            pointHitRadius: 4,
            data: customerPoints,
          },
        ],
      },
    };

    // ---- ORDER DATA ----
    const orderLabels = labels;
    const orderPoints = randomData(orderLabels.length, 75, 140);
    const orderData = {
      total: 12354,
      percent_change: 4.63,
      growth: true,
      totalOrders: {
        labels: orderLabels,
        dataUnit: "Orders",
        lineTension: 0.3,
        datasets: [
          {
            label: "Orders",
            borderColor: "#7de1f8",
            backgroundColor: "rgba(125, 225, 248, 0.25)",
            borderWidth: 2,
            fill: true,
            pointBorderColor: "transparent",
            pointBackgroundColor: "transparent",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#7de1f8",
            pointBorderWidth: 2,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 2,
            pointRadius: 4,
            pointHitRadius: 4,
            data: orderPoints,
          },
        ],
      },
    };

    // ---- FINAL RESPONSE ----
    return Helper.response(
      true,
      "Data Found Successfully",
      {
        totalSales,
        storeStats,
        customerData,
        orderData,
      },
      res,
      200
    );
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.dashboardOrderTable = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.body;

    const offset = (page - 1) * limit;
    let whereCondition = { payment_status: "paid"};

    // if (search && search.trim() !== "") {
    //   whereCondition[Op.or] = [
    //     { order_no: { [Op.like]: `%${search}%` } },
    //     { order_status: { [Op.like]: `%${search}%` } },
    //     { total_amount: { [Op.like]: `%${search}%` } },
    //     { createdAt: { [Op.like]: `%${search}%` } },
    //   ];
    // }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset: Number(offset),
    });

    let finalData = await Promise.all(
      orders.map(async (order) => {
        const [user, address, orderCount] = await Promise.all([
          User.findOne({ where: { id: order.user_id } }),
          Address.findOne({ where: { id: order.billing_address_id } }),
          OrderItem.count({ where: { order_id: order.id } }),
        ]);

        return {
          id: order.id,
          orderNum: order.order_no,
          totalAmount: Number(order.total_amount),
          user_name: user
            ? `${user.first_name} ${user.last_name || ""}`.trim()
            : "Guest User",
          user_image: user?.profile_image || null,
          status: order?.order_status || "pending",
          date: moment(order.createdAt).format("YYYY-MM-DD hh:mm A"),
          address: address?.address || "N/A",
          product_count: orderCount,
        };
      })
    );

    if (search && search.trim() !== "") {
      const lower = search.toLowerCase();
      finalData = finalData.filter(
        (item) =>
          item.orderNum.toLowerCase().includes(lower) ||
          item.status.toLowerCase().includes(lower) ||
          item.address.toLowerCase().includes(lower) ||
          item.user_name.toLowerCase().includes(lower) ||
          item.totalAmount.toString().includes(lower)
      );
    }

    return Helper.response(
      true,
      "Dashboard order table fetched successfully",
      {
        page: Number(page),
        totalPages: Math.ceil(count / limit),
        totalOrders: count,
        orders: finalData,
      },
      res,
      200
    );
  } catch (error) {
    console.error("dashboardOrderTable error:", error);
    return Helper.response(false, error.message, error, res, 500);
  }
};
exports.getPopularProducts = async (req, res) => {
  try {
    const { filter } = req.body;
    const now = new Date();
     let whereCondition = { payment_status: "paid"};;

    if (filter == "Weekly") {
      const lastWeek = new Date();
      lastWeek.setDate(now.getDate() - 7);
      whereCondition.createdAt = { [Op.between]: [lastWeek, now] };
    } else if (filter == "Monthly") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      whereCondition.createdAt = { [Op.between]: [firstDay, now] };
    }

    const orders = await Order.findAll({
      attributes: ["id"],
      where: whereCondition,
      raw: true,
    });

    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders found for selected filter",
        topProducts: [],
      });
    }

    const orderIds = orders.map((o) => o.id);

    const orderItems = await OrderItem.findAll({
      where: { order_id: orderIds },
      attributes: ["product_id", "quantity"],
      raw: true,
    });

    if (orderItems.length == 0) {
      return Helper.response(
        false,
        "No products found in selected orders",
        [],
        res,
        200
      );
    }

    const productSalesMap = {};
    orderItems.forEach((item) => {
      if (!productSalesMap[item.product_id]) {
        productSalesMap[item.product_id] = 0;
      }
      productSalesMap[item.product_id] += parseInt(item.quantity, 10);
    });

    const productIds = Object.keys(productSalesMap);

    const products = await Promise.all(
      productIds.map(async (id) => {
        const product = await Product.findOne({
          where: { id },
          attributes: [
            "id",
            "product_name",
            "product_banner_image",
            "offer_price",
            "mrp",
          ],
          raw: true,
        });
        if (product) {
          return {
            ...product,
            sold: productSalesMap[id],
          };
        }
        return null;
      })
    );

    if (!products || products.length == 0) {
      return Helper.response(false, "No Data Found", [], res, 200);
    }
    const topProducts = products
      .filter((p) => p !== null)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    return Helper.response(true, "Data Found Suscess", topProducts, res, 200);
  } catch (error) {
    console.error("Error fetching popular products:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};
