import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Companion = {
  name: string;
  type: "adult" | "kid";
};

type GuestForm = {
  guestName: string;
  contactNumber: string;
  bringCount: number;
  companions: Companion[];
  adultCount: number;
  kidCount: number;
  allergies: string;
  confirmed: boolean;
};

type GuestRecord = GuestForm & {
  id: number;
  createdAt: string;
};

type AdminUser = {
  username: string;
};

const emptyForm: GuestForm = {
  guestName: "",
  contactNumber: "",
  bringCount: 0,
  companions: [],
  adultCount: 1,
  kidCount: 0,
  allergies: "",
  confirmed: true,
};

// const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const API_BASE = "https://events.fitacademy.ph/api/chantelle/";
const ASSET_BASE = import.meta.env.BASE_URL;

function App() {
  const [view, setView] = useState<"rsvp" | "admin">("rsvp");

  return (
    <main>
      <nav className="top-nav" aria-label="Main navigation">
        <a className="brand-mark" href="#home" onClick={() => setView("rsvp")}>
          <span>✝</span>
          <strong>Chantelle</strong>
        </a>
        <div className="nav-actions">
          <button
            className={view === "rsvp" ? "active" : ""}
            onClick={() => setView("rsvp")}
          >
            RSVP
          </button>
          <button
            className={view === "admin" ? "active" : ""}
            onClick={() => setView("admin")}
          >
            Admin
          </button>
        </div>
      </nav>
      {view === "rsvp" ? <InvitationPage /> : <AdminPanel />}
    </main>
  );
}

function InvitationPage() {
  return (
    <>
      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="blessing">One Blessed Girl</div>
          <p className="occasion">Holy Baptism & 1st Birthday Celebration</p>
          <h1>Chantelle</h1>
          <p className="verse">
            A little blessing from above is turning one with love.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="#rsvp">
              Confirm Attendance
            </a>
            <a className="ghost-link" href="#details">
              View Details
            </a>
          </div>
        </div>
        <div className="portrait-wrap" aria-label="Invitation reference">
          <img
            src={`${ASSET_BASE}assets/invitation-reference.jpg`}
            alt="Chantelle birthday and baptism invitation"
          />
        </div>
      </section>

      <section className="details-band" id="details">
        <EventDetail
          icon="▣"
          label="Date & Time"
          value="Aug 8, 2026"
          note="11:30 AM"
        />
        <EventDetail
          icon="✝"
          label="Church Venue"
          value="Parish of the Good Shepherd Church"
          note="Sampaloc I, Dasmarinas City"
        />
        <EventDetail
          icon="▱"
          label="Reception Venue"
          value="Greenwoods Events Center"
          note="After the baptism"
        />
      </section>

      <RsvpForm />
    </>
  );
}

