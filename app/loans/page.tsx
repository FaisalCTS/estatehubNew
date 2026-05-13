import Link from "next/link";
import { formatPrice } from "@/lib/format";

const BANKS = [
  { name: "HDFC Bank", rate: 8.45, processing: 0.5, maxTenure: 30, logo: "🏦" },
  { name: "SBI",       rate: 8.50, processing: 0,   maxTenure: 30, logo: "🏦" },
  { name: "ICICI Bank",rate: 8.65, processing: 0.5, maxTenure: 30, logo: "🏦" },
  { name: "Axis Bank", rate: 8.75, processing: 1.0, maxTenure: 25, logo: "🏦" },
  { name: "Kotak",     rate: 8.85, processing: 0.5, maxTenure: 20, logo: "🏦" },
  { name: "LIC HFL",   rate: 8.40, processing: 0,   maxTenure: 30, logo: "🏦" }
];

function calcEmi(principal: number, rate: number, years: number): number {
  const r = rate / 12 / 100;
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

const LOAN = 10000000; // ₹1 Cr demo
const TENURE = 20;

export default function LoansPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-primary mb-2">Home Loans</h1>
      <p className="text-brand-muted text-sm mb-8">
        Compare rates from 15+ banks. Instant eligibility check. No spam calls.
      </p>

      {/* Eligibility banner */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-accent text-white rounded-xl p-6 mb-8">
        <p className="text-sm font-medium text-blue-100 mb-1">Quick eligibility estimate</p>
        <p className="text-3xl font-bold mb-3">You may qualify for up to ₹1.10 Cr</p>
        <p className="text-blue-100 text-sm mb-4">Based on typical IT professional salary in Bengaluru · Soft credit pull — no CIBIL impact</p>
        <button className="bg-white text-brand-primary font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-brand-light transition">
          Check exact eligibility →
        </button>
      </div>

      {/* Rate comparison */}
      <h2 className="text-lg font-semibold text-brand-primary mb-4">
        Live rates — ₹1 Cr loan · {TENURE} years
      </h2>
      <div className="space-y-3 mb-8">
        {BANKS.sort((a, b) => a.rate - b.rate).map((bank) => {
          const emi = calcEmi(LOAN, bank.rate, TENURE);
          return (
            <div key={bank.name} className="card flex items-center gap-4">
              <span className="text-2xl">{bank.logo}</span>
              <div className="flex-1">
                <p className="font-semibold text-brand-ink">{bank.name}</p>
                <p className="text-xs text-brand-muted">
                  Processing fee: {bank.processing === 0 ? "Nil" : `${bank.processing}%`} ·
                  Max tenure: {bank.maxTenure} yrs
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-brand-primary">{bank.rate}%</p>
                <p className="text-xs text-brand-muted">p.a.</p>
              </div>
              <div className="text-center hidden md:block">
                <p className="font-semibold text-brand-ink">{formatPrice(emi)}</p>
                <p className="text-xs text-brand-muted">EMI/mo</p>
              </div>
              <button className="btn-primary text-xs px-4 py-2">Apply</button>
            </div>
          );
        })}
      </div>

      {/* Checklist */}
      <div className="card">
        <h2 className="font-semibold text-brand-primary mb-4">Documents needed</h2>
        <ul className="grid md:grid-cols-2 gap-2 text-sm text-brand-muted">
          {[
            "PAN card", "Aadhaar card", "Last 3 months salary slips",
            "6 months bank statement", "Form 16 / ITR (2 years)",
            "Property documents (sale agreement)",
            "Employment letter / offer letter",
            "Passport-size photos"
          ].map((doc) => (
            <li key={doc} className="flex items-center gap-2">
              <span className="text-green-500">✓</span> {doc}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
