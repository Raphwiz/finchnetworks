'use client';

import {useState} from 'react';
import {money, type Calculation} from '@/shared/models';
import QuoteShopPicker from './QuoteShopPicker';

type Line = {name: string; quantity: number; unitPrice: number|string; labour: boolean};

export default function EstimateStaffItems({role, calculation, project, scope, loading}: {
  role: 'admin'|'technician'; calculation: Calculation|null; project: string; scope: string; loading: boolean;
}) {
  const [extras, setExtras] = useState<Line[]>([]);
  const [error, setError] = useState('');
  const generated = calculation?.lines.map(line => ({
    name: line.name, quantity: line.quantity, unitPrice: line.unitPrice ?? '', labour: false,
  })) ?? [];
  const canAdd = generated.length + extras.length < 40;
  function update(index: number, fields: Partial<Line>) {
    setExtras(current => current.map((line, i) => i === index ? {...line, ...fields} : line));
  }
  function continueToQuotation() {
    const lines = [...generated, ...extras];
    if (!lines.length || lines.length > 40 || extras.some(line => !line.name.trim() ||
      !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 200 ||
      line.unitPrice === '' || !Number.isFinite(Number(line.unitPrice)) ||
      Number(line.unitPrice) < 0 || Number(line.unitPrice) > 100000000)) {
      setError('Enter a description, valid quantity and price for each additional item. A quotation can have up to 40 lines.');
      return;
    }
    const form = document.getElementById('estimate-request');
    const fields = form instanceof HTMLFormElement ? new FormData(form) : new FormData();
    const key = role === 'admin' ? 'finch-admin-estimate-draft' : 'finch-technician-draft';
    try {
      sessionStorage.setItem(key, JSON.stringify({
        name: fields.get('name') || '', phone: fields.get('phone') || '',
        location: fields.get('location') || '', project: project.slice(0,200), scope, lines,
      }));
      location.assign(role === 'admin' ? '/admin/quotations/new' : '/technician');
    } catch {
      setError('Could not carry the equipment list into the quotation. Please allow browser storage and try again.');
    }
  }

  return <section className="form">
    <h3>Additional items</h3>
    {extras.map((line, index) => <div className="receipt-item" key={index}>
      <label>Description<input maxLength={200} value={line.name} onChange={e => update(index, {name:e.target.value})}/></label>
      {line.labour ? <label>Unit<input readOnly value="Service"/></label> :
        <label>Qty<input type="number" min={1} max={200} step={1} value={line.quantity || ''} onChange={e => update(index, {quantity:Number(e.target.value)})}/></label>}
      <label>Unit price (KES)<input type="number" min={0} step=".01" value={line.unitPrice} onChange={e => update(index, {unitPrice:e.target.value})}/></label>
      <button type="button" className="textlink" onClick={() => setExtras(current => current.filter((_, i) => i !== index))}>Remove</button>
    </div>)}
    <div className="quotation-item-actions">
      <button type="button" className="button" disabled={!canAdd} onClick={() => setExtras(current => [...current,{name:'',quantity:1,unitPrice:'',labour:false}])}>Add custom item</button>
      <button type="button" className="button" disabled={!canAdd} onClick={() => setExtras(current => [...current,{name:'Labour',quantity:1,unitPrice:'',labour:true}])}>Add labour</button>
      <QuoteShopPicker disabled={!canAdd} onAdd={line => setExtras(current => [...current,line])}/>
    </div>
    {!!extras.length&&<p>Priced subtotal with additions <strong>{money((calculation?.subtotal||0)+extras.reduce((total,line)=>total+line.quantity*(Number(line.unitPrice)||0),0))}</strong></p>}
    {error&&<p className="error" role="alert">{error}</p>}
    <button type="button" className="button yellow" disabled={loading || (!generated.length&&!extras.length)} onClick={continueToQuotation}>
      {role==='admin'?'Continue to branded quotation':'Continue to quotation for approval'}
    </button>
  </section>;
}
