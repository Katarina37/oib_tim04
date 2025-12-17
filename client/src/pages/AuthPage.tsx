import React, { useState } from 'react';
import { isAxiosError } from 'axios';
import { Droplets, User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuthHook';
import { useServices } from '../contexts/ServiceContext';
import { LoginUserDTO } from '../models/auth/LoginUserDTO';
import { RegistrationUserDTO } from '../models/auth/RegistrationUserDTO';
import { UserRole } from '../enums/UserRole';
import { AuthResponseType } from '../types/AuthResponseType';

type AuthFormData = {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

const parseApiErrorMessage = (error: unknown): string | null => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? null;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return null;
};

export const AuthPage: React.FC = () => {
  const { login } = useAuth();
  const { authAPI } = useServices();
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState<AuthFormData>({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    role: UserRole.SELLER,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'role') {
      setFormData(prev => ({ ...prev, role: value as UserRole }));
    } else {
      const field = name as Exclude<keyof AuthFormData, 'role'>;
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const handleLoginResponse = (response: AuthResponseType, fallbackMessage: string) => {
      if (response.success && response.token) {
        login(response.token);
        return;
      }

      setError(response.message || fallbackMessage);
    };

    const handleRegisterResponse = (response: AuthResponseType, fallbackMessage: string) => {
      if (response.success) {
        setIsRegister(false);
        setFormData(prev => ({
          ...prev,
          password: '',
          email: '',
          firstName: '',
          lastName: '',
          role: UserRole.SELLER,
        }));
        setSuccess('Registracija je uspesna. Prijavite se rucno.');
        return;
      }

      setError(response.message || fallbackMessage);
    };

    try {
      if (isRegister) {
        const trimmedFirstName = formData.firstName.trim();
        const trimmedLastName = formData.lastName.trim();

        if (!trimmedFirstName || !trimmedLastName) {
          setError('Ime i prezime su obavezni.');
          return;
        }

        setIsLoading(true);
        const registerData: RegistrationUserDTO = {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          role: formData.role,
          profileImage: '',
        };
        const response = await authAPI.register(registerData);
        handleRegisterResponse(response, 'Registracija nije uspela. Pokusajte ponovo.');
      } else {
        setIsLoading(true);
        const loginData: LoginUserDTO = {
          username: formData.username,
          password: formData.password,
        };
        const response = await authAPI.login(loginData);
        handleLoginResponse(response, 'Pogresno korisnicko ime ili lozinka.');
      }
    } catch (err) {
      const apiMessage = parseApiErrorMessage(err);
      setError(apiMessage ?? 'Doslo je do greske. Pokusajte ponovo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError(null);
    setSuccess(null);
    setFormData({
      username: '',
      password: '',
      email: '',
      firstName: '',
      lastName: '',
      role: UserRole.SELLER,
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-card__logo">
          <div className="auth-card__logo-icon">
            <Droplets size={28} />
          </div>
          <span className="auth-card__logo-text">O'Sinjel De Or</span>
        </div>

        {/* Title */}
        <h1 className="auth-card__title">
          {isRegister ? 'Kreirajte nalog' : 'Dobrodosli nazad'}
        </h1>
        <p className="auth-card__subtitle">
          {isRegister
            ? 'Popunite formu da biste kreirali nalog'
            : 'Prijavite se na vas nalog'}
        </p>

        {/* Error Message */}
        {error && (
          <div className="auth-form__error">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="auth-form__success">
            {success}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Username */}
          <div className="input-group">
            <label className="input-group__label" htmlFor="username">
              Korisnicko ime
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)'
                }}
              />
              <input
                type="text"
                id="username"
                name="username"
                className="input"
                placeholder="Unesite korisnicko ime"
                value={formData.username}
                onChange={handleChange}
                required
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          {/* Email (only for registration) */}
          {isRegister && (
            <div className="input-group">
              <label className="input-group__label" htmlFor="email">
                Email adresa
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)'
                  }}
                />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="input"
                  placeholder="Unesite email adresu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
          )}

          {/* First Name + Last Name (only for registration) */}
          {isRegister && (
            <div className="grid grid--2 gap-md">
              <div className="input-group">
                <label className="input-group__label" htmlFor="firstName">
                  Ime
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)'
                    }}
                  />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="input"
                    placeholder="Unesite ime"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-group__label" htmlFor="lastName">
                  Prezime
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)'
                    }}
                  />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="input"
                    placeholder="Unesite prezime"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Password */}
          <div className="input-group">
            <label className="input-group__label" htmlFor="password">
              Lozinka
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)'
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="input"
                placeholder="Unesite lozinku"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Role (only for registration) */}
          {isRegister && (
            <div className="input-group">
              <label className="input-group__label" htmlFor="role">
                Uloga
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)'
                  }}
                />
                <select
                  id="role"
                  name="role"
                  className="input select"
                  value={formData.role}
                  onChange={handleChange}
                  style={{ paddingLeft: '40px' }}
                >
                  <option value={UserRole.SELLER}>Prodavac</option>
                  <option value={UserRole.SALES_MANAGER}>Menadzer prodaje</option>
                  <option value={UserRole.ADMIN}>Administrator</option>
                </select>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn--primary btn--lg"
            disabled={isLoading}
            style={{ width: '100%', marginTop: 'var(--space-sm)' }}
          >
            {isLoading
              ? (isRegister ? 'Kreiranje naloga...' : 'Prijavljivanje...')
              : (isRegister ? 'Kreiraj nalog' : 'Prijavi se')}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="auth-form__footer">
          {isRegister ? (
            <>
              Vec imate nalog?{' '}
              <button
                type="button"
                className="auth-form__link"
                onClick={toggleMode}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Prijavite se
              </button>
            </>
          ) : (
            <>
              Nemate nalog?{' '}
              <button
                type="button"
                className="auth-form__link"
                onClick={toggleMode}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Registrujte se
              </button>
            </>
          )}
        </div>
      </div>

      {/* Info Panel */}
      <div className="auth-info" style={{
        position: 'fixed',
        bottom: 'var(--space-lg)',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 'var(--space-lg)',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--color-text-muted)',
      }}>
        <span>Parfumerija O'Sinjel De Or Ac 2025</span>
        <span>|</span>
        <span>Verzija sistema: 1.0.0</span>
      </div>
    </div>
  );
};

export default AuthPage;
