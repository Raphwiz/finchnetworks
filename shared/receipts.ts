export const receiptNotes='Goods received in good condition. Warranty applies only as stated and excludes physical damage, misuse, power-related damage, or unauthorized repairs. Returns or exchanges require the original receipt and are subject to Finch Networks Ltd.’s terms and applicable warranty conditions.';
export const paymentMethods=['M-Pesa','Cash','Bank transfer','Cheque','Card','Other'] as const;
export type ReceiptLine={name:string;quantity:number;unitPrice:number;total:number};
export type ReceiptData={id:string;name:string;phone:string;address:string;date:string;method:string;paymentReference:string;authorizedBy:string;sourceId:string;sourceReference:string;notes:string;lines:ReceiptLine[];subtotal:number;discount:number;vat:number;total:number;paid:number;previousPaid:number;balance:number;brand:{phone:string;email:string;area:string}};
export function receiptReference(number:number){return `FN-RCP-${String(number).padStart(6,'0')}`;}
export function amountWords(amount:number):string{
 const small=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];const tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
 const words=(n:number):string=>n<20?small[n]:n<100?tens[Math.floor(n/10)]+(n%10?' '+small[n%10]:''):n<1000?small[Math.floor(n/100)]+' hundred'+(n%100?' and '+words(n%100):''):n<1000000?words(Math.floor(n/1000))+' thousand'+(n%1000?' '+words(n%1000):''):words(Math.floor(n/1000000))+' million'+(n%1000000?' '+words(n%1000000):'');
 const cents=Math.round(amount*100);return `Kenya shillings ${words(Math.floor(cents/100))}${cents%100?' and '+words(cents%100)+' cents':''} only`;
}
export function validateReceipt(b:any){
 if(!b||typeof b!=='object'||Array.isArray(b))throw Error('Check the receipt details.');
 const text=(v:unknown,label:string,max:number,required=false)=>{if(typeof v!=='string'||v.length>max||required&&!v.trim())throw Error(`Check ${label}.`);return label==='notes'?v.trim():v.trim().replace(/\s+/g,' ');};
 const money=(v:unknown,label:string)=>{if(!['string','number'].includes(typeof v)||v===''||!Number.isFinite(Number(v))||Number(v)<0||Number(v)>100000000)throw Error(`Check ${label}.`);return Math.round(Number(v)*100);};
 const id=text(b.id,'receipt ID',36,true);if(!/^[a-f0-9-]{36}$/.test(id))throw Error('Start a new receipt.');
 const date=text(b.date,'payment date',10,true);if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw Error('Choose a valid payment date.');
 if(!paymentMethods.includes(b.method))throw Error('Choose a payment method.');
 if(!Array.isArray(b.lines)||!b.lines.length||b.lines.length>40)throw Error('Add between 1 and 40 items.');
 const lines=b.lines.map((l:any)=>{const name=text(l?.name,'item description',200,true);const quantity=Number(l.quantity);if(!Number.isFinite(quantity)||quantity<=0||quantity>100000||Math.abs(quantity*100-Math.round(quantity*100))>0.00001)throw Error('Use quantities above zero with up to two decimal places.');const unit=money(l.unitPrice,'unit price');return {name,quantity,unitPrice:unit/100,total:Math.round(quantity*unit)/100};});
 const subtotal=lines.reduce((n:number,l:ReceiptLine)=>n+Math.round(l.total*100),0);const discount=money(b.discount,'discount'),vat=money(b.vat,'VAT amount');if(discount>subtotal)throw Error('Discount cannot exceed the subtotal.');const total=subtotal-discount+vat;if(total<=0||total>10000000000)throw Error('Check the receipt total.');
 const paid=money(b.paid,'amount received'),previousPaid=money(b.previousPaid,'previous payments');if(paid<=0)throw Error('Enter the amount actually received for this receipt.');if(previousPaid>total)throw Error('Previous payments cannot exceed the total.');
 const paymentReference=text(b.paymentReference,'payment reference',100,b.method!=='Cash');
 return {id,date,name:text(b.name,'customer name',100,true),phone:text(b.phone??'','phone',40),address:text(b.address??'','address',200),method:b.method as string,paymentReference,authorizedBy:'RAPHAEL GIKUNDI',sourceId:text(b.sourceId??'','linked record',36),notes:text(b.notes??'','notes',1500),lines,subtotal:subtotal/100,discount:discount/100,vat:vat/100,total:total/100,paid:paid/100,previousPaid:previousPaid/100,balance:(total-previousPaid-paid)/100};
}
