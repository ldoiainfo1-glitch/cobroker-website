import { useState } from 'react'
import {
  Globe, Bell, Shield, CreditCard, Mail, Smartphone,
  ChevronRight, Save, AlertTriangle, CheckCircle2,
  ToggleLeft, ToggleRight, Plus, Trash2, ExternalLink,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ── Types & data ──────────────────────────────────────────────────────────────
type Section = 'general' | 'notifications' | 'security' | 'billing' | 'integrations' | 'email'

const NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'general',       label: 'General',         icon: <Globe className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notifications',   icon: <Bell className="h-4 w-4" /> },
  { id: 'security',      label: 'Security',        icon: <Shield className="h-4 w-4" /> },
  { id: 'billing',       label: 'Billing & Plans', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'integrations',  label: 'Integrations',    icon: <ExternalLink className="h-4 w-4" /> },
  { id: 'email',         label: 'Email / SMS',     icon: <Mail className="h-4 w-4" /> },
]

// Toggle component
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={cn('relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0',
      on ? 'bg-brand-gold' : 'bg-surface-2 border border-border')}>
      <span className={cn('inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform',
        on ? 'translate-x-4' : 'translate-x-0.5')} />
    </button>
  )
}

// Row with label + toggle
function ToggleRow({ label, sub, on, onToggle }: { label: string; sub?: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  )
}

// Input field
function Field({ label, value, onChange, type = 'text', readonly = false, hint }:
  { label: string; value: string; onChange?: (v: string) => void; type?: string; readonly?: boolean; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1.5">{label}</label>
      <input type={type} value={value} readOnly={readonly}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn('w-full h-9 px-3 rounded-lg border text-sm text-text-primary bg-surface-2 focus:outline-none transition-colors',
          readonly ? 'cursor-default text-text-muted border-border' : 'border-border focus:border-brand-gold/40')} />
      {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
    </div>
  )
}

// Section card wrapper
function SettingsCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <Card className="mb-4">
      <CardContent className="p-5">
        <div className="mb-4">
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

