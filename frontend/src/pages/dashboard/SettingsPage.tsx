import { useState } from 'react'
import {
  User, Bell, Lock, Eye, Palette, Smartphone,
  CheckCircle2, ChevronRight, Save, AlertTriangle,
  Mail, Phone, Globe, Moon, Sun, Monitor,
  Shield, LogOut, Trash2, Key,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────
type Section = 'account' | 'notifications' | 'privacy' | 'security' | 'appearance'

interface ToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}

interface InputFieldProps {
  label: string
  value: string
  type?: string
  placeholder?: string
  onChange: (v: string) => void
  readOnly?: boolean
}

// ─── Components ──────────────────────────────────────────────────────────────
function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm text-text-primary">{label}</p>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200',
          checked ? 'bg-brand-gold' : 'bg-surface-3',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-4' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  )
}

function InputField({ label, value, type = 'text', placeholder, onChange, readOnly }: InputFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full h-9 px-3 rounded-lg bg-surface-2 border border-border text-sm text-text-primary',
          'placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50 transition-colors',
          readOnly && 'opacity-60 cursor-not-allowed',
        )}
      />
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">{title}</h3>
        {children}
      </CardContent>
    </Card>
  )
}

function Divider() {
  return <div className="border-t border-border/60 my-1" />
}