function EventDetail({
  icon,
  label,
  value,
  note,
}: {
  icon: string;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="event-detail">
      <span className="detail-icon">{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

function RsvpForm() {
  const [form, setForm] = useState<GuestForm>(emptyForm);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const totalAttending = form.confirmed ? 1 + form.bringCount : 0;

  function update<K extends keyof GuestForm>(key: K, value: GuestForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setConfirmation(confirmed: boolean) {
    setForm((current) => {
      if (!confirmed) {
        return {
          ...current,
          confirmed,
          bringCount: 0,
          companions: [],
          adultCount: 0,
          kidCount: 0,
          allergies: "",
        };
      }

      const adultCount =
        1 + current.companions.filter((guest) => guest.type === "adult").length;
      const kidCount = current.companions.filter(
        (guest) => guest.type === "kid",
      ).length;
      return { ...current, confirmed, adultCount, kidCount };
    });
  }

  function setBringCount(value: number) {
    const bringCount = Math.max(0, Math.min(20, value || 0));
    setForm((current) => {
      const companions = Array.from(
        { length: bringCount },
        (_, index) => current.companions[index] || { name: "", type: "adult" },
      );
      const adultCount = current.confirmed
        ? 1 + companions.filter((guest) => guest.type === "adult").length
        : 0;
      const kidCount = current.confirmed
        ? companions.filter((guest) => guest.type === "kid").length
        : 0;
      return { ...current, bringCount, companions, adultCount, kidCount };
    });
  }

  function updateCompanion(index: number, patch: Partial<Companion>) {
    setForm((current) => {
      const companions = current.companions.map((guest, guestIndex) =>
        guestIndex === index ? { ...guest, ...patch } : guest,
      );
      const adultCount = current.confirmed
        ? 1 + companions.filter((guest) => guest.type === "adult").length
        : 0;
      const kidCount = current.confirmed
        ? companions.filter((guest) => guest.type === "kid").length
        : 0;
      return { ...current, companions, adultCount, kidCount };
    });
  }

  async function submitForm(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const response = await fetch(`${API_BASE}/register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Unable to save RSVP.");
      }
      setStatus("Your confirmation has been received. Thank you.");
      setForm(emptyForm);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to save RSVP.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rsvp-section" id="rsvp">
      <div className="section-heading">
        <span>RSVP</span>
        <h2>Guest List Confirmation</h2>
      </div>

      <form className="rsvp-form" onSubmit={submitForm}>
        <label>
          Guest Name
          <input
            value={form.guestName}
            onChange={(event) => update("guestName", event.target.value)}
            required
            placeholder="Full name"
          />
        </label>
        <label>
          Contact Number
          <input
            value={form.contactNumber}
            onChange={(event) => update("contactNumber", event.target.value)}
            required
            inputMode="tel"
            placeholder="09XX XXX XXXX"
          />
        </label>
        <label>
          Confirmation
          <select
            value={form.confirmed ? "yes" : "no"}
            onChange={(event) => setConfirmation(event.target.value === "yes")}
          >
            <option value="yes">Yes, I will attend</option>
            <option value="no">Sorry, I cannot attend</option>
          </select>
        </label>
        {form.confirmed && (
          <>
            <label>
              Guests You Will Bring
              <input
                type="number"
                min="0"
                max="20"
                value={form.bringCount}
                onChange={(event) => setBringCount(Number(event.target.value))}
              />
            </label>

            {form.companions.length > 0 && (
              <div className="companions">
                {form.companions.map((companion, index) => (
                  <div className="companion-row" key={index}>
                    <input
                      value={companion.name}
                      onChange={(event) =>
                        updateCompanion(index, { name: event.target.value })
                      }
                      placeholder={`Guest ${index + 1} name`}
                      required={form.confirmed}
                    />
                    <select
                      value={companion.type}
                      onChange={(event) =>
                        updateCompanion(index, {
                          type: event.target.value as Companion["type"],
                        })
                      }
                    >
                      <option value="adult">Adult</option>
                      <option value="kid">Kid</option>
                    </select>
                  </div>
                ))}
              </div>
            )}

            <div className="count-grid">
              <label>
                Adults
                <input
                  type="number"
                  min="0"
                  value={form.adultCount}
                  onChange={(event) =>
                    update("adultCount", Number(event.target.value))
                  }
                />
              </label>
              <label>
                Kids
                <input
                  type="number"
                  min="0"
                  value={form.kidCount}
                  onChange={(event) =>
                    update("kidCount", Number(event.target.value))
                  }
                />
              </label>
            </div>

            <label className="full">
              Allergies / Food Notes
              <textarea
                value={form.allergies}
                onChange={(event) => update("allergies", event.target.value)}
                placeholder="Example: peanuts, seafood, milk, none"
              />
            </label>
          </>
        )}

        <div className="form-footer">
          <p>
            Total attending: <strong>{totalAttending}</strong>
          </p>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Submit Confirmation"}
          </button>
        </div>
        {status && <p className="status-message">{status}</p>}
      </form>
    </section>
  );
}

function AdminPanel() {
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loginError, setLoginError] = useState("");

  async function checkSession() {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/session.php`, {
        credentials: "include",
      });
      const payload = await response.json();
      if (payload.authenticated) {
        setAdmin(payload.admin);
        await loadGuests();
      } else {
        setAdmin(null);
        setGuests([]);
        setLoading(false);
      }
    } catch {
      setAdmin(null);
      setLoading(false);
      setLoginError("Unable to check admin session.");
    }
  }

  async function loadGuests() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/guests.php`, {
        credentials: "include",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Unable to load guests.");
      }
      setGuests(payload.guests);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load guests.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function login(username: string, password: string) {
    setLoginError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Unable to login.");
      }
      setAdmin(payload.admin);
      await loadGuests();
    } catch (loginFailure) {
      setLoginError(
        loginFailure instanceof Error
          ? loginFailure.message
          : "Unable to login.",
      );
      setLoading(false);
    }
  }

  async function logout() {
    await fetch(`${API_BASE}/logout.php`, {
      method: "POST",
      credentials: "include",
    });
    setAdmin(null);
    setGuests([]);
  }

  useEffect(() => {
    checkSession();
  }, []);

  const filteredGuests = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return guests;
    return guests.filter((guest) =>
      [guest.guestName, guest.contactNumber, guest.allergies]
        .join(" ")
        .toLowerCase()
        .includes(cleanQuery),
    );
  }, [guests, query]);

  const totals = useMemo(
    () =>
      guests.reduce(
        (summary, guest) => ({
          confirmed: summary.confirmed + (guest.confirmed ? 1 : 0),
          adults:
            summary.adults +
            (guest.confirmed ? Number(guest.adultCount || 0) : 0),
          kids:
            summary.kids + (guest.confirmed ? Number(guest.kidCount || 0) : 0),
          total:
            summary.total +
            (guest.confirmed
              ? Number(guest.adultCount || 0) + Number(guest.kidCount || 0)
              : 0),
        }),
        { confirmed: 0, adults: 0, kids: 0, total: 0 },
      ),
    [guests],
  );

  if (!admin) {
    return <AdminLogin loading={loading} error={loginError} onLogin={login} />;
  }

  return (
    <section className="admin-panel">
      <div className="admin-header">
        <div>
          <span>Admin</span>
          <h1>Guest Confirmations</h1>
        </div>
        <div className="admin-actions">
          <button onClick={logout}>Logout</button>
          <button onClick={loadGuests}>Refresh</button>
          <a href={`${API_BASE}/export.php`}>Export Excel CSV</a>
        </div>
      </div>

      <div className="stats-grid">
        <Stat label="Confirmed RSVP" value={totals.confirmed} />
        <Stat label="Total Attending" value={totals.total} />
        <Stat label="Adults" value={totals.adults} />
        <Stat label="Kids" value={totals.kids} />
      </div>

      <div className="table-toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search guest, contact, allergies"
        />
      </div>

      {loading && <p className="empty-state">Loading guest list...</p>}
      {error && <p className="empty-state">{error}</p>}
      {!loading && !error && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Adults</th>
                <th>Kids</th>
                <th>Companions</th>
                <th>Allergies</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => (
                <tr key={guest.id}>
                  <td>{guest.guestName}</td>
                  <td>{guest.contactNumber}</td>
                  <td>{guest.confirmed ? "Confirmed" : "Declined"}</td>
                  <td>{guest.adultCount}</td>
                  <td>{guest.kidCount}</td>
                  <td>
                    {guest.companions
                      .map((person) => `${person.name} (${person.type})`)
                      .join(", ") || "-"}
                  </td>
                  <td>{guest.allergies || "-"}</td>
                  <td>{new Date(guest.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredGuests.length === 0 && (
            <p className="empty-state">No guests found.</p>
          )}
        </div>
      )}
    </section>
  );
}

function AdminLogin({
  loading,
  error,
  onLogin,
}: {
  loading: boolean;
  error: string;
  onLogin: (username: string, password: string) => void;
}) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");

  function submitLogin(event: React.FormEvent) {
    event.preventDefault();
    onLogin(username, password);
  }

  return (
    <section className="admin-panel login-panel">
      <form className="admin-login" onSubmit={submitLogin}>
        <div className="section-heading">
          <span>Admin Login</span>
          <h2>Guest List Access</h2>
        </div>
        <label>
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <label>
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            autoComplete="current-password"
            placeholder="Admin password"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Checking..." : "Login"}
        </button>
        {error && <p className="status-message">{error}</p>}
      </form>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <article className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
