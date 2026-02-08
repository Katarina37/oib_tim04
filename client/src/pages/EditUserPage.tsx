import React, { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Camera, RefreshCw, Save, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "../hooks/useUserProfile";
import { useAuth } from "../hooks/useAuthHook";
import "./EditUserPage.css";

const MAX_PROFILE_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

const getRoleLabel = (role?: string): string => {
  switch ((role ?? "").toLowerCase()) {
    case "admin":
      return "Administrator";
    case "seller":
      return "Prodavac";
    case "sales_manager":
      return "Menadžer prodaje";
    default:
      return role ?? "";
  }
};

const getInitials = (firstName: string, lastName: string, username: string): string => {
  const normalizedFirst = firstName.trim();
  const normalizedLast = lastName.trim();

  if (normalizedFirst && normalizedLast) {
    return `${normalizedFirst[0]}${normalizedLast[0]}`.toUpperCase();
  }

  const normalizedUsername = username.trim();
  if (!normalizedUsername) {
    return "US";
  }

  return normalizedUsername.slice(0, 2).toUpperCase();
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Neuspešno čitanje slike."));
    reader.readAsDataURL(file);
  });

export const EditUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    profile,
    formState,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    loadProfile,
    saveProfile,
    updateField,
  } = useUserProfile();

  const [imageError, setImageError] = useState<string | null>(null);

  const initials = useMemo(
    () => getInitials(formState.firstName, formState.lastName, formState.username),
    [formState.firstName, formState.lastName, formState.username]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const passwordChanged = formState.password.trim().length > 0;
    const isSaved = await saveProfile();

    if (isSaved && passwordChanged) {
      logout();
      navigate("/auth", { replace: true });
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    setImageError(null);

    if (!selectedFile.type.startsWith("image/")) {
      setImageError("Dozvoljeno je otpremanje samo slika.");
      return;
    }

    if (selectedFile.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      setImageError("Slika mora biti manja od 2MB.");
      return;
    }

    try {
      const encodedImage = await readFileAsDataUrl(selectedFile);
      updateField("profileImage", encodedImage);
    } catch {
      setImageError("Neuspešno učitavanje slike.");
    } finally {
      event.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setImageError(null);
    updateField("profileImage", "");
  };

  if (isLoading) {
    return (
      <div className="edit-user-page">
        <div className="empty-state">
          <div className="spinner" />
          <p className="mt-md text-muted">čitavanje korisničkog profila...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-user-page">
      <div className="page-header">
        <h1 className="page-header__title">Moj profil</h1>
        <p className="page-header__subtitle">Uređivanje podataka naloga i profilne slike</p>
      </div>

      <div className="edit-user-grid">
        <div className="card edit-user-avatar-card">
          <div className="card__header">
            <h2 className="card__title">Profilna slika</h2>
          </div>
          <div className="card__body edit-user-avatar-content">
            <div className="edit-user-avatar-preview">
              {formState.profileImage ? (
                <img src={formState.profileImage} alt="Profilna slika" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="edit-user-role-chip">
              <Shield size={14} />
              <span>{getRoleLabel(profile?.role)}</span>
            </div>

            <label className="btn btn--secondary edit-user-upload-button" htmlFor="profile-image-input">
              <Camera size={16} />
              Izaberi sliku
            </label>
            <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              onChange={(event) => void handleImageChange(event)}
              className="edit-user-file-input"
            />

            <button
              type="button"
              className="btn btn--outline edit-user-remove-button"
              onClick={handleRemoveImage}
              disabled={!formState.profileImage}
            >
              Ukloni sliku
            </button>

            <p className="edit-user-avatar-hint">Dozvoljeni formati: JPG, PNG, WEBP (maksimalno 2MB)</p>
            {imageError && <p className="edit-user-feedback edit-user-feedback--error">{imageError}</p>}
          </div>
        </div>

        <form className="card" onSubmit={handleSubmit}>
          <div className="card__header">
            <h2 className="card__title">Podaci korisnika</h2>
          </div>

          <div className="card__body edit-user-form">
            <div className="edit-user-form-grid">
              <div className="input-group">
                <label className="input-group__label" htmlFor="profile-username">
                  Korisničko ime
                </label>
                <input
                  id="profile-username"
                  className="input"
                  type="text"
                  value={formState.username}
                  onChange={(event) => updateField("username", event.target.value)}
                  required
                  minLength={3}
                />
              </div>

              <div className="input-group">
                <label className="input-group__label" htmlFor="profile-email">
                  Email
                </label>
                <input
                  id="profile-email"
                  className="input"
                  type="email"
                  value={formState.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="edit-user-form-grid">
              <div className="input-group">
                <label className="input-group__label" htmlFor="profile-first-name">
                  Ime
                </label>
                <input
                  id="profile-first-name"
                  className="input"
                  type="text"
                  value={formState.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-group__label" htmlFor="profile-last-name">
                  Prezime
                </label>
                <input
                  id="profile-last-name"
                  className="input"
                  type="text"
                  value={formState.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="edit-user-form-grid">
              <div className="input-group">
                <label className="input-group__label" htmlFor="profile-password">
                  Nova lozinka (opciono)
                </label>
                <input
                  id="profile-password"
                  className="input"
                  type="password"
                  value={formState.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <div className="input-group">
                <label className="input-group__label" htmlFor="profile-password-confirm">
                  Potvrda lozinke
                </label>
                <input
                  id="profile-password-confirm"
                  className="input"
                  type="password"
                  value={formState.confirmPassword}
                  onChange={(event) => updateField("confirmPassword", event.target.value)}
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {(errorMessage || successMessage) && (
              <div
                className={`edit-user-feedback ${
                  errorMessage ? "edit-user-feedback--error" : "edit-user-feedback--success"
                }`}
              >
                {errorMessage ?? successMessage}
              </div>
            )}

            <div className="edit-user-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => void loadProfile()}
                disabled={isSaving}
              >
                <RefreshCw size={16} />
                Vrati
              </button>

              <button type="submit" className="btn btn--primary" disabled={isSaving}>
                <Save size={16} />
                {isSaving ? "Čuvanje..." : "Sačuvaj"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserPage;
