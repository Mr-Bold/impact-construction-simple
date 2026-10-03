import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { signInAdmin } from '../services/auth';
import { useSettings } from '../context/SettingsContext';

export default function AdminLogin() {
	const navigate = useNavigate();
	const location = useLocation();
	const settings = useSettings();
	const [values, setValues] = useState({ email: '', password: '' });
	const [error, setError] = useState(location.state?.message || '');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const update = (event) => {
		setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
	};

	const submit = async (event) => {
		event.preventDefault();
		setError('');
		setIsSubmitting(true);
		try {
			await signInAdmin(values.email.trim(), values.password);
			navigate('/admin/dashboard', { replace: true });
		} catch (requestError) {
			const message = requestError.message || '';
			if (/invalid login credentials/i.test(message)) setError('That email and password do not match. Check them and try again.');
			else if (/email not confirmed/i.test(message)) setError('Confirm your email address before signing in.');
			else if (/fetch|network|failed to fetch/i.test(message)) setError('Could not reach the sign-in service. Check your connection and try again.');
			else setError(message || 'Sign-in failed. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="admin-login">
			<div className="admin-login-card">
				<Link to="/" className="admin-login-brand">
					{settings.logo_url ? <img src={settings.logo_url} alt={settings.company_name} /> : <span className="logo-mark">I</span>}
					<span>{settings.company_name}<small>CONSTRUCTION</small></span>
				</Link>
				<span className="login-icon"><LockKeyhole size={20} /></span>
				<p className="eyebrow">Impact workspace</p>
				<h1>Welcome<br /><em>back.</em></h1>
				<p className="admin-login-intro">Sign in with your administrator account to manage the portfolio.</p>
				<form onSubmit={submit} aria-busy={isSubmitting}>
					<label htmlFor="admin-email">Email
						<input id="admin-email" type="email" name="email" autoComplete="username" required value={values.email} onChange={update} placeholder="you@impactconstruction.co" disabled={isSubmitting} />
					</label>
					<label htmlFor="admin-password">Password
						<span className="admin-password-control">
							<input id="admin-password" type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" required value={values.password} onChange={update} placeholder="Enter your password" disabled={isSubmitting} />
							<button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} disabled={isSubmitting}>
								{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
							</button>
						</span>
					</label>
					{error && <p className="form-error" role="alert">{error}</p>}
					<button className="solid-button dark-button" disabled={isSubmitting}>
						{isSubmitting ? 'Signing in…' : 'Sign in'} <ArrowUpRight size={16} />
					</button>
				</form>
				<Link to="/">Return to public site</Link>
			</div>
		</main>
	);
}
