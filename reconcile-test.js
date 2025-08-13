import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { TimeElement } from 'k6/html';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";


const users = [
    { username: '2061', password: '1qazZAQ!' },
    { username: '00275358', password: '1qazZAQ!' },
    { username: '00275342', password: '1qazZAQ!' }
];

export const options = {
    vus: users.length, 
    iterations: users.length,
    duration: '1s'
  
};

export default function () {
    const user = users[__VU - 1]; // Each VU picks a different user

    // Login and get token
    const loginPayload = [
        'grant_type=password',
        'client_id=brac-token',
        'scope=email',
        `username=${user.username}`,
        `password=${user.password}`,
        'client_secret=oXJvl9JAYBVO9rQ7X3fwdioPBnse9Bfh'
    ].join('&');

    const loginHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'http://delivery.shohoz.com',
        'x-service-id': 'restaurants',
    };

    const loginRes = http.post(
        'https://loginstg.brac.net/realms/brac/protocol/openid-connect/token',
        loginPayload,
        { headers: loginHeaders }
    );

    check(loginRes, {
        'Login successful': (res) => res.status === 200,
        'Token present': (res) => res.json('access_token') !== '',
    });

    const accessToken = loginRes.json('access_token');
    console.log(`User ${user.username} token: ${accessToken}`);

 
                                               // Not Found -> Allocated
    const txnPayload = JSON.stringify({
        TransactionId: '7441184', 
        PIN: '00275358',
        CorrelationId: uuidv4(),
    });

    const txnHeaders = {
        'accept': 'application/json, text/plain, */*',
        'content-type': 'application/json',
        'origin': 'https://stg-wallet.brac.net',
        'referer': 'https://stg-wallet.brac.net/',
        'x-command-type': 'Platform.Wallet.Application.Commands.AllocateFundCommand',
        'x-service-id': 'wallet',
        'Authorization': `Bearer ${accessToken}`,
    };

    const txnRes = http.post(
        'https://stg-mdn-services.brac.net/api/cmd',
        txnPayload,
        { headers: txnHeaders }
    );

    check(txnRes, {
        'Transaction success': (res) => res.status === 202,
    });

    console.log(`User ${user.username} txn status: ${txnRes.status}`);
    console.log(`Response: ${txnRes.body}`);

    sleep(1); 

                                           // Allocated to transferred

     const secondtxnPayload = JSON.stringify({
        TransactionId: '7441184', 
        PIN: '00275358',
        CorrelationId: uuidv4(),
    });

    const secondtxnHeaders = {
         'accept': 'application/json, text/plain, */*',
        'content-type': 'application/json',
        'origin': 'https://stg-wallet.brac.net',
        'referer': 'https://stg-wallet.brac.net/',
        'x-command-type': 'Platform.Wallet.Application.Commands.TransferFundCommand',
        'x-service-id': 'wallet',
        'Authorization': `Bearer ${accessToken}`,
    }

    const secondtxnRes = http.post(
        'https://stg-mdn-services.brac.net/api/cmd',
       secondtxnPayload,
        { headers: secondtxnHeaders }
    )

    check(secondtxnRes, {
        'Transaction success': (res) => res.status === 202,
    });
}

export function handleSummary(data) {
  return {
    "Central_wallet_report.html": htmlReport(data), 
  }
}

