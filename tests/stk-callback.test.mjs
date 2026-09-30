import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readStkCallback} from '../shared/stk.ts';

const checkout='ws_CO_30092026120000abcdef';

test('reads a successful Safaricom payment callback',()=>{
  const parsed=readStkCallback({Body:{stkCallback:{MerchantRequestID:'m1',CheckoutRequestID:checkout,ResultCode:0,ResultDesc:'ok',CallbackMetadata:{Item:[{Name:'Amount',Value:15000},{Name:'MpesaReceiptNumber',Value:'NLJ7RT61SV'},{Name:'PhoneNumber',Value:254712000000}]}}}});
  assert.equal(parsed.checkoutRequestId,checkout);
  assert.equal(parsed.resultCode,0);
  assert.equal(parsed.receipt,'NLJ7RT61SV');
  assert.equal(parsed.amount,15000);
  assert.equal(parsed.phone,'254712000000');
});

test('reads a cancelled callback without treating it as a payment',()=>{
  const parsed=readStkCallback({Body:{stkCallback:{CheckoutRequestID:checkout,ResultCode:1032,ResultDesc:'Cancelled by user'}}});
  assert.equal(parsed.resultCode,1032);
  assert.equal(parsed.receipt,'');
  assert.equal(parsed.amount,0);
});

test('rejects a callback without a checkout id',()=>{
  assert.equal(readStkCallback({Body:{stkCallback:{ResultCode:0}}}),null);
  assert.equal(readStkCallback(null),null);
});
