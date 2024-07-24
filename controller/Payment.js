const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const merchant_id = "M2204JQXSOPSG";
const salt_key = "2bcfd812-4fb9-49a3-995d-f0bfc658dfcb";

const newPayment = async (req, res) => {
    console.log("Entering newPayment function");

    try {
        const merchantTransactionId = req.body.transactionId;
        console.log("Merchant Transaction ID:", merchantTransactionId);
        console.log("Merchant ID:", merchant_id); // Log merchant ID
        console.log("Salt Key:", salt_key); // Log salt key

        const data = {
            merchantId: merchant_id,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: req.body.MUID,
            amount: req.body.amount,
            redirectUrl: `https://soulmatch.co.in/status/${merchantTransactionId}`,
            redirectMode: 'POST',
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        // console.log("Base64 Encoded Payload:", payloadMain);

        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + salt_key;
        // console.log("String for Hashing:", string);

        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        // console.log("SHA256 Hash:", sha256);

        const checksum = sha256 + '###' + keyIndex;
        // console.log("Checksum:", checksum);

        const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
        const options = {
            method: 'POST',
            url: prod_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                // 'X-MERCHANT-ID': merchant_id // Add the merchant ID header
            },
            data: {
                request: payloadMain
            }
        };

        console.log("Request Options:", options);

        axios.request(options).then(function (response) {
            console.log("Response Data:", response.data);
            if (response.data.success) {
                const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;
                console.log("Redirecting to:", redirectUrl);
                return res.redirect(redirectUrl);
            } else {
                console.log("Payment initiation failed:", response.data);
                res.status(500).send({
                    message: response.data.message,
                    success: false
                });
            }
        })
        .catch(function (error) {
            console.error("Error in payment initiation:", error.response ? error.response.data : error.message);
            res.status(500).send({
                message: error.response ? error.response.data.message : error.message,
                success: false
            });
        });

    } catch (error) {
        console.error("Exception in newPayment function:", error);
        res.status(500).send({
            message: error.message,
            success: false
        });
    }
};

const checkStatus = async (req, res) => {
    console.log("Entering checkStatus function");

    const merchantTransactionId = req.params.transactionId;
    const merchantId = merchant_id;

    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
    console.log("String for Hashing (Status Check):", string);

    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    console.log("SHA256 Hash (Status Check):", sha256);

    const checksum = sha256 + "###" + keyIndex;
    console.log("Checksum (Status Check):", checksum);

    const options = {
        method: 'GET',
        url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': merchantId
        }
    };

    console.log("Request URL (Status Check):", options.url);
    console.log("Request Headers (Status Check):", options.headers);

    const retryCheckStatus = async (retryCount) => {
        try {
            const response = await axios.request(options);
            console.log("Response from Payment Status API:", response.data);

            if (response.data.success === true && response.data.code === 'PAYMENT_SUCCESS') {
                const url = `https://soulmatch.co.in/payment-success`;
                console.log("Redirecting to:", url);
                return res.redirect(url);
            } else if (response.data.code === 'PAYMENT_PENDING' && retryCount < 5) { // Increased retry attempts
                console.log(`Payment is pending. Retrying... Attempt ${retryCount + 1}`);
                setTimeout(() => retryCheckStatus(retryCount + 1), 10000); // Increased delay to 10 seconds
            } else {
                const url = `https://soulmatch.co.in/payment-fail`;
                console.log("Redirecting to:", url);
                return res.redirect(url);
            }
        } catch (error) {
            console.error("Error during payment status check:", error);
            res.status(500).send({
                message: error.message,
                success: false
            });
        }
    };

    retryCheckStatus(0); // Start the first check with retry count 0
};

module.exports = {
    newPayment, checkStatus
};
