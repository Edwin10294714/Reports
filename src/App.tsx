import { useState, useEffect, useRef } from 'react';
import { useAuth, useClerk, useSignIn, useSignUp, useUser } from '@clerk/clerk-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Bell, Building2, ChartColumn, Check, Database, FolderKanban, HelpCircle, LayoutDashboard, Menu, Settings, ShieldCheck, TrendingUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  username: z.string().regex(/^\d{5}$/, 'Enter your 5-digit User ID.'),
  pin: z.string().regex(/^\d{4}$/, 'Enter your 4-digit PIN.'),
});

type LoginValues = z.infer<typeof loginSchema>;

const chartData = [
  { month: 'Jan', completion: 68, retained: 53 },
  { month: 'Feb', completion: 72, retained: 58 },
  { month: 'Mar', completion: 77, retained: 63 },
  { month: 'Apr', completion: 74, retained: 59 },
  { month: 'May', completion: 81, retained: 66 },
  { month: 'Jun', completion: 87, retained: 71 },
];

const barData = [
  { name: 'Engineering', value: 82 },
  { name: 'Business', value: 74 },
  { name: 'Arts', value: 68 },
  { name: 'Nursing', value: 91 },
  { name: 'Sciences', value: 79 },
];

const navItems = [
  { label: 'Student Success', icon: LayoutDashboard, active: true },
  { label: 'Faculty Research', icon: FolderKanban },
  { label: 'Institutional Finance', icon: Building2 },
  { label: 'Enrollment Trends', icon: TrendingUp },
];

const dashboardPath = '/dashboard';
const loginPath = '/login';
const forgotPinPath = '/forgot-pin';
const createAccountPath = '/create-account';
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const clerkUsernameForUserId = (userId: string) => userId;
const clerkPasswordForCredentials = (userId: string, pin: string) => `${pin}-${userId}`;

const universityUnits = {
  'College of Basic and Applied Sciences': [
    'School of Physical and Mathematical Sciences',
    'School of Biological Sciences',
    'School of Agriculture',
    'School of Engineering Sciences',
    'School of Veterinary Sciences',
  ],
  'College of Education': [
    'Department of Distance Education',
    'Department of Adult Education and Human Resource Development',
  ],
  'College of Health Sciences': [
    'University of Ghana Medical School',
    'University of Ghana Dental School',
    'School of Biomedical and Allied Health Sciences',
    'School of Public Health',
    'School of Nursing and Midwifery',
    'School of Pharmacy',
    'Noguchi Memorial Institute for Medical Research',
  ],
  'College of Humanities': [],
};

const reportPageData = {
  'Faculty Research': {
    description: 'Monitor research activity, funding, and publication performance across faculties.',
    metrics: [
      ['Active Projects', '248', '+12 this term'],
      ['Grant Funding', '$8.4M', '+18.6% YTD'],
      ['Publications', '1,126', '+9.2% YTD'],
    ],
    trend: [
      { month: 'Jan', value: 138 }, { month: 'Feb', value: 152 }, { month: 'Mar', value: 149 },
      { month: 'Apr', value: 171 }, { month: 'May', value: 184 }, { month: 'Jun', value: 201 },
    ],
    categories: [
      { name: 'Engineering', value: 86 }, { name: 'Health', value: 74 }, { name: 'Sciences', value: 68 },
      { name: 'Business', value: 55 }, { name: 'Arts', value: 43 },
    ],
    action: 'Export Research Brief',
  },
  'Institutional Finance': {
    description: 'Review operating budgets, fund allocation, and financial performance by department.',
    metrics: [
      ['Operating Budget', '$42.8M', '78% allocated'],
      ['Revenue', '$18.6M', '+6.4% YTD'],
      ['Open Commitments', '$4.2M', '14 pending approvals'],
    ],
    trend: [
      { month: 'Jan', value: 62 }, { month: 'Feb', value: 68 }, { month: 'Mar', value: 65 },
      { month: 'Apr', value: 76 }, { month: 'May', value: 82 }, { month: 'Jun', value: 89 },
    ],
    categories: [
      { name: 'Academic', value: 91 }, { name: 'Operations', value: 73 }, { name: 'Research', value: 64 },
      { name: 'Student Aid', value: 58 }, { name: 'Facilities', value: 46 },
    ],
    action: 'Download Finance Report',
  },
  'Enrollment Trends': {
    description: 'Track enrollment movement, retention, and student demand across academic programs.',
    metrics: [
      ['Total Enrollment', '24,816', '+4.8% year over year'],
      ['New Students', '5,248', '+7.1% year over year'],
      ['Retention Rate', '91.4%', '+2.3 pts year over year'],
    ],
    trend: [
      { month: 'Jan', value: 71 }, { month: 'Feb', value: 75 }, { month: 'Mar', value: 78 },
      { month: 'Apr', value: 83 }, { month: 'May', value: 87 }, { month: 'Jun', value: 94 },
    ],
    categories: [
      { name: 'Undergraduate', value: 94 }, { name: 'Graduate', value: 68 }, { name: 'Online', value: 57 },
      { name: 'International', value: 49 }, { name: 'Continuing', value: 81 },
    ],
    action: 'Generate Enrollment Report',
  },
};

