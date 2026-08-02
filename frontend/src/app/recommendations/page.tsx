"use client";

import React, { useState } from "react";
import {
  Calculator,
  Leaf,
  Cpu,
  Trash2,
  DollarSign,
  TrendingDown,
  Search,
  MapPin,
  Phone,
  Home,
  MessageSquare,
  BookOpen,
  Shield,
  HelpCircle
} from "lucide-react";

interface Recycler {
  name: string;
  location: string;
  type: string;
  contact: string;
  districts: string[];
}

export default function RecommendationsCalculator() {
  // Calculator slider states
  const [deviceCount, setDeviceCount] = useState<number>(10);
  const [dailyUsage, setDailyUsage] = useState<number>(8);
  const [lifespanExtension, setLifespanExtension] = useState<number>(2);
  const [deviceType, setDeviceType] = useState<"laptop" | "smartphone">("laptop");

  // Recycler directory search state
  const [searchDistrict, setSearchDistrict] = useState<string>("");

  // Pre-programmed CEA-licensed recyclers & drop-offs in Sri Lanka
  const SL_RECYCLERS: Recycler[] = [
    {
      name: "Green Link (Pvt) Ltd",
      location: "No 415, Kaduwela Road, Koswatta, Thalangama",
      type: "CEA Licensed Hazardous Waste Recycler",
      contact: "+94 11 573 8383 / info@greenlink.lk",
      districts: ["Colombo", "Gampaha", "Kalutara"],
    },
    {
      name: "Ceylon Waste Management (Pvt) Ltd",
      location: "No. 120, Karadiyana Road, Thumbowila, Piliyandala",
      type: "E-Waste Processing & Export Facility",
      contact: "+94 11 437 5375 / cwm@ceylonwaste.com",
      districts: ["Colombo", "Kalutara"],
    },
    {
      name: "Dialog Axiata Take-Back Bins",
      location: "Selected Dialog Arcades (Colombo, Kandy, Galle, Jaffna, Kurunegala)",
      type: "Corporate Take-Back Program (Small electronics, batteries, chargers)",
      contact: "Dial 1777 (Dialog customer care)",
      districts: ["Colombo", "Kandy", "Galle", "Jaffna", "Kurunegala"],
    },
    {
      name: "Mobitel E-Waste Drop-Off Depots",
      location: "Mobitel Main Branches & Telecom Offices islandwide",
      type: "Corporate E-Waste Campaign Partner",
      contact: "+94 11 233 0555",
      districts: ["Colombo", "Kandy", "Galle", "Matara", "Anuradhapura", "Jaffna"],
    },
    {
      name: "University IT E-Waste drives",
      location: "IT Faculty offices (UoM, UoC, UoK, USJ, Sabaragamuwa, Ruhuna)",
      type: "State University Collection Drives (IT students depots)",
      contact: "Check Student Union environmental announcements",
      districts: ["Colombo", "Gampaha", "Kandy", "Ratnapura", "Matara"],
    }
  ];

  // -------------------------------------------------------------
  // CALCULATIONS MODEL (Ref: Literature values for lifecycle assessments)
  // 1. Avoided Manufacturing Footprint:
  //    - Manufacturing a laptop = ~220 kg CO2e
  //    - Manufacturing a smartphone = ~60 kg CO2e
  //    - Buying refurbished or extending lifespan defers this impact.
  // 2. Energy Efficiency Savings:
  //    - Standard laptop draw = ~65W. Energy-Star/Refurb corporate line = ~40W.
  //    - Electricity carbon intensity in SL = ~0.55 kg CO2e per kWh.
  //    - Commercial/Uni electricity tariff in SL = ~45 LKR per kWh.
  // 3. Avoided E-Waste:
  //    - Laptop = ~2.2 kg. Smartphone = ~0.18 kg.
  // -------------------------------------------------------------
  
  const mfgCarbonPerUnit = deviceType === "laptop" ? 220 : 60;
  const unitWeightKg = deviceType === "laptop" ? 2.2 : 0.18;
  const powerDiffWatts = deviceType === "laptop" ? 25 : 5; // Saved by choosing efficient energy settings
  const SL_CO2_INTENSITY_KWH = 0.55;
  const SL_TARIFF_LKR_KWH = 45;
  const LKR_PER_DEVICE_DEFERRED_PURCHASE = deviceType === "laptop" ? 140000 : 70000;

  // Calculation outputs
  // Total Manufacturing Carbon Saved (due to deferred replacement during extension years)
  // Fraction of deferred replacement: lifespanExtension / normalLife (approx 4 years)
  const deferredMfgRatio = lifespanExtension / 4;
  const carbonSavedMfg = Math.round(deviceCount * mfgCarbonPerUnit * deferredMfgRatio);
  
  // Annual Operational Energy Carbon Saved
  const annualEnergySavedKwh = (deviceCount * powerDiffWatts * dailyUsage * 365) / 1000;
  const carbonSavedEnergy = Math.round(annualEnergySavedKwh * SL_CO2_INTENSITY_KWH * lifespanExtension);
  
  const totalCarbonOffsetKg = carbonSavedMfg + carbonSavedEnergy;
  const totalEwastePreventedKg = Math.round(deviceCount * unitWeightKg * (lifespanExtension / 4) * 10) / 10;
  
  const energyBillSavingsLkr = Math.round(annualEnergySavedKwh * SL_TARIFF_LKR_KWH * lifespanExtension);
  const deferredPurchaseSavingsLkr = Math.round(deviceCount * LKR_PER_DEVICE_DEFERRED_PURCHASE * (lifespanExtension / 4));
  const totalFinancialSavingsLkr = energyBillSavingsLkr + deferredPurchaseSavingsLkr;

  const filteredRecyclers = SL_RECYCLERS.filter(
    (rec) =>
      !searchDistrict ||
      rec.districts.some((d) => d.toLowerCase().includes(searchDistrict.toLowerCase()))
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-app)", color: "var(--text-main)" }}>
      {/* Navbar Header */}
      <header className="top-header">
        <div className="header-left">
          <div className="brand" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/"}>
            <Calculator size={20} style={{ color: "var(--primary)" }} />
            <span className="brand-title">Savings & Recommendations</span>
          </div>
        </div>
        
        <nav style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <a href="/" style={{ color: "var(--text-sub)", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <Home size={14} /> Home
          </a>
          <a href="/chat" style={{ color: "var(--text-sub)", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <MessageSquare size={14} /> Chat
          </a>
          <a href="/explorer" style={{ color: "var(--text-sub)", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <BookOpen size={14} /> Explorer
          </a>
          <a href="/admin" style={{ color: "var(--text-sub)", fontSize: "0.85rem", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <Shield size={14} /> Admin
          </a>
        </nav>
        
        <div className="header-right">
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--accent-green-text)", backgroundColor: "var(--accent-green)", padding: "6px 12px", borderRadius: "20px", fontWeight: 600 }}>
            <Leaf size={12} fill="currentColor" /> SL Tariff Model v2026
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div style={{ flex: 1, padding: "40px 24px", maxWidth: "1100px", margin: "auto", width: "100%", display: "flex", flexDirection: "column", gap: "36px" }}>
        
        {/* 1. Side-by-Side Laptop Comparison Table */}
        <section style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-light)", padding: "28px", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Cpu size={20} style={{ color: "var(--primary)" }} /> Laptops Sustainability Matrix
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-sub)", marginBottom: "20px" }}>
            Compare specifications for selecting IT undergraduate laptops based on environmental lifecycle parameters:
          </p>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-light)", color: "var(--text-muted)" }}>
                  <th style={{ padding: "12px 8px" }}>Laptop Tier</th>
                  <th style={{ padding: "12px 8px" }}>CO2e Footprint</th>
                  <th style={{ padding: "12px 8px" }}>Avg Lifespan</th>
                  <th style={{ padding: "12px 8px" }}>iFixit Score</th>
                  <th style={{ padding: "12px 8px" }}>Upgradability</th>
                  <th style={{ padding: "12px 8px" }}>Recommendation Focus</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "12px 8px", fontWeight: 600 }}>Standard Consumer Laptop</td>
                  <td style={{ padding: "12px 8px" }}>~350 kg CO2e</td>
                  <td style={{ padding: "12px 8px" }}>3 - 4 Years</td>
                  <td style={{ padding: "12px 8px", color: "#ef4444", fontWeight: 600 }}>3/10 (Low)</td>
                  <td style={{ padding: "12px 8px" }}>Soldered RAM & SSD</td>
                  <td style={{ padding: "12px 8px", color: "var(--text-muted)" }}>Not recommended due to planned obsolescence.</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "12px 8px", fontWeight: 600 }}>Refurbished Enterprise Laptop</td>
                  <td style={{ padding: "12px 8px", color: "var(--accent-green-text)" }}>~70 kg CO2e (80% lower)</td>
                  <td style={{ padding: "12px 8px" }}>5 - 7 Years (Total)</td>
                  <td style={{ padding: "12px 8px", color: "var(--accent-green-text)", fontWeight: 600 }}>7/10 to 8/10</td>
                  <td style={{ padding: "12px 8px" }}>Modular parts available</td>
                  <td style={{ padding: "12px 8px", color: "var(--accent-green-text)", fontWeight: 600 }}>Highly recommended for budget-restricted IT students.</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "12px 8px", fontWeight: 600 }}>Modular Sustainable Laptop</td>
                  <td style={{ padding: "12px 8px" }}>~240 kg CO2e</td>
                  <td style={{ padding: "12px 8px" }}>8 - 10 Years</td>
                  <td style={{ padding: "12px 8px", color: "var(--accent-green-text)", fontWeight: 600 }}>10/10 (Framework)</td>
                  <td style={{ padding: "12px 8px" }}>100% swappable mainboard</td>
                  <td style={{ padding: "12px 8px", color: "var(--primary)", fontWeight: 600 }}>Gold standard for modular lifecycle upgrades.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Interactive Calculator Section */}
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          
          {/* Controls Sliders */}
          <div style={{ flex: 1, minWidth: "300px", backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-light)", padding: "28px", borderRadius: "16px", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <Calculator size={18} style={{ color: "var(--primary)" }} /> Configuration Sliders
            </h3>

            {/* Device Type Select */}
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Device Type</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className={deviceType === "laptop" ? "btn-primary" : "btn-secondary"}
                  style={{ flex: 1, padding: "8px" }}
                  onClick={() => setDeviceType("laptop")}
                >
                  Laptops
                </button>
                <button
                  className={deviceType === "smartphone" ? "btn-primary" : "btn-secondary"}
                  style={{ flex: 1, padding: "8px" }}
                  onClick={() => setDeviceType("smartphone")}
                >
                  Smartphones
                </button>
              </div>
            </div>

            {/* Slider 1: Device count */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>
                <span>Number of Devices</span>
                <span style={{ color: "var(--primary)" }}>{deviceCount} units</span>
              </div>
              <input
                type="range"
                min="1"
                max="250"
                value={deviceCount}
                onChange={(e) => setDeviceCount(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
            </div>

            {/* Slider 2: Daily use hours */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>
                <span>Daily Active Usage</span>
                <span style={{ color: "var(--primary)" }}>{dailyUsage} hours</span>
              </div>
              <input
                type="range"
                min="1"
                max="16"
                value={dailyUsage}
                onChange={(e) => setDailyUsage(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
            </div>

            {/* Slider 3: Lifespan Extension */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>
                <span>Target Life Extension</span>
                <span style={{ color: "var(--primary)" }}>{lifespanExtension} years</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={lifespanExtension}
                onChange={(e) => setLifespanExtension(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
            </div>
          </div>

          {/* Impact Results Dashboard */}
          <div style={{ flex: 1.2, minWidth: "340px", backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-light)", padding: "28px", borderRadius: "16px", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Leaf size={18} style={{ color: "var(--primary)" }} /> Computed Ecological Savings
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Metric 1: Carbon Offset */}
                <div style={{ padding: "16px", backgroundColor: "var(--bg-app)", borderRadius: "12px", borderLeft: "4px solid var(--primary)" }}>
                  <span style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>Carbon Offset</span>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary)", marginTop: "4px" }}>
                    {totalCarbonOffsetKg.toLocaleString()} <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>kg CO₂e</span>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                    Equivalent to planting {Math.round(totalCarbonOffsetKg / 22)} trees.
                  </span>
                </div>

                {/* Metric 2: Avoided E-Waste */}
                <div style={{ padding: "16px", backgroundColor: "var(--bg-app)", borderRadius: "12px", borderLeft: "4px solid #ef4444" }}>
                  <span style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>E-Waste Prevented</span>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#ef4444", marginTop: "4px" }}>
                    {totalEwastePreventedKg.toLocaleString()} <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>kg</span>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                    Avoided landfill heavy metal leach.
                  </span>
                </div>

                {/* Metric 3: Electricity Saved */}
                <div style={{ padding: "16px", backgroundColor: "var(--bg-app)", borderRadius: "12px", borderLeft: "4px solid #eab308" }}>
                  <span style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>Power Bill Saved</span>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#eab308", marginTop: "4px" }}>
                    Rs. {energyBillSavingsLkr.toLocaleString()}
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                    From operational efficiency.
                  </span>
                </div>

                {/* Metric 4: Deferred procurement */}
                <div style={{ padding: "16px", backgroundColor: "var(--bg-app)", borderRadius: "12px", borderLeft: "4px solid #3b82f6" }}>
                  <span style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>Capital Retained</span>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#3b82f6", marginTop: "4px" }}>
                    Rs. {deferredPurchaseSavingsLkr.toLocaleString()}
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                    Deferred replacement budget.
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-sub)", display: "flex", alignItems: "center", gap: "6px" }}>
                <TrendingDown size={16} style={{ color: "var(--primary)" }} /> Total Financial Return:
              </span>
              <span style={{ fontSize: "1.2rem", fontWeight: 850, color: "var(--primary)" }}>
                Rs. {totalFinancialSavingsLkr.toLocaleString()}
              </span>
            </div>
          </div>

        </div>

        {/* 3. Sri Lankan E-Waste Disposal Directory */}
        <section style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-light)", padding: "28px", borderRadius: "16px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={20} style={{ color: "var(--primary)" }} /> CEA-Licensed E-Waste Drop-Off Directory
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-sub)", marginTop: "4px" }}>
                Safely recycle old batteries, circuit boards, and screens using licensed Sri Lankan operators:
              </p>
            </div>

            {/* Filter Input */}
            <div className="chat-input-wrapper" style={{ padding: "8px 12px", width: "240px" }}>
              <Search size={14} style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Filter by district..."
                style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "0.8rem", color: "var(--text-main)" }}
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {filteredRecyclers.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>
                No drop-off centers found for district: "{searchDistrict}"
              </div>
            ) : (
              filteredRecyclers.map((rec) => (
                <div
                  key={rec.name}
                  style={{
                    backgroundColor: "var(--bg-app)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "var(--primary)", fontWeight: 700, backgroundColor: "var(--primary-glow)", padding: "2px 8px", borderRadius: "10px" }}>
                      {rec.type}
                    </span>
                    <h4 style={{ fontWeight: 700, fontSize: "0.95rem", marginTop: "8px", color: "var(--text-main)" }}>
                      {rec.name}
                    </h4>
                    <p style={{ fontSize: "0.775rem", color: "var(--text-sub)", marginTop: "6px", display: "flex", alignItems: "flex-start", gap: "4px" }}>
                      <MapPin size={12} style={{ marginTop: "2px", flexShrink: 0 }} /> {rec.location}
                    </p>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-sub)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Phone size={12} /> <span>{rec.contact}</span>
                    </div>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                      {rec.districts.map((d) => (
                        <span key={d} style={{ fontSize: "0.65rem", backgroundColor: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-muted)", padding: "1px 6px", borderRadius: "4px" }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
