import { useState } from "react";

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: "📸", charLimit: 2200 },
  { id: "tiktok", label: "TikTok", icon: "🎵", charLimit: 300 },
  { id: "facebook", label: "Facebook", icon: "👥", charLimit: 500 },
  { id: "youtube", label: "YouTube", icon: "▶️", charLimit: 400 },
  { id: "linkedin", label: "LinkedIn", icon: "💼", charLimit: 600 },
  { id: "blog", label: "Blog Post", icon: "✍️", charLimit: null },
];

const CONTENT_TYPES = [
  { id: "property_showcase", label: "Property Showcase" },
  { id: "experience", label: "Guest Experience" },
  { id: "destination", label: "Destination Guide" },
  { id: "seasonal", label: "Seasonal Highlight" },
];

const TONES = [
  { id: "aspirational", label: "Aspirational" },
  { id: "intimate", label: "Intimate & Personal" },
  { id: "editorial", label: "Editorial" },
  { id: "adventurous", label: "Adventurous" },
];

function Spinner() {
  return (
    <div style={{
      width: 20, height: 20, border: "2px solid rgba(212,175,55,0.3)",
      borderTop: "2px solid #d4af37", borderRadius: "50%",
      animation: "spin 0.8s linear infinite", display: "inline-block"
    }} />
  );
}

