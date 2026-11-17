import {rgb,type PDFDocument,type PDFFont,type PDFImage} from 'pdf-lib';

export function addConfidentialWatermark(pdf:PDFDocument,font:PDFFont,logo:PDFImage|null){
 const label='CONFIDENTIAL';
 const fontSize=29;
 const labelWidth=font.widthOfTextAtSize(label,fontSize);
 const logoSize=logo?.scaleToFit(310,130);

 for(const page of pdf.getPages()){
  const {width,height}=page.getSize();
  if(logo&&logoSize){
   page.drawImage(logo,{...logoSize,x:(width-logoSize.width)/2,y:height*.49,opacity:.09});
  }
  page.drawText(label,{
   x:(width-labelWidth)/2,y:height*.455,size:fontSize,font,
   color:rgb(.08,.32,.32),opacity:.065,
  });
 }
}
