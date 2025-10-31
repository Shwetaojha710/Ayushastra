const Otp = require("../../../model/otp");
const User = require("../../../model/user");
const Address = require("../../../model/address");
const Order = require("../../../model/order");
const OrderItem = require("../../../model/OrderItem");
const Payment = require("../../../model/payment");
const Helper = require("../../helper/helper");
const sequelize = require("../../connection/connection");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const Product = require("../../../model/product");
const registeredUser = require("../../../model/registeredusers");
const { Op } = require("sequelize");

exports.UserRegistration = async (req, res) => {
  try {
    const data = req.body;
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      country,
      mobile,
      termsCheck,
    } = req.body;
    if (
      !mobile ||
      mobile === undefined ||
      mobile === null ||
      mobile === "" ||
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !termsCheck ||
      !country
    ) {
      return Helper.response(false, "All Fields is required", {}, res, 200);
    }

    const deviceId = req?.headers?.deviceid;

    if (!deviceId || deviceId === undefined || deviceId === "") {
      return Helper.response(false, "Device ID is required", [], res, 400);
    }

    const [ExistsMobile, ExistsEmail] = await Promise.all([
      registeredUser.count({
        where: { mobile },
      }),
      registeredUser.count({
        where: { email },
      }),
    ]);

    if (ExistsMobile) {
      return Helper.response(
        false,
        "Mobile Number Already Exists",
        {},
        res,
        200
      );
    }
    if (ExistsEmail) {
      return Helper.response(false, "Email Already Exists", {}, res, 200);
    }
    const hashedPassword = Helper.encryptPassword(password);
    const hashedConfirmPassword = Helper.encryptPassword(confirmPassword);

    const CreateUser = await registeredUser.create({
      mobile,
      first_name: firstName,
      last_name: lastName,
      email,
      country,
      constent: termsCheck,
      password: hashedPassword,
      confirmPassword: hashedConfirmPassword,
    });

    if (CreateUser) {
      // await Helper.sendSMS(data.mobile, otps.otp, templateId);
      return Helper.response(
        true,
        "User Registered Successfully",
        {},
        res,
        200
      );
    } else {
      return Helper.response(false, "Unable to Registered User", {}, res, 200);
    }
  } catch (error) {
    console.log(error);
    return Helper.response(false, error?.message, {}, res, 200);
  }
};

exports.Userlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return Helper.response(
        false,
        "Please provide all required fields",
        {},
        res,
        200
      );
    }
    const user = await registeredUser.findOne({
      where: {
        [Op.or]: [{ email: email.trim() }],
      },
    });

    if (!user) {
      return Helper.response(false, "User not exists!", {}, res, 200);
    }
    if (password.trim() == Helper.decryptPassword(user.password)) {
      let token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.SECRET_KEY,
        {
          expiresIn: "7d",
        }
      );

      const userInfo = await registeredUser.findByPk(user.id);
      userInfo.token = token;
      await userInfo.save();

      const usersData = await registeredUser.findByPk(user.id);
      const address = await Address.findAll({
        where: {
          user_id: usersData.id,
        },
      });
      if (usersData) {
        let data1 = {
          id: usersData.id,
          first_name: usersData.first_name,
          last_name: usersData.last_name,
          mobile: usersData.mobile,
          email: usersData.email,
          token: usersData.token,
          base_url: process.env.BASE_URL,
          address,
        };
        const responseString = JSON.stringify(data1);
        let encryptedResponse = Helper.encryptPassword(responseString);

        return Helper.response(
          true,
          "You have logged in successfully!",
          data1,
          res,
          200
        );
      } else {
      }
    } else {
      return Helper.response(false, "Invalid Credential", {}, res, 200);
    }
  } catch (error) {
    console.log(error);
    return Helper.response(false, error?.message, {}, res, 200);
  }
};

