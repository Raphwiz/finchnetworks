import type {QuotePaymentMode} from '@/shared/commerce';

export default function QuotePaymentSelect({mode,onChange}: {
  mode: QuotePaymentMode;
  onChange: (mode: QuotePaymentMode) => void;
}) {
  return (
    <label>
      Payment on acceptance
      <select value={mode} onChange={event=>onChange(event.currentTarget.value==='full'?'full':'deposit')}>
        <option value="deposit">80% deposit, balance on completion</option>
        <option value="full">Full payment upfront</option>
      </select>
    </label>
  );
}
