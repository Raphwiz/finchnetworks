import {drawLetterhead} from './letterhead';
import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {amountWords,invoiceLocation,invoicePaymentDetails,type InvoiceData,type ReceiptData} from '../shared/receipts';
type DocumentMetadata={reference:string;preview?:boolean;voidReason?:string};
const navy=rgb(17/255,56/255,91/255),blue=rgb(23/255,105/255,170/255),gold=rgb(.94,.68,.08),pale=rgb(.918,.949,.973),white=rgb(1,1,1),grey=rgb(.72,.78,.84);
const clean=(v:unknown)=>String(v??'').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[\u2013\u2014]/g,'-').replace(/[^\x20-\xff\n]/g,'');
const cash=(v:number)=>v.toLocaleString('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2});
export function createWorkReceiptPdf(d:ReceiptData&DocumentMetadata){return createDocumentPdf(d);}
export function createInvoicePdf(d:InvoiceData&DocumentMetadata){return createDocumentPdf(d);}

async function createDocumentPdf(d:(ReceiptData|InvoiceData)&DocumentMetadata){
 const invoice='dueDate' in d;
 const title=invoice?'INVOICE':'OFFICIAL RECEIPT';
 const pdf=await PDFDocument.create();const regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 const logo=await pdf.embedPng(await readFile(join(process.cwd(),'public/finch-logo.png')));const stamp=await pdf.embedPng(await readFile(join(process.cwd(),'seed/receipt-stamp.png')));
 const left=42,right=570,width=528;let page=pdf.addPage([612,792]),y=0;
 const text=(s:string,x:number,top:number,size=9,strong=false,color=navy)=>page.drawText(clean(s),{x,y:top,size,font:strong?bold:regular,color});
 const wrap=(s:string,max:number,size=9,strong=false)=>{const font=strong?bold:regular;const result:string[]=[];for(const block of clean(s).split('\n')){let line='';for(const word of block.split(/\s+/)){if(font.widthOfTextAtSize(word,size)>max){if(line){result.push(line);line='';}for(const ch of word){if(font.widthOfTextAtSize(line+ch,size)>max){result.push(line);line='';}line+=ch;}}else if(font.widthOfTextAtSize(line?line+' '+word:word,size)<=max)line=line?line+' '+word:word;else{result.push(line);line=word;}}result.push(line);}return result;};
 const header=()=>{y=drawLetterhead(page,regular,bold,logo,invoice?{...d.brand,area:invoiceLocation}:d.brand,left,right);text(title,left,y,18,true);y-=24;};
 const need=(h:number)=>{if(y-h<62){page=pdf.addPage([612,792]);header();text(d.reference+' (continued)',left,y,9,true);y-=22;}};
 const para=(s:string,size=9)=>{for(const line of wrap(s,width,size)){need(size+5);text(line,left,y,size);y-=size+4;}y-=5;};
 const heading=(s:string)=>{need(26);text(s,left,y,10,true);y-=18;};
 header();
 if(d.preview||d.voidReason){text(d.preview?`PREVIEW - NOT A VALID ${invoice?'INVOICE':'RECEIPT'}`:`VOID ${invoice?'INVOICE':'RECEIPT'}`,left,y,13,true,rgb(.75,.12,.12));y-=23;}
 const pairs=invoice
  ? [['Invoice No.',d.reference,'Issue Date',d.date],['Bill To',d.name,'Phone',d.phone],['Billing Address',d.address,'Due Date',d.dueDate]]
  : [['Receipt No.',d.reference,'Date',d.date],['Received From',d.name,'Phone',d.phone],['Address',d.address,'Payment',d.method]];
 for(const row of pairs){const vals=[wrap(row[1],168,8),wrap(row[3],168,8)];const h=Math.max(25,...vals.map(v=>v.length*11+10));need(h);for(let j=0;j<2;j++){const x=left+j*264;page.drawRectangle({x,y:y-h+9,width:88,height:h,color:pale,borderColor:grey,borderWidth:.5});page.drawRectangle({x:x+88,y:y-h+9,width:176,height:h,borderColor:grey,borderWidth:.5});text(row[j*2],x+5,y-4,8,true);vals[j].forEach((s,i)=>text(s,x+93,y-4-i*11,8));}y-=h;}
 y-=15;if(d.sourceReference)para('Related quotation / order: '+d.sourceReference,8);
 heading(invoice?'GOODS / SERVICES BILLED':'GOODS / SERVICES PURCHASED');
 const cols=[28,252,52,94,102];
 const tableHeader=()=>{need(25);page.drawRectangle({x:left,y:y-8,width,height:22,color:navy});let x=left;['No.','Description of Goods / Services','Qty','Unit Price (KES)','Amount (KES)'].forEach((s,i)=>{text(s,x+4,y,8,true,white);x+=cols[i];});y-=24;};tableHeader();
 const displayLines=d.lines;
 displayLines.forEach((l,index)=>{const names=wrap(l?.name||'',cols[1]-10,9);const height=l?Math.max(20,names.length*11+7):16;if(y-height<62){need(height);tableHeader();}let x=left;for(const w of cols){page.drawRectangle({x,y:y-height+11,width:w,height,borderWidth:.5,borderColor:grey,...(index%2?{color:rgb(.97,.98,.99)}:{})});x+=w;}text(String(index+1),left+6,y,9);if(l){names.forEach((s,i)=>text(s,left+cols[0]+5,y-i*12));text(/\blabou?r\b/i.test(l.name)?'Service':String(l.quantity),left+cols[0]+cols[1]+3,y,8);const a=cash(l.unitPrice),b=cash(l.total);text(a,right-cols[4]-6-regular.widthOfTextAtSize(a,9),y);text(b,right-6-regular.widthOfTextAtSize(b,9),y);}y-=height;});y-=14;
 const paymentNotes=invoice?[`Amount Due in Words: ${amountWords(d.balance)}`]:[`Payment Reference: ${d.paymentReference||'Cash'}`,`Amount in Words: ${amountWords(d.paid)}`];
 const notes=[...paymentNotes,d.notes?`Notes: ${d.notes}`:'',d.voidReason?`VOID REASON: ${d.voidReason}`:''].filter(Boolean).flatMap(s=>[...wrap(s,273,8),'']);
 const showPayment=invoice&&d.previousUnpaidBalance!==undefined&&!d.voidReason;
 const paymentHeight=showPayment?70:0;
 const separateNotes=notes.length*10+paymentHeight>420;
 if(separateNotes){for(const line of notes){need(12);text(line,left,y,8);y-=10;}y-=12;}
 const notesHeight=separateNotes?0:notes.length*10;
 const blockHeight=Math.max(133,notesHeight+paymentHeight);
 need(blockHeight+15);
 const top=y;
 if(!separateNotes)notes.forEach((line,i)=>text(line,left,top-i*10,8));
 const tx=330,tw=240;
 if(showPayment){
  const paymentTop=top-notesHeight;
  const boxWidth=tx-left-12;
  const ink=rgb(.42,.25,.07);
  page.drawRectangle({x:left,y:paymentTop-63,width:boxWidth,height:67,color:rgb(1,.97,.89)});
  page.drawRectangle({x:left,y:paymentTop-63,width:3,height:67,color:gold});
  text('M-Pesa payment details',left+10,paymentTop-8,9,true,ink);
  text(`Please pay ${invoicePaymentDetails.recipient} via M-Pesa PayBill.`,left+10,paymentTop-21,8,true,ink);
  text(`PayBill: ${invoicePaymentDetails.paybill}   |   Account number: ${invoicePaymentDetails.account}`,left+10,paymentTop-34,9,true,ink);
  wrap('After payment, please share your M-Pesa confirmation and invoice number.',boxWidth-20,8,true)
   .forEach((line,i)=>text(line,left+10,paymentTop-47-i*9,8,true,ink));
 }
 const totals:[string,number][]=[['Subtotal',d.subtotal],['Discount',d.discount],['VAT',d.vat],['GRAND TOTAL',d.total],['Previously paid',d.previousPaid]];
 if(invoice){
  if(d.previousUnpaidBalance!==undefined)totals.push(['Previous unpaid balance',d.previousUnpaidBalance]);
  totals.push(['AMOUNT DUE',d.balance]);
 }
 else totals.push(['Amount Paid',d.paid],[d.balance<0?'Credit / overpayment':'Balance',Math.abs(d.balance)]);
 totals.forEach(([label,value])=>{const total=label==='GRAND TOTAL'||label==='AMOUNT DUE';page.drawRectangle({x:tx,y:y-7,width:tw,height:19,color:total?blue:pale});text(label,tx+6,y,9,true,total?white:navy);const s=cash(value);text(s,right-6-bold.widthOfTextAtSize(s,9),y,9,true,total?white:navy);y-=19;});y=top-blockHeight-16;
 need(130);text('Company Stamp',419,y,9,true);const size=stamp.scaleToFit(104,80);if(!d.voidReason)page.drawImage(stamp,{x:419,y:y-90,...size});text('Prepared / Authorized By',left,y,10,true);text('Name: RAPHAEL GIKUNDI',left,y-20,9);text('Signature: Electronically signed by FINCH NETWORKS LTD',left,y-39,8);text('Date: '+d.date.split('-').reverse().join('/'),left,y-58,9);y-=112;
 for(const [message,size] of [['Thank you for choosing Finch Networks Ltd.',10],[invoice?'':'This receipt confirms payment for the goods/services listed above. Keep it for warranty and reference purposes.',8]] as const){if(!message)continue;for(const line of wrap(message,width,size)){need(size+5);text(line,left+(width-regular.widthOfTextAtSize(line,size))/2,y,size);y-=size+4;}y-=5;}
 pdf.getPages().forEach((p,i)=>{p.drawLine({start:{x:left,y:43},end:{x:right,y:43},color:gold,thickness:1});const footer=clean(`${d.reference}  |  Finch Networks Ltd  |  Page ${i+1} of ${pdf.getPageCount()}`);p.drawText(footer,{x:left+(width-regular.widthOfTextAtSize(footer,8))/2,y:28,size:8,font:regular,color:navy});});pdf.setTitle(d.reference);pdf.setAuthor('Finch Networks Ltd');return pdf.save();
}