exports.Userlogout = async (req, res) => {
  const userId = req.users && req.users.id;
  if (!userId) {
    return Helper.response(false, "User ID is required.", [], res, 400);
  }

  try {
    const user = await registeredUser.findByPk(userId);
    if (!user) {
      return Helper.response(false, "User not found.", [], res, 404);
    }

    // Clear the token from the user record
    await user.update({ token: null });

    return Helper.response(
      true,
      "You have logged out successfully!",
      [],
      res,
      200
    );
  } catch (err) {
    console.error("Logout error:", err);
    return Helper.response(false, "Internal server error.", [], res, 500);
  }
};

exports.myOrders = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.body;
    const userId = req.users.id;
    if (!userId) {
      return Helper.response(false, "User ID is required", {}, res, 400);
    }

    const offset = (page - 1) * limit;
    let whereCondition = { user_id: userId, user_type: "registered_user" };

    if (search && search.trim() !== "") {
      whereCondition[Op.or] = [
        { order_no: { [Op.like]: `%${search}%` } },
        { order_status: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset: Number(offset),
    });

    const finalData = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await OrderItem.findAll({
          where: { order_id: order.id },
          raw: true,
        });

        const productNames = await Product.findAll({
          where: {
            id: orderItems.map((item) => item.product_id),
          },
          raw: true,
          attributes: ["product_name", "product_banner_image"],
        });
        // const productNames = orderItems.map(
        //   (item) => item.Product?.name || "Product"
        // );

        let actions = ["View Details"];
        if (order.order_status == "placed") actions.unshift("Write Review");
        if (
          order.order_status == "Processing" ||
          order.order_status == "Shipped"
        )
          actions.unshift("Track Order");
        if (order.order_status == "Cancelled") actions.unshift("Reorder");

        return {
          id: order.id,
          orderId: order.order_no,
          date: moment(order.createdAt).format("YYYY-MM-DD"),
          products: productNames.slice(0, 5),
          status: order.order_status,
          items: productNames.length,
          total: Number(order.total_amount),
          actions,
        };
      })
    );

    if (finalData.length == 0) {
      return Helper.response(false, "No Data Found", [], res, 200);
    }
    return Helper.response(
      true,
      "My Orders fetched successfully",
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
    console.error("myOrders error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.viewAddressDetails = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return Helper.response(false, "Order ID is required", {}, res, 400);
    }

    // Fetch order
    const order = await Order.findOne({
      where: { id },
      raw: true,
    });

    if (!order) {
      return Helper.response(false, "No Order Found", {}, res, 404);
    }

    // Fetch address
    const address = await Address.findOne({
      where: { id: order.billing_address_id },
      raw: true,
    });

    if (!address) {
      return Helper.response(false, "Address not found", {}, res, 404);
    }

    // Fetch order items
    const orderItems = await OrderItem.findAll({
      where: { order_id: order.id },
      raw: true,
    });

    // Build items with product details
    const items = [];
    for (const item of orderItems) {
      const product = await Product.findOne({
        where: { id: item.product_id },
        raw: true,
      });

      items.push({
        name: product?.product_name || "N/A",
        sku: product?.sku || "N/A",
        qty: item?.quantity || 0,
        price: `₹${item?.total || "0.00"}`,
        image: product?.product_banner_image || null,
      });
    }

    // Calculate totals
    const subtotal = orderItems.reduce(
      (sum, item) => sum + parseFloat(item.total || 0),
      0
    );
    const shipping = 9.99; // static or configurable
    const tax = +(subtotal * 0.08).toFixed(2); // 8% example
    const total = subtotal + shipping + tax;

    // Final response structure
    const details = {
      paymentMethod: order.payment_method || "Credit Card (**** 7821)",
      shippingMethod: "Standard Shipping (3-5 days)",
      items,
      priceDetails: {
        subtotal: `₹${order?.subtotal}`,
        shipping: `₹${order?.shipping_cost}`,
        tax: `₹${order?.tax}`,
        total: `₹${order?.total_amount}`,
      },
      shippingAddress: {
        name: `${address?.name || ""}`,
        street: address?.address || "",
        apt: address?.address_line2 || "",
        city: `${address?.city || ""}, ${address?.postal_code || ""}`,
        country: address?.country || "",
        phone: address?.mobile || "",
      },
    };

    return Helper.response(true, "Order details fetched successfully", details, res, 200);
  } catch (error) {
    console.error("Address error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};