export default function LuxuryContentGenerator() {
  const [form, setForm] = useState({
    destination: "",
    property: "",
    contentType: "property_showcase",
    tone: "aspirational",
    highlights: "",
    selectedPlatforms: ["instagram", "blog"],
    days: 5,
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeDay, setActiveDay] = useState(0);

  const toggle = (arr, val) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const handleGenerate = async () => {
    if (!form.destination.trim()) {
      setError("Please enter a destination.");
      return;
    }
    setError("");
    setLoading(true);
    setResults(null);

    const platformList = PLATFORMS.filter((p) =>
      form.selectedPlatforms.includes(p.id)
    );
    const contentTypeLabel = CONTENT_TYPES.find((c) => c.id === form.contentType)?.label;
    const toneLabel = TONES.find((t) => t.id === form.tone)?.label;

    const systemPrompt = `You are an elite luxury travel content strategist who creates aspirational, high-converting content for premium travel brands. Your writing is evocative, sophisticated, and deeply sensory—never generic. You understand the psychology of luxury travelers: they seek transformation, exclusivity, and curated perfection.

IMPORTANT: Return ONLY a valid JSON object. No markdown, no backticks, no explanation. Just raw JSON.`;

    const userPrompt = `Create a ${form.days}-day luxury travel content calendar for:
- Destination: ${form.destination}
${form.property ? `- Property/Hotel: ${form.property}` : ""}
- Content Type: ${contentTypeLabel}
- Tone: ${toneLabel}
${form.highlights ? `- Key Highlights/Features: ${form.highlights}` : ""}

Generate content for these platforms: ${platformList.map((p) => p.label).join(", ")}

Return this exact JSON structure:
{
  "destination": "${form.destination}",
  "week_theme": "string — an evocative overarching theme for the week",
  "days": [
    {
      "day": 1,
      "date_label": "Day 1 — [evocative day title]",
      "focus": "short sentence about today's content angle",
      "platforms": {
        ${platformList.map((p) => `"${p.id}": {
          "caption": "full caption text${p.charLimit ? ` (max ${p.charLimit} chars)` : ""}",
          "hashtags": ${p.id === "instagram" ? '"space-separated hashtags (15-20 luxury travel hashtags)"' : '""'},
          "hook": "opening hook line only"
        }`).join(",\n        ")}
      }
    }
  ]
}

Make each day feel distinctly different. Use rich sensory language. For blog posts, write 250-350 words of immersive, magazine-quality prose. Instagram captions should be poetic and evocative (8-15 lines). TikTok/YouTube should open with a powerful hook. LinkedIn should blend aspiration with professional travel insights.`;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map((b) => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResults(parsed);
      setActiveDay(0);
    } catch (err) {
      setError("Something went wrong generating content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const activeDayData = results?.days?.[activeDay];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#e8dcc8",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .card { animation: fadeIn 0.5s ease forwards; }
        .btn-primary {
          background: linear-gradient(135deg, #c9a84c, #d4af37, #b8962e);
          color: #0a0a0a;
          border: none;
          padding: 14px 36px;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .platform-toggle {
          padding: 8px 16px;
          border: 1px solid #2a2a2a;
          background: transparent;
          color: #9a8a6a;
          cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          letter-spacing: 1px;
          transition: all 0.2s;
        }
        .platform-toggle.active {
          border-color: #d4af37;
          color: #d4af37;
          background: rgba(212,175,55,0.08);
        }
        .day-tab {
          padding: 10px 20px;
          border: none;
          background: transparent;
          color: #5a5040;
          cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          letter-spacing: 1px;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .day-tab.active {
          color: #d4af37;
          border-bottom-color: #d4af37;
        }
        .copy-btn {
          background: transparent;
          border: 1px solid #2a2a2a;
          color: #7a6a4a;
          padding: 4px 12px;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .copy-btn:hover, .copy-btn.copied { border-color: #d4af37; color: #d4af37; }
        .input-field {
          width: 100%;
          background: #111;
          border: 1px solid #2a2a2a;
          color: #e8dcc8;
          padding: 12px 16px;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus { border-color: #d4af37; }
        .input-field::placeholder { color: #3a3028; }
        .select-field {
          width: 100%;
          background: #111;
          border: 1px solid #2a2a2a;
          color: #e8dcc8;
          padding: 12px 16px;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          outline: none;
          appearance: none;
          cursor: pointer;
        }
        .platform-content-block {
          border: 1px solid #1e1e1e;
          background: #0d0d0d;
          padding: 24px;
          margin-bottom: 16px;
          border-radius: 2px;
          animation: fadeIn 0.4s ease forwards;
        }
        .gold-line {
          width: 40px;
          height: 1px;
          background: linear-gradient(90deg, #d4af37, transparent);
          margin: 8px 0 16px;
        }
        textarea.input-field { resize: vertical; min-height: 80px; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1a1a1a",
        padding: "32px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 10,
            letterSpacing: "4px",
            color: "#d4af37",
            marginBottom: 8,
            textTransform: "uppercase",
          }}>Luxury Travel</div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 28,
            fontWeight: 300,
            color: "#e8dcc8",
            letterSpacing: "1px",
          }}>Content Atelier</div>
        </div>
        <div style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 10,
          color: "#3a3028",
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}>Daily Publishing Suite</div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 97px)" }}>

        {/* Left Panel — Form */}
        <div style={{
          width: 360,
          flexShrink: 0,
          borderRight: "1px solid #1a1a1a",
          padding: "40px 32px",
          overflowY: "auto",
        }}>
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: "2px", color: "#7a6a4a", marginBottom: 10, textTransform: "uppercase" }}>
              Destination *
            </label>
            <input
              className="input-field"
              placeholder="e.g. Amalfi Coast, Italy"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: "2px", color: "#7a6a4a", marginBottom: 10, textTransform: "uppercase" }}>
              Property / Hotel
            </label>
            <input
              className="input-field"
              placeholder="e.g. Hotel Santa Caterina"
              value={form.property}
              onChange={(e) => setForm({ ...form, property: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: "2px", color: "#7a6a4a", marginBottom: 10, textTransform: "uppercase" }}>
              Key Highlights
            </label>
            <textarea
              className="input-field"
              placeholder="Infinity pool, Michelin-star dining, cliffside suites, private beach..."
              value={form.highlights}
              onChange={(e) => setForm({ ...form, highlights: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: "2px", color: "#7a6a4a", marginBottom: 10, textTransform: "uppercase" }}>
              Content Focus
            </label>
            <select
              className="select-field"
              value={form.contentType}
              onChange={(e) => setForm({ ...form, contentType: e.target.value })}
            >
              {CONTENT_TYPES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: "2px", color: "#7a6a4a", marginBottom: 10, textTransform: "uppercase" }}>
              Writing Tone
            </label>
            <select
              className="select-field"
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
            >
              {TONES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: "2px", color: "#7a6a4a", marginBottom: 10, textTransform: "uppercase" }}>
              Days to Generate
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {[3, 5, 7].map((d) => (
                <button
                  key={d}
                  className={`platform-toggle${form.days === d ? " active" : ""}`}
                  onClick={() => setForm({ ...form, days: d })}
                  style={{ flex: 1 }}
                >{d} days</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <label style={{ display: "block", fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: "2px", color: "#7a6a4a", marginBottom: 10, textTransform: "uppercase" }}>
              Platforms
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  className={`platform-toggle${form.selectedPlatforms.includes(p.id) ? " active" : ""}`}
                  onClick={() => setForm({ ...form, selectedPlatforms: toggle(form.selectedPlatforms, p.id) })}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ color: "#c0392b", fontFamily: "'Montserrat', sans-serif", fontSize: 11, marginBottom: 16 }}>{error}</div>
          )}

          <button
            className="btn-primary"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? <><Spinner /> Crafting Content...</> : "✦ Generate Content Calendar"}
          </button>
        </div>

        {/* Right Panel — Results */}
        <div style={{ flex: 1, overflowY: "auto", padding: "40px 48px" }}>
          {!results && !loading && (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 48,
                fontWeight: 300,
                color: "#1e1e1e",
                lineHeight: 1.2,
                marginBottom: 16,
              }}>
                The world's finest<br /><em>destinations await.</em>
              </div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: "#2a2a2a", letterSpacing: "2px" }}>
                Configure your brief and generate a week of luxury content
              </div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{ marginBottom: 24 }}>
                <Spinner />
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#5a4a2a", fontStyle: "italic" }}>
                Crafting your content calendar…
              </div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: "#3a2a1a", letterSpacing: "2px", marginTop: 8 }}>
                Elevating every word
              </div>
            </div>
          )}

          {results && (
            <div className="card">
              {/* Week Theme */}
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: "3px", color: "#d4af37", textTransform: "uppercase", marginBottom: 8 }}>
                  {results.destination}
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 300, color: "#e8dcc8", lineHeight: 1.3, marginBottom: 4 }}>
                  {results.week_theme}
                </div>
                <div className="gold-line" />
              </div>

              {/* Day Tabs */}
              <div style={{
                display: "flex",
                borderBottom: "1px solid #1a1a1a",
                marginBottom: 32,
                overflowX: "auto",
                gap: 4,
              }}>
                {results.days.map((d, i) => (
                  <button
                    key={i}
                    className={`day-tab${activeDay === i ? " active" : ""}`}
                    onClick={() => setActiveDay(i)}
                  >
                    Day {d.day}
                  </button>
                ))}
              </div>

              {activeDayData && (
                <div>
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#d4af37", marginBottom: 6 }}>
                      {activeDayData.date_label}
                    </div>
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, color: "#7a6a4a", fontStyle: "italic" }}>
                      {activeDayData.focus}
                    </div>
                  </div>

                  {Object.entries(activeDayData.platforms || {}).map(([platformId, content]) => {
                    const platform = PLATFORMS.find((p) => p.id === platformId);
                    if (!platform || !content) return null;
                    const copyKey = `${activeDay}-${platformId}`;
                    const fullText = [content.caption, content.hashtags].filter(Boolean).join("\n\n");

                    return (
                      <div key={platformId} className="platform-content-block">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: "2px", color: "#d4af37", textTransform: "uppercase" }}>
                            {platform.icon} {platform.label}
                          </div>
                          <button
                            className={`copy-btn${copiedKey === copyKey ? " copied" : ""}`}
                            onClick={() => copyToClipboard(fullText, copyKey)}
                          >
                            {copiedKey === copyKey ? "✓ Copied" : "Copy"}
                          </button>
                        </div>

                        {content.hook && (
                          <div style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 15,
                            fontStyle: "italic",
                            color: "#b8962e",
                            marginBottom: 14,
                            paddingLeft: 12,
                            borderLeft: "2px solid #2a2010",
                          }}>
                            "{content.hook}"
                          </div>
                        )}

                        <div style={{
                          fontFamily: platformId === "blog" ? "'Cormorant Garamond', serif" : "'Montserrat', sans-serif",
                          fontSize: platformId === "blog" ? 15 : 13,
                          lineHeight: platformId === "blog" ? 1.9 : 1.7,
                          color: "#c8b89a",
                          whiteSpace: "pre-wrap",
                          marginBottom: content.hashtags ? 16 : 0,
                        }}>
                          {content.caption}
                        </div>

                        {content.hashtags && (
                          <div style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: 11,
                            color: "#5a4a2a",
                            marginTop: 12,
                            lineHeight: 1.8,
                          }}>
                            {content.hashtags}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
