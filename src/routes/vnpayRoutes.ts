import express from 'express';
import crypto from 'crypto';
import { Request, Response } from 'express';
import orderService from '../services/orderService';
import { BadRequestError } from '../utils/errors';
import { TrangThaiThanhToan } from '../types/common';

const router = express.Router();

// VNPAY configuration (use sandbox credentials for testing)
const vnp_TmnCode = process.env.VNPAY_TMN_CODE || '';
const vnp_HashSecret = process.env.VNPAY_HASH_SECRET || '';
const vnp_Url = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnp_ReturnUrl = process.env.VNPAY_RETURN_URL || 'http://localhost:5000/api/vnpay/vnpay_return';

// Create VNPAY payment URL
router.post('/create_payment_url', async (req: Request, res: Response) => {
  try {
    const { orderId, amount, orderInfo, ipAddr } = req.body;

    if (!orderId || !amount || !orderInfo || !ipAddr) {
      throw new BadRequestError('Missing required parameters');
    }

    const date = new Date();
    const createDate = date.getFullYear().toString() +
                      ('0' + (date.getMonth() + 1)).slice(-2) +
                      ('0' + date.getDate()).slice(-2) +
                      ('0' + date.getHours()).slice(-2) +
                      ('0' + date.getMinutes()).slice(-2) +
                      ('0' + date.getSeconds()).slice(-2);

    const vnp_Params: { [key: string]: string | number } = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnp_TmnCode,
      vnp_Amount: amount * 100, // VNPAY requires amount in VND x 100
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: '250000', // Adjust based on your merchant type
      vnp_Locale: 'vn',
      vnp_CreateDate: createDate,
      vnp_IpAddr: ipAddr,
      vnp_ReturnUrl: vnp_ReturnUrl,
    };

    // Sort parameters by key
    const sortedParams = Object.keys(vnp_Params)
      .sort()
      .reduce((obj: { [key: string]: string | number }, key) => {
        obj[key] = vnp_Params[key];
        return obj;
      }, {});

    // Create secure hash
    const signData = new URLSearchParams(sortedParams as any).toString();
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const vnp_SecureHash = hmac.update(signData).digest('hex');
    sortedParams.vnp_SecureHash = vnp_SecureHash;

    const paymentUrl = `${vnp_Url}?${new URLSearchParams(sortedParams as any).toString()}`;

    res.status(200).json({
      success: true,
      data: { paymentUrl },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
});

// Handle VNPAY return callback
router.get('/vnpay_return', async (req: Request, res: Response) => {
  try {
    const vnp_Params = req.query;
    const secureHash = vnp_Params.vnp_SecureHash as string;
    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    // Sort parameters
    const sortedParams = Object.keys(vnp_Params)
      .sort()
      .reduce((obj: { [key: string]: string }, key) => {
        obj[key] = vnp_Params[key] as string;
        return obj;
      }, {});

    const signData = new URLSearchParams(sortedParams).toString();
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const calculatedHash = hmac.update(signData).digest('hex');

    if (secureHash === calculatedHash) {
      const orderId = vnp_Params.vnp_TxnRef as string;
      const responseCode = vnp_Params.vnp_ResponseCode as string;

      if (responseCode === '00') {
        // Payment successful, update order status
        await orderService.updatePaymentStatus(orderId, TrangThaiThanhToan.DA_THANH_TOAN);
        res.redirect(`https://milktea-app-fe.vercel.app/order-success?orderId=${orderId}`); // Adjust to your frontend URL
      } else {
        // Payment failed
        res.redirect(`https://milktea-app-fe.vercel.app/order-failure?orderId=${orderId}`);
      }
    } else {
      throw new BadRequestError('Invalid secure hash');
    }
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
