export type StkCallback={checkoutRequestId:string;resultCode:number;receipt:string;amount:number;phone:string};

export function readStkCallback(body:unknown):StkCallback|null{
  if(!body||typeof body!=='object')return null;
  const stk=(body as {Body?:{stkCallback?:unknown}}).Body?.stkCallback;
  if(!stk||typeof stk!=='object')return null;
  const callback=stk as {CheckoutRequestID?:unknown;ResultCode?:unknown;CallbackMetadata?:{Item?:unknown}};
  const checkoutRequestId=String(callback.CheckoutRequestID||'');
  if(!/^[A-Za-z0-9_.-]{10,80}$/.test(checkoutRequestId))return null;
  const resultCode=Number(callback.ResultCode);
  if(!Number.isInteger(resultCode))return null;
  const items=Array.isArray(callback.CallbackMetadata?.Item)?callback.CallbackMetadata.Item:[];
  const value=(name:string)=>{const found=items.find(item=>item&&typeof item==='object'&&(item as {Name?:unknown}).Name===name) as {Value?:unknown}|undefined;return found?.Value;};
  const amount=Number(value('Amount'));
  const receipt=String(value('MpesaReceiptNumber')||'');
  const phone=String(value('PhoneNumber')||'');
  return {checkoutRequestId,resultCode,receipt:/^[A-Z0-9]{6,20}$/.test(receipt)?receipt:'',amount:Number.isInteger(amount)&&amount>0?amount:0,phone:/^254\d{9}$/.test(phone)?phone:''};
}