type ReportPageName = keyof typeof reportPageData;
type UtilityPage = 'notifications' | 'settings' | 'account' | null;
type AuthPage = 'login' | 'forgot' | 'create';
type AccountUser = {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  primaryEmailAddress: { emailAddress: string } | null;
  imageUrl: string;
  publicMetadata: Record<string, unknown>;
  unsafeMetadata: Record<string, unknown>;
};

function AuthPageShell({ title, children, onBack }: { title: string; children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-grid-pattern p-md text-on-background">
      <div className="mb-lg flex flex-col items-center select-none">
        <div className="material-symbols-outlined mb-sm text-display-lg text-primary" style={{ fontVariationSettings: `'FILL' 1` }}>fact_check</div>
        <h1 className="font-sans text-headline-md text-primary tracking-tight">InsightEngine</h1>
        <p className="mt-xs text-body-sm uppercase tracking-[0.35rem] text-on-surface-variant">University Report Builder</p>
      </div>
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-xl">
        <button type="button" onClick={onBack} className="mb-lg flex items-center gap-sm text-label-md text-secondary hover:text-secondary-container"><ArrowLeft className="h-4 w-4" /> Back to sign in</button>
        <h2 className="text-headline-sm text-on-background">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function ForgotPinPage({ onBack }: { onBack: () => void }) {
  const [userId, setUserId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <AuthPageShell title="Reset your PIN" onBack={onBack}>
      <p className="mt-xs text-body-sm text-on-surface-variant">Enter your 5-digit User ID and we’ll send reset instructions to your registered email.</p>
      {submitted ? (
        <div className="mt-lg rounded border border-outline-variant bg-surface-container-low p-md text-body-sm text-on-surface-variant" role="status">If this User ID exists, reset instructions are on their way.</div>
      ) : (
        <form className="mt-lg flex flex-col gap-md" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
          <div className="flex flex-col gap-xs"><Label htmlFor="reset-user-id" className="text-label-md">5-Digit User ID</Label><Input id="reset-user-id" value={userId} required maxLength={5} inputMode="numeric" placeholder="Enter 5-digit User ID" onChange={(event) => setUserId(event.target.value.replace(/\D/g, '').slice(0, 5))} /></div>
          <Button type="submit" className="w-full">Send reset instructions</Button>
        </form>
      )}
    </AuthPageShell>
  );
}

function CreateAccountPage({ onBack }: { onBack: () => void }) {
  const { isLoaded, signUp } = useSignUp();
  const { signOut } = useClerk();
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [pin, setPin] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds === 0) return undefined;
    const timer = window.setInterval(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  const createAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoaded) return;
    setError('');
    setIsSending(true);
    try {
      await signUp.create({ username: clerkUsernameForUserId(userId), emailAddress: email, password: clerkPasswordForCredentials(userId, pin), unsafeMetadata: { userId } });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setNeedsVerification(true);
      setResendSeconds(30);
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : 'Unable to create your account.');
    } finally {
      setIsSending(false);
    }
  };

  const resendCode = async () => {
    if (!isLoaded || isSending || resendSeconds > 0) return;
    setError('');
    setIsSending(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setResendSeconds(30);
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : 'Unable to resend the verification code.');
    } finally {
      setIsSending(false);
    }
  };

  const verifyAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoaded) return;
    setError('');
    setIsSending(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });
      if (result.status === 'complete') {
        await signOut();
        onBack();
      }
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : 'That verification code is not valid.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AuthPageShell title="Create an account" onBack={onBack}>
      {clerkPublishableKey ? (
        needsVerification ? (
          <form className="mt-lg flex flex-col gap-md" onSubmit={verifyAccount}>
            <p className="text-body-sm text-on-surface-variant">Enter the verification code sent to {email}.</p>
            <div className="flex flex-col gap-xs"><Label htmlFor="verification-code" className="text-label-md">Verification code</Label><Input id="verification-code" required value={verificationCode} onChange={(event) => setVerificationCode(event.target.value)} /></div>
            {error ? <p role="alert" className="text-body-sm text-error">{error}</p> : null}
            {isSending ? <p className="text-body-sm text-on-surface-variant" role="status">Checking your code...</p> : null}
            <Button type="submit" className="w-full" disabled={!isLoaded || isSending}>Verify account</Button>
            <button type="button" onClick={resendCode} disabled={isSending || resendSeconds > 0} className="text-label-md text-secondary disabled:cursor-not-allowed disabled:text-on-surface-variant">{isSending ? 'Sending code...' : resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : 'Resend verification code'}</button>
          </form>
        ) : (
          <form className="mt-lg flex w-full flex-col gap-md" onSubmit={createAccount}>
            <div className="grid gap-md sm:grid-cols-2">
              <div className="flex flex-col gap-xs sm:col-span-2"><Label htmlFor="create-email" className="text-label-md">Email address</Label><Input id="create-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
              <div className="flex flex-col gap-xs"><Label htmlFor="create-user-id" className="text-label-md">5-Digit User ID</Label><Input id="create-user-id" required pattern="\d{5}" maxLength={5} inputMode="numeric" value={userId} onChange={(event) => setUserId(event.target.value.replace(/\D/g, '').slice(0, 5))} /></div>
              <div className="flex flex-col gap-xs"><Label htmlFor="create-pin" className="text-label-md">4-Digit PIN</Label><Input id="create-pin" required pattern="\d{4}" maxLength={4} inputMode="numeric" type="password" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))} /></div>
            </div>
            {error ? <p role="alert" className="text-body-sm text-error">{error}</p> : null}
            {isSending ? <p className="text-body-sm text-on-surface-variant" role="status">Sending your verification code...</p> : null}
            <Button type="submit" className="w-full" disabled={!isLoaded || isSending}>Create account</Button>
          </form>
        )
      ) : (
        <div className="mt-lg rounded border border-outline-variant bg-surface-container-low p-md text-body-sm text-on-surface-variant">Account creation is managed by Clerk. Add <span className="font-mono text-on-surface">VITE_CLERK_PUBLISHABLE_KEY</span> to your environment to enable sign up.</div>
      )}
    </AuthPageShell>
  );
}

function UtilityHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="mb-xl flex flex-col gap-md border-b border-outline-variant pb-lg sm:flex-row sm:items-center sm:justify-between">
      <div>
        <button type="button" onClick={onBack} className="mb-md flex items-center gap-sm text-label-md text-secondary hover:text-secondary-container">
          <ArrowLeft className="h-4 w-4" /> Back to Report Builder
        </button>
        <h2 className="text-headline-md text-on-surface">{title}</h2>
      </div>
    </div>
  );
}

function NotificationsPage({ onBack }: { onBack: () => void }) {
  const notifications = [
    { title: 'Report generation complete', detail: 'Student Success report is ready to download.', time: '12 minutes ago', unread: true, icon: Check },
    { title: 'Data source refreshed', detail: 'Student Information System data was updated successfully.', time: '2 hours ago', unread: true, icon: Database },
    { title: 'Scheduled maintenance', detail: 'Report services will be briefly unavailable tonight at 11:00 PM.', time: 'Yesterday', unread: false, icon: ShieldCheck },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl p-lg">
      <UtilityHeader title="Notifications" onBack={onBack} />
      <div className="mb-md flex items-center justify-between">
        <p className="text-body-sm text-on-surface-variant">Recent activity from your report workspace.</p>
        <button type="button" className="text-label-sm text-secondary hover:text-secondary-container">Mark all as read</button>
      </div>
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        {notifications.map(({ title, detail, time, unread, icon: Icon }, index) => (
          <div key={title} className={cn('flex gap-md p-lg', index > 0 && 'border-t border-outline-variant', unread && 'bg-secondary-fixed/30')}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-secondary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-xs sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-label-md text-on-surface">{title}</h3>
                <span className="text-label-sm text-on-surface-variant">{time}</span>
              </div>
              <p className="mt-xs text-body-sm text-on-surface-variant">{detail}</p>
            </div>
            {unread ? <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-secondary" aria-label="Unread" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage({ onBack, onAccount, onSignOut, user }: { onBack: () => void; onAccount: () => void; onSignOut: () => void; user: AccountUser | null | undefined }) {
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'Account user';
  return (
    <div className="mx-auto w-full max-w-4xl p-lg">
      <UtilityHeader title="Settings" onBack={onBack} />
      <div className="grid gap-lg lg:grid-cols-[1fr_1.25fr]">
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
          <h3 className="text-label-md text-on-surface">Account</h3>
          <div className="mt-lg flex items-center gap-md border-b border-outline-variant pb-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary">
              <span className="text-headline-sm">{displayName.slice(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-label-md text-on-surface">{displayName}</p>
              <p className="text-body-sm text-on-surface-variant">Institutional Reporting</p>
            </div>
          </div>
          <button type="button" onClick={onAccount} className="mt-lg text-label-md text-secondary hover:text-secondary-container">Manage account details</button>
        </section>

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
          <h3 className="text-label-md text-on-surface">Workspace Preferences</h3>
          <div className="mt-lg divide-y divide-outline-variant">
            <label className="flex items-center justify-between gap-md py-md first:pt-0">
              <span><span className="block text-label-md text-on-surface">Email notifications</span><span className="text-body-sm text-on-surface-variant">Receive updates about generated reports.</span></span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-secondary" />
            </label>
            <label className="flex items-center justify-between gap-md py-md">
              <span><span className="block text-label-md text-on-surface">Data refresh alerts</span><span className="text-body-sm text-on-surface-variant">Know when connected sources are updated.</span></span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-secondary" />
            </label>
            <label className="flex items-center justify-between gap-md py-md last:pb-0">
              <span><span className="block text-label-md text-on-surface">Compact report previews</span><span className="text-body-sm text-on-surface-variant">Use denser charts in the preview panel.</span></span>
              <input type="checkbox" className="h-4 w-4 accent-secondary" />
            </label>
          </div>
        </section>
      </div>
      <div className="mt-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
        <h3 className="text-label-md text-on-surface">Session</h3>
        <p className="mt-xs text-body-sm text-on-surface-variant">Sign out of this report workspace on the current device.</p>
        <Button variant="outline" className="mt-md" onClick={onSignOut}>Sign out</Button>
      </div>
    </div>
  );
}

function AccountPage({ onBack, user, profilePhotoUrl, onPhotoChange }: { onBack: () => void; user: AccountUser | null | undefined; profilePhotoUrl: string | null; onPhotoChange: (photoUrl: string) => void }) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [account, setAccount] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.primaryEmailAddress?.emailAddress || '' });
  const displayName = [account.firstName, account.lastName].filter(Boolean).join(' ') || user?.username || 'Account user';
  const profileImage = profilePhotoUrl || user?.imageUrl;

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onPhotoChange(URL.createObjectURL(file));
  };

  const cancelEditing = () => {
    setAccount({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.primaryEmailAddress?.emailAddress || '' });
    setIsEditing(false);
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-lg">
      <UtilityHeader title="Account Details" onBack={onBack} />
      <div className="grid gap-lg lg:grid-cols-[220px_1fr]">
        <section className="flex flex-col items-center rounded-xl border border-outline-variant bg-surface-container-lowest p-lg text-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary-container text-on-primary">
            {profileImage ? <img src={profileImage} alt={displayName} className="h-full w-full object-cover" /> : <span className="text-headline-md">{displayName.slice(0, 2).toUpperCase()}</span>}
          </div>
          <h3 className="mt-md text-label-md text-on-surface">{displayName}</h3>
          <p className="mt-xs text-body-sm text-on-surface-variant">Institutional Reporting</p>
          <input ref={photoInputRef} type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
          <button type="button" onClick={() => photoInputRef.current?.click()} className="mt-lg text-label-sm text-secondary hover:text-secondary-container">Change photo</button>
        </section>

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
          <div className="mb-lg flex items-center justify-between border-b border-outline-variant pb-md">
            <div>
              <h3 className="text-label-md text-on-surface">Personal information</h3>
              <p className="mt-xs text-body-sm text-on-surface-variant">Update the details associated with your reporting account.</p>
            </div>
            {isEditing ? (
              <div className="flex gap-sm">
                <Button variant="outline" size="sm" onClick={cancelEditing}>Cancel</Button>
                <Button size="sm" onClick={() => setIsEditing(false)}>Save</Button>
              </div>
            ) : <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>}
          </div>
          <div className="grid gap-lg sm:grid-cols-2">
            <div><Label className="text-label-sm text-on-surface-variant">First name</Label>{isEditing ? <Input value={account.firstName} onChange={(event) => setAccount({ ...account, firstName: event.target.value })} className="mt-xs" /> : <p className="mt-xs text-body-sm text-on-surface">{account.firstName}</p>}</div>
            <div><Label className="text-label-sm text-on-surface-variant">Last name</Label>{isEditing ? <Input value={account.lastName} onChange={(event) => setAccount({ ...account, lastName: event.target.value })} className="mt-xs" /> : <p className="mt-xs text-body-sm text-on-surface">{account.lastName}</p>}</div>
            <div><Label className="text-label-sm text-on-surface-variant">Email address</Label>{isEditing ? <Input type="email" value={account.email} onChange={(event) => setAccount({ ...account, email: event.target.value })} className="mt-xs" /> : <p className="mt-xs text-body-sm text-on-surface">{account.email}</p>}</div>
            <div><p className="text-label-sm text-on-surface-variant">User ID</p><p className="mt-xs text-body-sm text-on-surface">{String(user?.unsafeMetadata?.userId || user?.username?.replace(/^id_/, '') || 'Not assigned')}</p></div>
            <div className="sm:col-span-2"><p className="text-label-sm text-on-surface-variant">Role</p><p className="mt-xs text-body-sm text-on-surface">{String(user?.publicMetadata?.role || 'Report Administrator')}</p></div>
          </div>
        </section>
      </div>
      <section className="mt-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
        <h3 className="text-label-md text-on-surface">Access and security</h3>
        <div className="mt-md flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-body-sm text-on-surface">Multi-factor authentication</p><p className="mt-xs text-body-sm text-on-surface-variant">Enabled for this account</p></div>
          <span className="inline-flex w-fit items-center gap-xs rounded bg-secondary-fixed px-sm py-xs text-label-sm text-on-secondary-fixed"><ShieldCheck className="h-4 w-4" /> Protected</span>
        </div>
      </section>
    </div>
  );
}

function ReportOverview({ page }: { page: ReportPageName }) {
  const data = reportPageData[page];

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-lg overflow-y-auto p-lg">
      <div className="flex flex-col gap-lg">
        <div className="flex flex-col justify-between gap-md sm:flex-row sm:items-end">
          <div>
            <p className="mb-xs text-label-sm uppercase tracking-wider text-secondary">Report Category</p>
            <h2 className="text-headline-md text-on-surface">{page}</h2>
            <p className="mt-xs max-w-2xl text-body-sm text-on-surface-variant">{data.description}</p>
          </div>
          <Button className="shrink-0 gap-sm"><ChartColumn className="h-4 w-4" />{data.action}</Button>
        </div>

        <div className="grid grid-cols-1 gap-md md:grid-cols-3">
          {data.metrics.map(([label, value, detail]) => (
            <div key={label} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
              <p className="text-label-sm text-on-surface-variant">{label}</p>
              <p className="mt-sm text-headline-md text-primary">{value}</p>
              <p className="mt-xs text-body-sm text-secondary">{detail}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-lg xl:grid-cols-2">
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
            <div className="mb-md">
              <h3 className="text-label-md text-on-surface">Six-Month Trend</h3>
              <p className="mt-xs text-body-sm text-on-surface-variant">Monthly activity across the selected category.</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend}>
                  <defs>
                    <linearGradient id="reportTrendFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#0058be" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0058be" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e0e3e5" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#45464d', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#45464d', fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#0058be" fill="url(#reportTrendFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
            <div className="mb-md">
              <h3 className="text-label-md text-on-surface">Performance by Group</h3>
              <p className="mt-xs text-body-sm text-on-surface-variant">Current activity compared across departments.</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categories}>
                  <CartesianGrid stroke="#e0e3e5" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#45464d', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#45464d', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#2170e4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => window.location.pathname === dashboardPath);
  const [authPage, setAuthPage] = useState<AuthPage>(() => window.location.pathname === forgotPinPath ? 'forgot' : window.location.pathname === createAccountPath ? 'create' : 'login');

  useEffect(() => {
    // Keep unauthenticated routes on the login screen.
    const allowedPaths = [dashboardPath, loginPath, forgotPinPath, createAccountPath];
    if (!allowedPaths.includes(window.location.pathname)) {
      window.history.replaceState({}, '', loginPath);
    }

    const handlePopState = () => {
      setIsLoggedIn(window.location.pathname === dashboardPath);
      setAuthPage(window.location.pathname === forgotPinPath ? 'forgot' : window.location.pathname === createAccountPath ? 'create' : 'login');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [activeReport, setActiveReport] = useState<ReportPageName | 'Student Success'>('Student Success');
  const [utilityPage, setUtilityPage] = useState<UtilityPage>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Secure Connection Established. Multi-factor authentication routing enabled.');
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();

  useEffect(() => {
    if (authLoaded && isSignedIn && window.location.pathname !== dashboardPath) {
      window.location.assign(dashboardPath);
    }
  }, [authLoaded, isSignedIn]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', pin: '' },
  });

  const pinValue = watch('pin') || '';

  const onSubmit = async (values: LoginValues) => {
    if (!clerkPublishableKey) {
      setStatusMessage('Authentication is not configured. Add a Clerk publishable key to continue.');
      return;
    }
    if (!signInLoaded) {
      setStatusMessage('Connecting to authentication service...');
      return;
    }
    setStatusMessage('Checking your credentials...');
    try {
      const result = await signIn.create({ identifier: clerkUsernameForUserId(values.username), password: clerkPasswordForCredentials(values.username, values.pin) });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        window.location.assign(dashboardPath);
      } else {
        setStatusMessage('Additional verification is required to finish signing in.');
      }
    } catch (loginError) {
      const clerkError = loginError as { errors?: Array<{ code?: string; message?: string }> };
      const errorDetail = clerkError.errors?.[0];
      if (errorDetail?.code === 'form_identifier_not_allowed' || errorDetail?.message?.toLowerCase().includes('identifier is invalid')) {
        setStatusMessage('Clerk Username sign-in is disabled. Enable Username under Clerk Dashboard > User & Authentication > Identifiers.');
      } else {
        setStatusMessage(errorDetail?.message || (loginError instanceof Error ? loginError.message : 'The User ID or PIN is incorrect.'));
      }
    }
  };

  const openAuthPage = (page: AuthPage) => {
    const path = page === 'forgot' ? forgotPinPath : page === 'create' ? createAccountPath : loginPath;
    window.history.pushState({}, '', path);
    setAuthPage(page);
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      {!isLoggedIn && authPage === 'forgot' ? (
        <ForgotPinPage onBack={() => openAuthPage('login')} />
      ) : !isLoggedIn && authPage === 'create' ? (
        <CreateAccountPage onBack={() => openAuthPage('login')} />
      ) : !isLoggedIn ? (
        <div className="flex min-h-screen flex-col items-center justify-center bg-grid-pattern p-md text-on-background">
          <div className="mb-lg flex flex-col items-center select-none">
            <div className="material-symbols-outlined mb-sm text-display-lg text-primary" style={{ fontVariationSettings: `'FILL' 1` }}>
              fact_check
            </div>
            <h1 className="font-sans text-headline-md text-primary tracking-tight">InsightEngine</h1>
            <p className="mt-xs text-body-sm uppercase tracking-[0.35rem] text-on-surface-variant">University Report Builder</p>
          </div>

          <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-xl">
            <div className="border-b border-outline-variant pb-md">
              <h2 className="mb-xs text-headline-sm text-on-background">Authentication Required</h2>
              <p className="text-body-sm text-on-surface-variant">Please enter your credentials to access the data synthesis alpha environment.</p>
            </div>

            <form className="mt-lg flex flex-col gap-md" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="flex flex-col gap-xs group">
                <Label htmlFor="username" className="text-label-md text-on-background transition-colors group-focus-within:text-secondary">
                    5-Digit User ID
                </Label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">person</span>
                  <Input
                    id="username"
                    aria-invalid={Boolean(errors.username)}
                    aria-describedby="username-error"
                    autoComplete="username"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="Enter 5-digit User ID"
                    className={cn('pl-xl', errors.username && 'border-error')}
                    {...register('username', {
                      onChange: (e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                        setValue('username', value, { shouldValidate: true, shouldDirty: true });
                      },
                    })}
                  />
                  {errors.username ? (
                    <p id="username-error" role="alert" className="mt-1 text-body-sm text-error">
                      {errors.username.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-xs group">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pin" className="text-label-md text-on-background transition-colors group-focus-within:text-secondary">
                    4-Digit PIN
                  </Label>
                  <button type="button" onClick={() => openAuthPage('forgot')} className="text-label-sm text-secondary hover:text-secondary-container focus:outline-none focus:underline">
                    Forgot PIN?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">dialpad</span>
                  <Input
                    id="pin"
                    type="password"
                    aria-invalid={Boolean(errors.pin)}
                    aria-describedby="pin-error"
                    autoComplete="current-password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    className={cn('pl-xl font-mono tracking-[0.5em]', errors.pin && 'border-error')}
                    {...register('pin', {
                      onChange: (e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setValue('pin', value, { shouldValidate: true, shouldDirty: true });
                      },
                    })}
                  />
                  {errors.pin ? (
                    <p id="pin-error" role="alert" className="mt-1 text-body-sm text-error">
                      {errors.pin.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-xs flex items-start gap-sm rounded border border-outline-variant bg-surface-container-low p-sm">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: `'FILL' 1` }}>
                  shield_lock
                </span>
                <p aria-live="polite" className="text-body-sm leading-tight text-on-surface-variant">
                  {statusMessage}
                </p>
              </div>

              <Button type="submit" className="mt-sm w-full justify-center gap-sm py-md text-label-md" size="lg">
                Sign In
                <span className="material-symbols-outlined">login</span>
              </Button>
              <button type="button" onClick={() => openAuthPage('create')} className="text-center text-label-md text-secondary hover:text-secondary-container">Create an account</button>
            </form>
          </div>

          <div className="mt-xl flex select-none gap-lg text-body-sm text-on-surface-variant">
            <button type="button" className="hover:text-primary focus:outline-none focus:underline" onClick={() => setStatusMessage('All report services are operational.')}>System Status</button>
            <span>•</span>
            <button type="button" className="hover:text-primary focus:outline-none focus:underline" onClick={() => setStatusMessage('IT Support is available for account access assistance.')}>IT Support</button>
          </div>
        </div>
      ) : (
        <div className="flex h-screen overflow-hidden bg-background">
          <nav className="hidden h-screen w-64 flex-col border-r border-outline-variant bg-surface-container-low p-md md:flex">
            <div className="mb-xl flex items-center gap-sm px-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary">
                <span className="material-symbols-outlined text-[18px]">account_balance</span>
              </div>
              <div>
                <h1 className="text-headline-sm text-primary">Enterprise Reports</h1>
                <p className="text-label-sm text-on-surface-variant">Data Synthesis Alpha</p>
              </div>
            </div>

            <div className="flex-1 space-y-xs overflow-y-auto">
              <p className="mb-sm mt-md px-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Report Categories</p>
              {navItems.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveReport(label as ReportPageName | 'Student Success')}
                  className={`flex w-full items-center gap-md rounded-lg px-sm py-sm text-left transition-all ${activeReport === label ? 'bg-secondary-fixed text-on-secondary-fixed' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-label-md">{label}</span>
                </button>
              ))}
            </div>

            <div className="mt-auto border-t border-outline-variant pt-md">
              <button type="button" className="flex w-full items-center gap-md rounded-lg px-sm py-sm text-on-surface-variant hover:bg-surface-container-highest">
                <HelpCircle className="h-5 w-5" />
                <span className="text-label-md">Help Center</span>
              </button>
            </div>
          </nav>

          <div className="flex flex-1 flex-col">
            <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-lg">
              <div className="flex items-center gap-md md:hidden">
                <button type="button" className="text-on-surface-variant">
                  <Menu className="h-5 w-5" />
                </button>
                <span className="text-headline-md font-bold text-primary">InsightEngine</span>
              </div>

              <div className="hidden md:block">
                <span className="text-label-md text-on-surface-variant">Report Builder / {activeReport}</span>
              </div>

              <div className="flex items-center gap-md">
                <button type="button" aria-label="Open notifications" onClick={() => setUtilityPage('notifications')} className={cn('rounded-full p-sm text-on-surface-variant hover:bg-surface-container-low', utilityPage === 'notifications' && 'bg-surface-container-low text-secondary')}>
                  <Bell className="h-5 w-5" />
                </button>
                <button type="button" aria-label="Open settings" onClick={() => setUtilityPage('settings')} className={cn('rounded-full p-sm text-on-surface-variant hover:bg-surface-container-low', utilityPage === 'settings' && 'bg-surface-container-low text-secondary')}>
                  <Settings className="h-5 w-5" />
                </button>
                <div className="ml-sm flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-primary-container">
                  {profilePhotoUrl || user?.imageUrl ? <img alt="User profile" src={profilePhotoUrl || user?.imageUrl} className="h-full w-full object-cover" /> : <span className="text-label-sm text-on-primary">{user?.firstName?.[0] || user?.username?.[0] || 'U'}</span>}
                </div>
              </div>
            </header>

            <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-lg overflow-y-auto p-lg lg:flex-row">
              {utilityPage === 'notifications' ? (
                <NotificationsPage onBack={() => setUtilityPage(null)} />
              ) : utilityPage === 'settings' ? (
                <SettingsPage onBack={() => setUtilityPage(null)} onAccount={() => setUtilityPage('account')} onSignOut={async () => { await signOut(); window.history.pushState({}, '', loginPath); setIsLoggedIn(false); setUtilityPage(null); setAuthPage('login'); }} user={user} />
              ) : utilityPage === 'account' ? (
                <AccountPage onBack={() => setUtilityPage('settings')} user={user} profilePhotoUrl={profilePhotoUrl} onPhotoChange={setProfilePhotoUrl} />
              ) : activeReport === 'Student Success' ? (
                <>
              <section className="flex max-w-3xl flex-1 flex-col gap-lg">
                <div>
                  <h2 className="mb-xs text-headline-md text-on-surface">Build Custom Report</h2>
                  <p className="text-body-sm text-on-surface-variant">Configure data sources, parameters, and metrics to generate a comprehensive analysis.</p>
                </div>

                <div className="mb-sm flex items-center gap-sm">
                  <div className="h-2 flex-1 rounded-full bg-primary" />
                  <div className="h-2 flex-1 rounded-full bg-primary" />
                  <div className="h-2 flex-1 rounded-full bg-surface-container-high" />
                </div>

                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
                  <div className="mb-md flex items-center gap-sm">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-medium text-on-primary">1</div>
                    <h3 className="text-label-md text-on-surface">Select Data Module</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
                    <label className="relative flex cursor-pointer rounded-lg border border-secondary bg-surface-container-lowest p-md hover:bg-surface-bright focus:outline-none">
                      <input defaultChecked type="radio" name="data_module" className="peer sr-only" />
                      <span className="flex flex-col">
                        <span className="flex items-center gap-sm text-label-md text-on-surface">
                          <Database className="h-5 w-5 text-secondary" /> Student Info System
                        </span>
                        <span className="mt-xs text-body-sm text-on-surface-variant">Core demographic, enrollment, and grading data.</span>
                      </span>
                      <span aria-hidden="true" className="pointer-events-none absolute -inset-px rounded-lg border-2 border-secondary peer-checked:border-secondary" />
                    </label>

                    <label className="relative flex cursor-pointer rounded-lg border border-outline-variant bg-surface-container-lowest p-md hover:bg-surface-bright focus:outline-none">
                      <input type="radio" name="data_module" className="peer sr-only" />
                      <span className="flex flex-col">
                        <span className="flex items-center gap-sm text-label-md text-on-surface">
                          <Building2 className="h-5 w-5 text-on-surface-variant" /> Learning Management
                        </span>
                        <span className="mt-xs text-body-sm text-on-surface-variant">Course engagement, assignment completion, login metrics.</span>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
                  <div className="mb-md flex items-center gap-sm">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-medium text-on-primary">2</div>
                    <h3 className="text-label-md text-on-surface">Define Parameters</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                    <div className="flex flex-col gap-xs">
                      <Label className="text-label-md text-on-surface">Academic Year</Label>
                      <select className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary">
                        <option>2023 - 2024</option>
                        <option>2022 - 2023</option>
                        <option>2021 - 2022</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-xs">
                      <Label className="text-label-md text-on-surface">Semester</Label>
                      <select className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary">
                        <option>First Semester</option>
                        <option>Second Semester</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-xs md:col-span-2">
                      <Label className="text-label-md text-on-surface">College / Department</Label>
                      <select className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary">
                        {Object.entries(universityUnits).map(([college, units]) => (
                          <optgroup key={college} label={college}>
                            <option value={college}>{college}</option>
                            {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              <aside className="flex w-full shrink-0 flex-col gap-md lg:w-[450px]">
                <div className="flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
                  <div className="flex items-center justify-between border-b border-outline-variant bg-surface-bright p-md">
                    <h3 className="flex items-center gap-xs text-label-md text-on-surface">
                      <ChartColumn className="h-4 w-4" /> Live Preview
                    </h3>
                    <span className="rounded bg-tertiary-fixed-dim px-2 py-1 text-[10px] text-on-tertiary-fixed-variant">DRAFT</span>
                  </div>

                  <div className="flex flex-1 items-center justify-center bg-surface-bright p-md">
                    <div className="max-w-xs text-center">
                      <ChartColumn className="mx-auto mb-md h-10 w-10 text-primary opacity-75" />
                      <p className="text-body-sm text-on-surface">Generating Preview...</p>
                      <p className="mt-xs text-body-sm text-on-surface-variant">Complete parameter selection to visualize data structure.</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-sm border-t border-outline-variant bg-surface-container-lowest p-md">
                    <Button variant="outline">Save Draft</Button>
                    <Button>Generate Report</Button>
                  </div>
                </div>
              </aside>
                </>
              ) : (
                <ReportOverview page={activeReport} />
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
