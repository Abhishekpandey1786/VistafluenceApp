const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Instamojo = require("instamojo-nodejs");
const User = require("../models/User");
const Order = require("../models/instamojo");
const mongoose = require("mongoose");

Instamojo.setKeys(
  process.env.INSTAMOJO_API_KEY,
  process.env.INSTAMOJO_AUTH_TOKEN
);
Instamojo.isSandboxMode(false);


const planCodes = {
  Basic: "BASIC",
  Standard: "STANDARD",
  Advanced: "ADVANCE",
  Premium: "PREMIUM",
};

const planNames = {
  BASIC: "Basic",
  STANDARD: "Standard",
  ADVANCE: "Advanced",
  PREMIUM: "Premium",
};
const getMaxApplications = (plan) => {
  const limits = {
  Basic: 6,
  Standard: 15,
  Advanced: 40,
  Premium: 9999,
};
  return limits[plan] || 3;
};
router.post("/pay", async (req, res) => {
  try {
    const { plan, userId, email, userName, phone } = req.body;

    console.log("REQUEST BODY =>", req.body);

    if (!plan || !userId || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing plan, userId or email",
      });
    }

    const planCode = planCodes[plan.name];

    if (!planCode) {
      return res.status(400).json({
        success: false,
        error: "Invalid Plan",
      });
    }

    const amountInINR = Number(plan.price).toFixed(2);

    const data = new Instamojo.PaymentData();

    data.purpose = `${planCode}|${userId}`;
    data.amount = amountInINR;
    data.currency = "INR";

    data.buyer_name = userName || "Customer";
    data.email = email.trim().toLowerCase();
    const cleanPhone = phone?.toString().replace(/\D/g, "").slice(-10);
    if (cleanPhone.length === 10) {
      data.phone = `+91${cleanPhone}`;
    }

    data.send_email = true;
    data.send_sms = false;

    const fUrl = process.env.FRONTEND_URL.replace(/\/$/, "");
    const bUrl = process.env.BACKEND_URL.replace(/\/$/, "");

    data.setRedirectUrl(
      `${fUrl}/payment-status?userId=${userId}&plan=${planCode}`
    );

    data.webhook = `${bUrl}/api/instamojo/webhook`;
    Instamojo.createPayment(data, (error, response) => {
      console.log("INSTAMOJO ERROR =>", error);
      console.log("INSTAMOJO RESPONSE =>", response);

      if (error) {
        return res.status(400).json({
          success: false,
          error:
            error.message ||
            error.error ||
            JSON.stringify(error),
        });
      }

      let resp = response;

      if (typeof response === "string") {
        resp = JSON.parse(response);
      }

      console.log("PARSED RESPONSE =>", resp);

      if (!resp.success) {
        return res.status(400).json({
          success: false,
          error: resp.message || "Payment Creation Failed",
          response: resp,
        });
      }

      return res.status(200).json({
        success: true,
        url: resp.payment_request.longurl,
        paymentRequestId: resp.payment_request.id,
      });
    });
  } catch (err) {
    console.error("PAY API ERROR =>", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});
router.post("/webhook", async (req, res) => {
  try {
    const data = { ...req.body };
    const providedMac = data.mac;
    delete data.mac;

    // MAC Verification logic
    const payload = Object.keys(data).sort().map((key) => data[key]).join("|");
  
    const generatedMac = crypto
      .createHmac("sha1", process.env.INSTAMOJO_SALT)
      .update(payload)
      .digest("hex");

    if (generatedMac !== providedMac) {
      console.error("❌ MAC Mismatch");
      return res.status(400).send("Invalid MAC");
    }

    if (data.status === "Credit") {
      if (!data.purpose || !data.purpose.includes("|")) {
        console.log("⚠️ Test Webhook received with invalid purpose format:", data.purpose);
        return res.status(200).send("Test OK, but no DB update");
      }

      const [planCode, userId] = data.purpose.split("|");
      const planName = planNames[planCode];
      if (!planName || !userId || userId.length < 10) {
        console.error("❌ Invalid Plan or UserID extracted");
        return res.status(400).send("Invalid Purpose Data");
      }

      const existingOrder = await Order.findOne({ transactionId: data.payment_id });

      if (!existingOrder) {
        await Order.create({
          userId,
          plan: planName,
          amount: data.amount,
          transactionId: data.payment_id,
          orderId: data.payment_request_id,
          paymentStatus: "SUCCESS",
          userEmail: data.buyer,
          userName: data.buyer_name,
        });

        await User.findByIdAndUpdate(userId, {
  $set: {
    "subscription.plan": planName,
    "subscription.applicationsUsed": 0,
    "subscription.lastResetDate": new Date(),
    "subscription.startDate": new Date(),
    "subscription.endDate": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
});

        console.log("✅ Order Saved & Subscription Activated");
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    res.status(500).send("Webhook Error");
  }
});
router.post("/verify-status", async (req, res) => {
  try {
    const { payment_id, payment_request_id, userId, planCode } = req.body;

    if (!payment_id || !payment_request_id || !userId || !planCode) {
      return res.status(400).json({
        error: "Missing verification parameters",
      });
    }

    Instamojo.getPaymentDetails(
      payment_request_id,
      payment_id,
      async (error, response) => {
        if (error) {
          return res
            .status(500)
            .json({ error: "Verification Failed" });
        }

        const result =
          typeof response === "string"
            ? JSON.parse(response)
            : response;

        const isSuccess =
          result.payment_request &&
          (result.payment_request.status === "Completed" ||
            result.payment_request.payment?.status === "Credit");

        if (!isSuccess) {
          return res.status(400).json({
            success: false,
            message: "Payment not completed",
          });
        }

        const planName = planNames[planCode];
        const existingOrder = await Order.findOne({
          transactionId: payment_id,
        });

        if (!existingOrder) {
          await Order.create({
            userId,
            plan: planName,
            amount: result.payment_request.amount,
            transactionId: payment_id,
            paymentStatus: "SUCCESS",
          });

          await User.findByIdAndUpdate(userId, {
            subscription: {
              plan: planName,
              status: "Active",
              maxApplications: getMaxApplications(planName),
              expiryDate: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ),
            },
          });
        }

        res.json({
          success: true,
          message: "Subscription Activated!",
        });
      }
    );
  } catch (error) {
    console.error("❌ Verification Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/my-orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid User ID format" });
    }
    const orders = await Order.find({ 
      userId: new mongoose.Types.ObjectId(userId) 
    }).sort({ createdAt: -1 });

    console.log(`✅ Found ${orders.length} orders for user: ${userId}`);
    res.json(orders);
  } catch (error) {
    console.error("❌ Fetch failed:", error);
    res.status(500).json({ error: "Fetch failed" });
  }
});

module.exports = router;