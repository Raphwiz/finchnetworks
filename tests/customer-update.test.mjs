import {test} from 'node:test';
import assert from 'node:assert/strict';
import {customerUpdateText} from '../shared/notifications.ts';

const origin='https://finchnetworksltd.com';
const id='12345678-1234-1234-1234-123456789abc';

test('shop order update links the signed-in account',()=>{
  const text=customerUpdateText({kind:'order',id,status:'deposit-paid',reference:'ORD-ABCDEF12',name:'Jane Wanjiku',customerMessage:'We received the deposit.'},origin);
  assert.match(text,/Hello Jane Wanjiku,/);
  assert.match(text,/Your Finch shop order ORD-ABCDEF12 is now deposit paid\./);
  assert.match(text,/We received the deposit\./);
  assert.match(text,/View your update: https:\/\/finchnetworksltd.com\/account\/order\?id=12345678-1234-1234-1234-123456789abc/);
  assert.equal(text.includes('/admin'),false);
});

test('accepted quotation links the quotation page',()=>{
  const text=customerUpdateText({kind:'quote',id,status:'accepted',reference:'QUO-ABCDEF12',name:'Jane Wanjiku'},origin);
  assert.match(text,/Your Finch quotation QUO-ABCDEF12 is now accepted\./);
  assert.match(text,/\/quote\?id=12345678-1234-1234-1234-123456789abc/);
});

test('confirmed visit includes the appointment',()=>{
  const text=customerUpdateText({kind:'booking',id,status:'confirmed',name:'Jane Wanjiku',confirmedDate:'2026-10-02',confirmedTime:'Morning'},origin);
  assert.match(text,/Your Finch site visit BOOK-12345678 is now confirmed\./);
  assert.match(text,/Visit: 2026-10-02, Morning \(Kenya time\)\./);
  assert.match(text,/\/track\?id=12345678-1234-1234-1234-123456789abc/);
});
