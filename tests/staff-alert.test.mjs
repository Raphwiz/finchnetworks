import {test} from 'node:test';
import assert from 'node:assert/strict';
import {staffAlertText} from '../shared/notifications.ts';

const alert={kind:'estimate',reference:'FN-ABCDEF12',id:'12345678-1234-1234-1234-123456789abc',name:'Jane Wanjiku',phone:'+254707625129',location:'Nairobi',detail:'2 x CCTV camera'};

test('staff alert includes the reference, contact details and links',()=>{
  const text=staffAlertText(alert,'https://finchnetworksltd.com');
  assert.match(text,/New estimate FN-ABCDEF12/);
  assert.match(text,/Jane Wanjiku · \+254707625129/);
  assert.match(text,/Nairobi/);
  assert.match(text,/2 x CCTV camera/);
  assert.match(text,/Open: https:\/\/finchnetworksltd.com\/track\?id=12345678-1234-1234-1234-123456789abc/);
  assert.match(text,/Admin: https:\/\/finchnetworksltd.com\/admin/);
  assert.equal(text.includes('/api/estimate/'),false);
});

test('payment alert opens the quotation',()=>{
  const text=staffAlertText({...alert,kind:'payment',reference:'QUO-ABCDEF12',detail:'M-Pesa NLJ7RT61SV for KES 15000'},'https://finchnetworksltd.com');
  assert.match(text,/New payment QUO-ABCDEF12/);
  assert.match(text,/Open: https:\/\/finchnetworksltd.com\/quote\?id=12345678-1234-1234-1234-123456789abc/);
});

test('staff alert omits an empty summary line',()=>{
  const text=staffAlertText({...alert,kind:'visit',reference:'BOOK-ABCDEF12',detail:'   '},'https://finchnetworksltd.com');
  assert.match(text,/New site visit BOOK-ABCDEF12/);
  assert.equal(text.includes('   '),false);
});