// ── Section content components ────────────────────────────────────────────────
function GeneralSettings() {
  const [vals, setVals] = useState({
    platformName: 'COBROKINGS',
    tagline: "India's Co-Broking Network",
    supportEmail: 'support@cobrokings.in',
    supportPhone: '+91 98765 43210',
    maxMandatesPerBroker: '50',
    maxCircleMembers: '200',
    maintenanceMode: false,
    newRegistrations: true,
    mandateApproval: false,
    cobrokerRequests: true,
  })

  const set = (k: keyof typeof vals, v: string | boolean) => setVals((p) => ({ ...p, [k]: v }))

  return (
    <>
      <SettingsCard title="Platform Identity">
        <div className="space-y-3">
          <Field label="Platform Name" value={vals.platformName} onChange={(v) => set('platformName', v)} />
          <Field label="Tagline" value={vals.tagline} onChange={(v) => set('tagline', v)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Support Email" value={vals.supportEmail} onChange={(v) => set('supportEmail', v)} type="email" />
            <Field label="Support Phone" value={vals.supportPhone} onChange={(v) => set('supportPhone', v)} />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Limits & Quotas" sub="Control resource limits per user/company.">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Max Mandates per Broker" value={vals.maxMandatesPerBroker} onChange={(v) => set('maxMandatesPerBroker', v)} hint="0 = unlimited" />
          <Field label="Max Circle Members" value={vals.maxCircleMembers} onChange={(v) => set('maxCircleMembers', v)} />
        </div>
      </SettingsCard>

      <SettingsCard title="Platform Controls" sub="Enable or disable platform-wide features.">
        <ToggleRow label="Maintenance Mode" sub="Blocks all public access — shows a maintenance page." on={vals.maintenanceMode} onToggle={() => set('maintenanceMode', !vals.maintenanceMode)} />
        <ToggleRow label="Allow New Registrations" sub="Disable to pause sign-ups temporarily." on={vals.newRegistrations} onToggle={() => set('newRegistrations', !vals.newRegistrations)} />
        <ToggleRow label="Mandate Approval Required" sub="All new mandates must be approved by admin before going live." on={vals.mandateApproval} onToggle={() => set('mandateApproval', !vals.mandateApproval)} />
        <ToggleRow label="Co-broker Requests" sub="Allow brokers to send co-broking requests to each other." on={vals.cobrokerRequests} onToggle={() => set('cobrokerRequests', !vals.cobrokerRequests)} />
      </SettingsCard>

      {/* Danger zone */}
      <Card className="border-error/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="h-4 w-4 text-error mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-error">Danger Zone</p>
              <p className="text-xs text-text-muted mt-0.5">These actions are irreversible. Proceed with caution.</p>
            </div>
          </div>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-xl border border-error/30 hover:bg-error/5 transition-colors">
              <p className="text-sm font-medium text-error">Clear All Cached Data</p>
              <p className="text-xs text-text-muted mt-0.5">Flush Redis cache and CDN. May cause temporary slowdown.</p>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl border border-error/30 hover:bg-error/5 transition-colors">
              <p className="text-sm font-medium text-error">Reset All Platform Settings to Default</p>
              <p className="text-xs text-text-muted mt-0.5">Reverts all settings on this page to factory defaults.</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function NotificationSettings() {
  const [s, setS] = useState({
    newUserEmail: true, kycEmail: true, reportEmail: true, dailyDigest: true, weeklyReport: false,
    newUserPush: true, kycPush: true, reportPush: true,
    newUserSMS: false, kycSMS: true,
  })
  const t = (k: keyof typeof s) => setS((p) => ({ ...p, [k]: !p[k] }))

  return (
    <>
      <SettingsCard title="Email Notifications" sub="When to email platform admins.">
        <ToggleRow label="New user sign-up" on={s.newUserEmail} onToggle={() => t('newUserEmail')} />
        <ToggleRow label="KYC submission received" on={s.kycEmail} onToggle={() => t('kycEmail')} />
        <ToggleRow label="Mandate reported" on={s.reportEmail} onToggle={() => t('reportEmail')} />
        <ToggleRow label="Daily digest" sub="Summary of key metrics at 9 AM IST." on={s.dailyDigest} onToggle={() => t('dailyDigest')} />
        <ToggleRow label="Weekly performance report" on={s.weeklyReport} onToggle={() => t('weeklyReport')} />
      </SettingsCard>
      <SettingsCard title="Push Notifications (Web)" sub="Browser push alerts for admin panel.">
        <ToggleRow label="New user sign-up" on={s.newUserPush} onToggle={() => t('newUserPush')} />
        <ToggleRow label="KYC submission" on={s.kycPush} onToggle={() => t('kycPush')} />
        <ToggleRow label="Mandate reported" on={s.reportPush} onToggle={() => t('reportPush')} />
      </SettingsCard>
      <SettingsCard title="SMS Alerts" sub="High-priority alerts via SMS.">
        <ToggleRow label="New user sign-up" on={s.newUserSMS} onToggle={() => t('newUserSMS')} />
        <ToggleRow label="KYC submission" on={s.kycSMS} onToggle={() => t('kycSMS')} />
      </SettingsCard>
    </>
  )
}

function SecuritySettings() {
  const [s, setS] = useState({
    enforce2FA: false, sessionTimeout: '24',
    minPasswordLength: '8', requireSpecialChar: true, requireUppercase: true,
    ipWhitelist: false, adminWhitelistIps: '',
    rateLimitEnabled: true, maxLoginAttempts: '5',
    auditLog: true,
  })
  const t = (k: keyof typeof s) => setS((p) => ({ ...p, [k]: !p[k] }))
  const set = (k: keyof typeof s, v: string) => setS((p) => ({ ...p, [k]: v }))

  return (
    <>
      <SettingsCard title="Authentication">
        <ToggleRow label="Enforce 2FA for all Admin accounts" sub="Admins must enable two-factor auth to access this panel." on={s.enforce2FA} onToggle={() => t('enforce2FA')} />
        <div className="pt-3">
          <label className="block text-xs font-medium text-text-muted mb-1.5">Admin Session Timeout (hours)</label>
          <select value={s.sessionTimeout} onChange={(e) => set('sessionTimeout', e.target.value)}
            className="h-9 px-3 rounded-lg border border-border bg-surface-2 text-sm text-text-primary focus:outline-none focus:border-brand-gold/40">
            {['1', '4', '8', '12', '24', '48', '168'].map((v) => (
              <option key={v} value={v}>{v === '168' ? '7 days' : `${v} hour${v === '1' ? '' : 's'}`}</option>
            ))}
          </select>
        </div>
      </SettingsCard>

      <SettingsCard title="Password Policy" sub="Applied to all broker and admin accounts.">
        <div className="pb-3 border-b border-border mb-3">
          <Field label="Minimum Password Length" value={s.minPasswordLength} onChange={(v) => set('minPasswordLength', v)} type="number" />
        </div>
        <ToggleRow label="Require Special Characters (!@#...)" on={s.requireSpecialChar} onToggle={() => t('requireSpecialChar')} />
        <ToggleRow label="Require Uppercase Letters" on={s.requireUppercase} onToggle={() => t('requireUppercase')} />
      </SettingsCard>

      <SettingsCard title="IP Whitelisting" sub="Restrict admin panel access to specific IP addresses.">
        <ToggleRow label="Enable IP Whitelist for Admin Panel" on={s.ipWhitelist} onToggle={() => t('ipWhitelist')} />
        {s.ipWhitelist && (
          <div className="mt-3">
            <Field label="Allowed IPs (comma-separated)" value={s.adminWhitelistIps}
              onChange={(v) => set('adminWhitelistIps', v)} hint="e.g. 103.21.244.0, 198.51.100.0" />
          </div>
        )}
      </SettingsCard>

      <SettingsCard title="Rate Limiting & Brute Force">
        <ToggleRow label="Enable Login Rate Limiting" on={s.rateLimitEnabled} onToggle={() => t('rateLimitEnabled')} />
        <div className="pt-3">
          <Field label="Max Login Attempts Before Lockout" value={s.maxLoginAttempts} onChange={(v) => set('maxLoginAttempts', v)} type="number" />
        </div>
        <ToggleRow label="Enable Audit Log" sub="Log all admin actions with timestamp and IP." on={s.auditLog} onToggle={() => t('auditLog')} />
      </SettingsCard>
    </>
  )
}

const PLANS = [
  { id: 'free',            name: 'Free',            price: '₹0/mo',    mandates: 5,   highlight: false },
  { id: 'pro',             name: 'Pro',             price: '₹999/mo',  mandates: 50,  highlight: true  },
  { id: 'verified_plus',   name: 'Verified+',       price: '₹2,499/mo',mandates: 200, highlight: false },
  { id: 'enterprise',      name: 'Enterprise',      price: 'Custom',   mandates: -1,  highlight: false },
]

function BillingSettings() {
  const [plans, setPlans] = useState(PLANS.map((p) => ({ ...p })))
  const [promoEnabled, setPromoEnabled] = useState(true)
  const [trialDays, setTrialDays] = useState('14')
  const [gatewayKey, setGatewayKey] = useState('rzp_live_••••••••••••')

  return (
    <>
      <SettingsCard title="Subscription Plans" sub="Edit pricing for each tier. Changes take effect on next billing cycle.">
        <div className="space-y-3">
          {plans.map((p, i) => (
            <div key={p.id} className={cn('flex items-center gap-3 p-3 rounded-xl border',
              p.highlight ? 'border-brand-gold/40 bg-brand-gold/5' : 'border-border bg-surface-2')}>
              {p.highlight && <span className="text-xs font-bold text-brand-gold shrink-0">★</span>}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{p.name}</p>
                <p className="text-xs text-text-muted">{p.mandates === -1 ? 'Unlimited mandates' : `${p.mandates} mandates/mo`}</p>
              </div>
              <input value={p.price} onChange={(e) => {
                const updated = [...plans]; updated[i] = { ...updated[i], price: e.target.value }
                setPlans(updated)
              }} className="h-8 w-28 text-right px-2 rounded-lg border border-border bg-surface-0 text-sm text-text-primary focus:outline-none focus:border-brand-gold/40" />
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Promotions & Trial">
        <ToggleRow label="Enable Promo Codes" sub="Allow users to apply discount codes at checkout." on={promoEnabled} onToggle={() => setPromoEnabled(!promoEnabled)} />
        <div className="pt-3">
          <Field label="Free Trial Period (days)" value={trialDays} onChange={setTrialDays} type="number" />
        </div>
      </SettingsCard>

      <SettingsCard title="Payment Gateway" sub="Razorpay integration settings.">
        <Field label="Live API Key" value={gatewayKey} onChange={setGatewayKey} hint="Keep this secret. Only entered by super-admin." />
      </SettingsCard>
    </>
  )
}

const INTEGRATIONS_LIST = [
  { name: 'Google Maps',   desc: 'Property map views and city autocomplete', status: true,  badge: 'Connected' },
  { name: 'Razorpay',      desc: 'Payment gateway for subscriptions',         status: true,  badge: 'Connected' },
  { name: 'Twilio',        desc: 'SMS OTP and alerts',                         status: true,  badge: 'Connected' },
  { name: 'SendGrid',      desc: 'Transactional email delivery',               status: false, badge: 'Disconnected' },
  { name: 'AWS S3',        desc: 'Document and image storage',                 status: true,  badge: 'Connected' },
  { name: 'Firebase FCM',  desc: 'Push notification delivery',                 status: false, badge: 'Disconnected' },
]

function IntegrationSettings() {
  const [list, setList] = useState(INTEGRATIONS_LIST)
  const toggle = (i: number) => setList((p) => p.map((item, idx) => idx === i ? { ...item, status: !item.status, badge: !item.status ? 'Connected' : 'Disconnected' } : item))

  return (
    <SettingsCard title="Connected Integrations" sub="Manage third-party service connections.">
      <div className="space-y-1">
        {list.map((item, i) => (
          <div key={item.name} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
            <div className="w-8 h-8 rounded-xl bg-surface-2 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-text-muted">{item.name[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{item.name}</p>
              <p className="text-xs text-text-muted">{item.desc}</p>
            </div>
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border',
              item.status ? 'bg-success/10 text-success border-success/20' : 'bg-surface-2 text-text-muted border-border')}>
              {item.badge}
            </span>
            <Toggle on={item.status} onToggle={() => toggle(i)} />
          </div>
        ))}
      </div>
    </SettingsCard>
  )
}

type EmailTemplate = { id: string; name: string; subject: string; enabled: boolean }
const EMAIL_TEMPLATES: EmailTemplate[] = [
  { id: 't1', name: 'Welcome Email',         subject: 'Welcome to COBROKINGS!',              enabled: true },
  { id: 't2', name: 'KYC Approved',          subject: 'Your KYC has been verified ✅',       enabled: true },
  { id: 't3', name: 'KYC Rejected',          subject: 'Action required: KYC resubmission',   enabled: true },
  { id: 't4', name: 'New Message',           subject: 'You have a new message on COBROKINGS', enabled: true },
  { id: 't5', name: 'Password Reset',        subject: 'Reset your COBROKINGS password',       enabled: true },
  { id: 't6', name: 'Mandate Co-brok Request', subject: 'A broker wants to co-brok with you',enabled: false },
]

function EmailSettings() {
  const [templates, setTemplates] = useState(EMAIL_TEMPLATES)
  const [senderName, setSenderName] = useState('COBROKINGS')
  const [senderEmail, setSenderEmail] = useState('noreply@cobrokings.in')
  const [replyTo, setReplyTo] = useState('support@cobrokings.in')

  const toggleTemplate = (id: string) =>
    setTemplates((p) => p.map((t) => t.id === id ? { ...t, enabled: !t.enabled } : t))

  return (
    <>
      <SettingsCard title="Sender Configuration">
        <div className="space-y-3">
          <Field label="Sender Name"  value={senderName}  onChange={setSenderName}  />
          <Field label="Sender Email" value={senderEmail} onChange={setSenderEmail} type="email" />
          <Field label="Reply-To"     value={replyTo}     onChange={setReplyTo}     type="email" />
        </div>
      </SettingsCard>

      <SettingsCard title="Email Templates" sub="Enable or disable automated email notifications.">
        {templates.map((t) => (
          <ToggleRow key={t.id} label={t.name} sub={t.subject} on={t.enabled} onToggle={() => toggleTemplate(t.id)} />
        ))}
      </SettingsCard>

      <SettingsCard title="SMS Templates" sub="Twilio-powered SMS alerts.">
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-xl bg-surface-2 border border-border">
            <p className="text-xs font-medium text-text-secondary mb-1">OTP Verification</p>
            <p className="text-xs text-text-muted font-mono">Your COBROKINGS OTP is {'{{otp}}'}. Valid for 10 minutes.</p>
          </div>
          <div className="p-3 rounded-xl bg-surface-2 border border-border">
            <p className="text-xs font-medium text-text-secondary mb-1">KYC Approved</p>
            <p className="text-xs text-text-muted font-mono">Hi {'{{name}}'}, your KYC on COBROKINGS is approved! Start co-broking today.</p>
          </div>
        </div>
      </SettingsCard>
    </>
  )
}

const SECTION_CONTENT: Record<Section, React.ReactNode> = {
  general:       <GeneralSettings />,
  notifications: <NotificationSettings />,
  security:      <SecuritySettings />,
  billing:       <BillingSettings />,
  integrations:  <IntegrationSettings />,
  email:         <EmailSettings />,
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminPlatformSettingsPage() {
  const [active, setActive] = useState<Section>('general')
  const [saved, setSaved] = useState(false)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex h-full">
      {/* Left nav */}
      <aside className="w-48 shrink-0 border-r border-border p-3 space-y-0.5 overflow-y-auto">
        {NAV.map((n) => (
          <button key={n.id} onClick={() => setActive(n.id)}
            className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-colors',
              active === n.id
                ? 'bg-error/10 text-error'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-2')}>
            {n.icon}
            <span className="truncate">{n.label}</span>
            {active === n.id && <ChevronRight className="h-3 w-3 ml-auto shrink-0" />}
          </button>
        ))}
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl">
          {/* Section header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                {NAV.find((n) => n.id === active)?.label}
              </h1>
              <p className="text-sm text-text-muted mt-0.5">Configure platform-wide {NAV.find((n) => n.id === active)?.label.toLowerCase()} settings.</p>
            </div>
            <button onClick={save}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                saved
                  ? 'bg-success/10 text-success border border-success/20'
                  : 'bg-brand-gold text-white hover:bg-brand-gold/90')}>
              {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Changes</>}
            </button>
          </div>

          {SECTION_CONTENT[active]}
        </div>
      </div>
    </div>
  )
}