// ─── Settings sections ────────────────────────────────────────────────────────
const NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'account',       label: 'Account',       icon: <User className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { id: 'privacy',       label: 'Privacy',       icon: <Eye className="h-4 w-4" /> },
  { id: 'security',      label: 'Security',      icon: <Lock className="h-4 w-4" /> },
  { id: 'appearance',    label: 'Appearance',    icon: <Palette className="h-4 w-4" /> },
]

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, logout } = useAuthStore()
  const [section, setSection] = useState<Section>('account')
  const [saved, setSaved] = useState(false)

  // Account state
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '+91 98200 00000')
  const [bio, setBio] = useState('Senior broker specialising in commercial leasing and co-broking across MMR.')
  const [city, setCity] = useState('Mumbai')
  const [website, setWebsite] = useState('')

  // Notification state
  const [notifs, setNotifs] = useState({
    emailMandates: true,
    emailMessages: true,
    emailCircles: false,
    emailWeeklyDigest: true,
    pushMessages: true,
    pushMandates: true,
    pushSystem: true,
    smsOtp: true,
    smsAlerts: false,
  })

  // Privacy state
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showPhone: false,
    showEmail: false,
    allowMessages: true,
    showOnlineStatus: true,
    indexProfile: true,
  })

  // Appearance state
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark')
  const [compactMode, setCompactMode] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const setN = (key: keyof typeof notifs) => (v: boolean) => setNotifs((p) => ({ ...p, [key]: v }))
  const setP = (key: keyof typeof privacy) => (v: boolean) => setPrivacy((p) => ({ ...p, [key]: v }))

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-text-primary mb-0.5">Settings</h1>
          <p className="text-sm text-text-muted">Manage your account, privacy and preferences</p>
        </div>

        <div className="flex gap-8">
          {/* Left nav */}
          <div className="w-44 shrink-0">
            <nav className="flex flex-col gap-1 sticky top-6">
              {NAV.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setSection(n.id)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                    section === n.id
                      ? 'bg-brand-gold/10 text-brand-gold font-medium'
                      : 'text-text-muted hover:text-text-secondary hover:bg-surface-2',
                  )}
                >
                  {n.icon}
                  {n.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* ── ACCOUNT ─────────────────────────────────────────────────── */}
            {section === 'account' && (
              <>
                {/* Avatar */}
                <SectionCard title="Profile photo">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-brand-gold/10 border-2 border-brand-gold/20 flex items-center justify-center text-xl font-bold text-brand-gold shrink-0">
                      {fullName?.[0] ?? '?'}
                    </div>
                    <div>
                      <Button variant="outline" size="sm">Upload photo</Button>
                      <p className="text-xs text-text-muted mt-1.5">JPG or PNG, max 2 MB</p>
                    </div>
                  </div>
                </SectionCard>

                {/* Personal info */}
                <SectionCard title="Personal information">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Full name" value={fullName} onChange={setFullName} placeholder="Your name" />
                    <InputField label="Email" value={user?.email ?? ''} onChange={() => {}} readOnly
                      placeholder="email@example.com" />
                    <InputField label="Phone" value={phone} onChange={setPhone} placeholder="+91 98200 00000" />
                    <InputField label="City" value={city} onChange={setCity} placeholder="Mumbai" />
                    <div className="sm:col-span-2">
                      <InputField label="Website" value={website} onChange={setWebsite} placeholder="https://yoursite.com" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      maxLength={300}
                      className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50 transition-colors resize-none"
                    />
                    <p className="text-xs text-text-muted text-right mt-1">{bio.length}/300</p>
                  </div>
                </SectionCard>

                {/* Email note */}
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-surface-2 border border-border">
                  <Mail className="h-4 w-4 text-text-muted shrink-0 mt-0.5" />
                  <p className="text-xs text-text-muted">
                    Email address cannot be changed. Contact support if you need to update it.
                  </p>
                </div>

                {/* Danger zone */}
                <SectionCard title="Danger zone">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm text-text-primary">Deactivate account</p>
                      <p className="text-xs text-text-muted">Temporarily hide your profile from the network</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-warning border-warning/30 hover:bg-warning/10">
                      Deactivate
                    </Button>
                  </div>
                  <Divider />
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm text-error">Delete account</p>
                      <p className="text-xs text-text-muted">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-error border-error/30 hover:bg-error/10">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </SectionCard>
              </>
            )}

            {/* ── NOTIFICATIONS ────────────────────────────────────────────── */}
            {section === 'notifications' && (
              <>
                <SectionCard title="Email notifications">
                  <Toggle label="New mandates in your area" description="When a matching mandate is posted in your city" checked={notifs.emailMandates} onChange={setN('emailMandates')} />
                  <Divider />
                  <Toggle label="New messages" description="When you receive a chat message" checked={notifs.emailMessages} onChange={setN('emailMessages')} />
                  <Divider />
                  <Toggle label="Circle activity" description="Posts and updates from circles you joined" checked={notifs.emailCircles} onChange={setN('emailCircles')} />
                  <Divider />
                  <Toggle label="Weekly digest" description="A summary of top mandates every Monday" checked={notifs.emailWeeklyDigest} onChange={setN('emailWeeklyDigest')} />
                </SectionCard>

                <SectionCard title="Push notifications">
                  <Toggle label="Messages" description="In-app and browser push for new messages" checked={notifs.pushMessages} onChange={setN('pushMessages')} />
                  <Divider />
                  <Toggle label="Mandate matches" checked={notifs.pushMandates} onChange={setN('pushMandates')} />
                  <Divider />
                  <Toggle label="System alerts" description="Account, KYC, and security notices" checked={notifs.pushSystem} onChange={setN('pushSystem')} />
                </SectionCard>

                <SectionCard title="SMS notifications">
                  <Toggle label="OTP & login codes" description="Required for account security, cannot be disabled" checked={notifs.smsOtp} onChange={() => {}} />
                  <Divider />
                  <Toggle label="Important alerts" description="Mandate status changes and account notices" checked={notifs.smsAlerts} onChange={setN('smsAlerts')} />
                </SectionCard>
              </>
            )}

            {/* ── PRIVACY ──────────────────────────────────────────────────── */}
            {section === 'privacy' && (
              <>
                <SectionCard title="Profile visibility">
                  <Toggle label="Public profile" description="Allow anyone on COBROKINGS to view your profile" checked={privacy.profilePublic} onChange={setP('profilePublic')} />
                  <Divider />
                  <Toggle label="Show phone number" description="Visible to verified brokers you connect with" checked={privacy.showPhone} onChange={setP('showPhone')} />
                  <Divider />
                  <Toggle label="Show email address" checked={privacy.showEmail} onChange={setP('showEmail')} />
                  <Divider />
                  <Toggle label="Show online status" description="Let others see when you were last active" checked={privacy.showOnlineStatus} onChange={setP('showOnlineStatus')} />
                </SectionCard>

                <SectionCard title="Messaging">
                  <Toggle label="Allow messages from anyone" description="If off, only your circle members can message you" checked={privacy.allowMessages} onChange={setP('allowMessages')} />
                </SectionCard>

                <SectionCard title="Search & discovery">
                  <Toggle label="Appear in search results" description="Allow your profile to be indexed and found by other brokers" checked={privacy.indexProfile} onChange={setP('indexProfile')} />
                </SectionCard>

                <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-surface-2 border border-border">
                  <Shield className="h-4 w-4 text-text-muted shrink-0 mt-0.5" />
                  <p className="text-xs text-text-muted">
                    Your data is never sold to third parties. Read our{' '}
                    <a href="/privacy" className="text-brand-gold hover:underline">Privacy Policy</a>.
                  </p>
                </div>
              </>
            )}

            {/* ── SECURITY ─────────────────────────────────────────────────── */}
            {section === 'security' && (
              <>
                <SectionCard title="Change password">
                  <div className="flex flex-col gap-3">
                    <InputField label="Current password" value="" type="password" onChange={() => {}} placeholder="••••••••" />
                    <InputField label="New password" value="" type="password" onChange={() => {}} placeholder="Min. 8 characters" />
                    <InputField label="Confirm new password" value="" type="password" onChange={() => {}} placeholder="••••••••" />
                    <Button size="sm" className="w-fit mt-1">
                      <Key className="h-3.5 w-3.5" /> Update password
                    </Button>
                  </div>
                </SectionCard>

                <SectionCard title="Two-factor authentication">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-text-primary mb-0.5">Authenticator app</p>
                      <p className="text-xs text-text-muted">Use Google Authenticator or Authy for login verification</p>
                    </div>
                    <Button variant="outline" size="sm">Set up 2FA</Button>
                  </div>
                  <Divider />
                  <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                      <p className="text-sm text-text-primary mb-0.5">SMS verification</p>
                      <p className="text-xs text-text-muted flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-success" /> Active on {user?.phone ?? '+91 98200 00000'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Change number</Button>
                  </div>
                </SectionCard>

                <SectionCard title="Active sessions">
                  {[
                    { device: 'Chrome on Windows', location: 'Mumbai, India', time: 'Now', current: true },
                    { device: 'Safari on iPhone 14', location: 'Mumbai, India', time: '2 hours ago', current: false },
                    { device: 'Chrome on macOS', location: 'Pune, India', time: '3 days ago', current: false },
                  ].map((s, i) => (
                    <div key={i}>
                      {i > 0 && <Divider />}
                      <div className="flex items-center justify-between gap-4 py-2">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-4 w-4 text-text-muted shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-text-primary">{s.device}</p>
                              {s.current && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-success/10 text-success font-medium">Current</span>
                              )}
                            </div>
                            <p className="text-xs text-text-muted">{s.location} · {s.time}</p>
                          </div>
                        </div>
                        {!s.current && (
                          <button className="text-xs text-error hover:text-error/80 transition-colors">Revoke</button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Divider />
                  <button className="mt-2 text-xs text-error hover:text-error/80 font-medium transition-colors">
                    Sign out all other sessions
                  </button>
                </SectionCard>

                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-2 border border-border">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <p className="text-sm text-text-secondary">Last login: Today at 10:32 AM from Mumbai, India</p>
                  </div>
                </div>
              </>
            )}

            {/* ── APPEARANCE ───────────────────────────────────────────────── */}
            {section === 'appearance' && (
              <>
                <SectionCard title="Theme">
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { id: 'light' as const, label: 'Light', icon: <Sun className="h-5 w-5" /> },
                      { id: 'dark' as const,  label: 'Dark',  icon: <Moon className="h-5 w-5" /> },
                      { id: 'system' as const, label: 'System', icon: <Monitor className="h-5 w-5" /> },
                    ] as const).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all',
                          theme === t.id
                            ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                            : 'border-border text-text-muted hover:border-brand-gold/30 hover:text-text-secondary',
                        )}
                      >
                        {t.icon}
                        {t.label}
                        {theme === t.id && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Display">
                  <Toggle
                    label="Compact mode"
                    description="Reduce padding and spacing for more content on screen"
                    checked={compactMode}
                    onChange={setCompactMode}
                  />
                </SectionCard>

                <SectionCard title="Language & region">
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1.5">Language</label>
                      <select className="w-full h-9 px-3 rounded-lg bg-surface-2 border border-border text-sm text-text-primary focus:outline-none focus:border-brand-gold/50">
                        <option>English</option>
                        <option>हिन्दी</option>
                        <option>मराठी</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1.5">Timezone</label>
                      <select className="w-full h-9 px-3 rounded-lg bg-surface-2 border border-border text-sm text-text-primary focus:outline-none focus:border-brand-gold/50">
                        <option>Asia/Kolkata (IST, UTC+5:30)</option>
                        <option>Asia/Dubai (GST, UTC+4)</option>
                        <option>America/New_York (EST, UTC-5)</option>
                      </select>
                    </div>
                  </div>
                </SectionCard>
              </>
            )}

            {/* Save / logout bar */}
            <div className="flex items-center justify-between pt-2 pb-8">
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm text-text-muted hover:text-error transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
              <Button onClick={handleSave} className="flex items-center gap-2">
                {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved ? 'Saved!' : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
