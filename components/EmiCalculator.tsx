"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";

type Props = { listingPrice: number };

export function EmiCalculator({ listingPrice }: Props) {
  const defaultLoan = Math.round(listingPrice * 0.8);
  const [principal, setPrincipal] = useState(defaultLoan);
  const [ratePercent, setRatePercent] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const monthlyRate = ratePercent / 12 / 100;
  const n = tenureYears * 12;
  const emi =
    monthlyRate === 0
      ? principal / n
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  const totalPayable = emi * n;
  const totalInterest = totalPayable - principal;

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-brand-primary mb-4">EMI Calculator</h2>

      <div className="space-y-4">
        {/* Loan amount */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-brand-muted">Loan Amount</label>
            <span className="text-sm font-semibold text-brand-ink">{formatPrice(principal)}</span>
          </div>
          <input
            type="range"
            min={500000}
            max={Math.max(listingPrice, 10000000)}
            step={100000}
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full accent-brand-primary"
          />
          <div className="flex justify-between text-xs text-brand-muted mt-0.5">
            <span>₹5 L</span>
            <span>{formatPrice(Math.max(listingPrice, 10000000))}</span>
          </div>
        </div>

        {/* Interest rate */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-brand-muted">Interest Rate</label>
            <span className="text-sm font-semibold text-brand-ink">{ratePercent.toFixed(1)}% p.a.</span>
          </div>
          <input
            type="range"
            min={6}
            max={14}
            step={0.1}
            value={ratePercent}
            onChange={(e) => setRatePercent(Number(e.target.value))}
            className="w-full accent-brand-primary"
          />
          <div className="flex justify-between text-xs text-brand-muted mt-0.5">
            <span>6%</span><span>14%</span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm text-brand-muted">Loan Tenure</label>
            <span className="text-sm font-semibold text-brand-ink">{tenureYears} years</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className="w-full accent-brand-primary"
          />
          <div className="flex justify-between text-xs text-brand-muted mt-0.5">
            <span>1 yr</span><span>30 yrs</span>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-brand-muted text-sm">Monthly EMI</span>
          <span className="text-2xl font-bold text-brand-primary">{formatPrice(emi)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-brand-light rounded-lg p-3 text-center">
            <div className="text-xs text-brand-muted mb-0.5">Principal</div>
            <div className="text-sm font-semibold text-brand-ink">{formatPrice(principal)}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-xs text-brand-muted mb-0.5">Total Interest</div>
            <div className="text-sm font-semibold text-red-600">{formatPrice(totalInterest)}</div>
          </div>
        </div>
        <p className="text-xs text-brand-muted text-center mt-3">
          Total payable: {formatPrice(totalPayable)} over {tenureYears} years
        </p>
      </div>

      <a
        href="/loans"
        className="btn-secondary w-full text-center mt-3 text-sm"
      >
        Check your eligibility →
      </a>
    </div>
  );
}
