"use client";

import { useState } from "react";
import Link from "next/link";

type GateAction = "SCAN" | "OTP" | "WALKIN" | "CAB" | "DELIVERY";

type PassResult = {
  ok: boolean;
  visitorName?: string;
  flatId?: string;
  vehicleNo?: string;
  message: string;
};

export default function GatePage() {
  const [action, setAction] = useState<GateAction>("OTP");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [walkInName, setWalkInName] = useState("");
  const [walkInFlat, setWalkInFlat] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PassResult | null>(null);

  async function verifyToken(t: string) {
    setLoading(true);
    setResult(null);
    try {
      // First fetch the pass, then mark it as used
      const getRes = await fetch(`/api/visitor-passes?token=${t}`);
      const getJson = await getRes.json() as { data?: { visitorName: string; flatId: string; vehicleNo?: string; status: string }; error?: string };

      if (!getRes.ok || !getJson.data) {
        setResult({ ok: false, message: getJson.error ?? "Pass not found" });
        return;
      }
      const pass = getJson.data;
      if (pass.status !== "ACTIVE") {
        setResult({ ok: false, message: `Pass is ${pass.status.toLowerCase()} — entry denied.` });
        return;
      }

      const useRes = await fetch(`/api/visitor-passes?token=${t}&action=use`, { method: "PATCH" });
      if (!useRes.ok) {
        const j = await useRes.json() as { error?: string };
        setResult({ ok: false, message: j.error ?? "Failed to scan pass" });
        return;
      }

      setResult({ ok: true, visitorName: pass.visitorName, flatId: pass.flatId, vehicleNo: pass.vehicleNo, message: "Entry allowed ✓" });
    } catch {
      setResult({ ok: false, message: "Network error — try again" });
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setOtp("");
    setToken("");
    setWalkInName("");
    setWalkInFlat("");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Gate header */}
      <header className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-bold text-lg">🛡️ Gatekeeper</p>
          <p className="text-xs text-gray-400">Tower A Gate · Prestige Lakeside</p>
        </div>
        <Link href="/society" className="text-xs text-gray-400 hover:text-white">Exit Gate Mode</Link>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-sm mx-auto w-full">
        {result ? (
          // Result screen
          <div className={`w-full rounded-2xl p-8 text-center ${result.ok ? "bg-green-600" : "bg-red-600"}`}>
            <p className="text-6xl mb-4">{result.ok ? "✅" : "❌"}</p>
            <p className="text-2xl font-bold mb-2">{result.message}</p>
            {result.ok && (
              <div className="text-sm mt-4 space-y-1 text-green-100">
                <p>Visitor: <strong>{result.visitorName}</strong></p>
                {result.vehicleNo && <p>Vehicle: <strong>{result.vehicleNo}</strong></p>}
              </div>
            )}
            <button onClick={reset} className="mt-6 bg-white text-gray-900 font-bold px-8 py-3 rounded-xl text-sm">
              Next Visitor
            </button>
          </div>
        ) : (
          <>
            {/* Action tabs */}
            <div className="grid grid-cols-3 gap-2 w-full mb-6">
              {([
                ["OTP", "🔢", "Enter OTP"],
                ["WALKIN", "🚶", "Walk-in"],
                ["CAB", "🚖", "Cab/Auto"],
                ["DELIVERY", "📦", "Delivery"],
                ["SCAN", "📷", "Scan QR"]
              ] as [GateAction, string, string][]).map(([a, icon, label]) => (
                <button key={a} onClick={() => { setAction(a); reset(); }}
                  className={`p-3 rounded-xl text-center transition ${action === a ? "bg-brand-primary" : "bg-gray-700 hover:bg-gray-600"}`}>
                  <p className="text-2xl">{icon}</p>
                  <p className="text-xs mt-1">{label}</p>
                </button>
              ))}
            </div>

            {/* OTP entry */}
            {action === "OTP" && (
              <div className="w-full space-y-4">
                <p className="text-center text-gray-300 text-sm">Ask visitor for their 6-digit code</p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  placeholder="_ _ _ _ _ _"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-4xl font-mono tracking-widest bg-gray-800 border-2 border-gray-600 rounded-xl py-5 focus:outline-none focus:border-brand-accent"
                />
                <button
                  onClick={() => {
                    // In production, we'd look up pass by OTP. For now, treat otp as token for demo.
                    verifyToken(otp);
                  }}
                  disabled={otp.length !== 6 || loading}
                  className="btn-primary w-full py-4 text-lg disabled:opacity-50"
                >
                  {loading ? "Verifying…" : "Verify & Allow Entry"}
                </button>
              </div>
            )}

            {/* Scan QR — token input (camera scan would require a library) */}
            {action === "SCAN" && (
              <div className="w-full space-y-4">
                <p className="text-center text-gray-300 text-sm">Paste the pass token from the visitor's link</p>
                <input
                  type="text"
                  placeholder="Pass token (from QR link)"
                  value={token}
                  onChange={(e) => setToken(e.target.value.trim())}
                  className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-accent"
                />
                <button
                  onClick={() => verifyToken(token)}
                  disabled={!token || loading}
                  className="btn-primary w-full py-4 disabled:opacity-50"
                >
                  {loading ? "Scanning…" : "Scan & Verify"}
                </button>
              </div>
            )}

            {/* Walk-in logging */}
            {(action === "WALKIN" || action === "CAB" || action === "DELIVERY") && (
              <div className="w-full space-y-4">
                <p className="text-center text-gray-300 text-sm">
                  {action === "CAB" ? "Log cab/auto entry" : action === "DELIVERY" ? "Log delivery entry" : "Log walk-in visitor"}
                </p>
                <input type="text" placeholder="Visitor name"
                  value={walkInName} onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-accent" />
                <input type="text" placeholder="Going to flat (e.g. A-1204)"
                  value={walkInFlat} onChange={(e) => setWalkInFlat(e.target.value)}
                  className="w-full bg-gray-800 border-2 border-gray-600 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-accent" />
                <button
                  disabled={!walkInName || !walkInFlat || loading}
                  onClick={() => setResult({ ok: true, visitorName: walkInName, flatId: walkInFlat, message: "Walk-in logged ✓" })}
                  className="btn-primary w-full py-4 disabled:opacity-50"
                >
                  Log Entry
                </button>
              </div>
            )}
          </>
        )}

        {/* Panic button */}
        <button className="mt-8 w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-sm transition">
          🚨 PANIC / EMERGENCY
        </button>
      </div>
    </div>
  );
}
