import { useCallback, useEffect, useState } from "react";
import { useServices } from "../contexts/ServiceContext";
import { useAuth } from "./useAuthHook";
import { UserDTO } from "../models/users/UserDTO";
import { UpdateCurrentUserPayload } from "../api/users/IUserAPI";

type ApiErrorPayload = {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
};

export type UserProfileFormState = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  password: string;
  confirmPassword: string;
};

const EMPTY_FORM: UserProfileFormState = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  profileImage: "",
  password: "",
  confirmPassword: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const payload = error as ApiErrorPayload;
  return payload.response?.data?.message ?? payload.response?.data?.error ?? payload.message ?? fallback;
};

const mapUserToForm = (user: UserDTO): UserProfileFormState => ({
  username: user.username ?? "",
  email: user.email ?? "",
  firstName: user.firstName ?? "",
  lastName: user.lastName ?? "",
  profileImage: user.profileImage ?? "",
  password: "",
  confirmPassword: "",
});

export const useUserProfile = () => {
  const { token, updateUserClaims } = useAuth();
  const { userAPI } = useServices();

  const [profile, setProfile] = useState<UserDTO | null>(null);
  const [formState, setFormState] = useState<UserProfileFormState>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!token) {
      setProfile(null);
      setFormState(EMPTY_FORM);
      setErrorMessage("Niste ulogovani.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const currentUser = await userAPI.getCurrentUser(token);
      setProfile(currentUser);
      setFormState(mapUserToForm(currentUser));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Neuspesno ucitavanje korisnickog profila."));
    } finally {
      setIsLoading(false);
    }
  }, [token, userAPI]);

  const clearMessages = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const updateField = useCallback(<K extends keyof UserProfileFormState>(key: K, value: UserProfileFormState[K]) => {
    setFormState((previous) => ({
      ...previous,
      [key]: value,
    }));
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const saveProfile = useCallback(async () => {
    if (!token) {
      setErrorMessage("Niste ulogovani.");
      return false;
    }

    const username = formState.username.trim();
    const email = formState.email.trim();
    const firstName = formState.firstName.trim();
    const lastName = formState.lastName.trim();
    const profileImage = formState.profileImage.trim();
    const password = formState.password.trim();
    const confirmPassword = formState.confirmPassword.trim();

    if (username.length < 3) {
      setErrorMessage("Korisnicko ime mora imati najmanje 3 karaktera.");
      return false;
    }

    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage("Email nije validan.");
      return false;
    }

    if (!firstName) {
      setErrorMessage("Ime je obavezno.");
      return false;
    }

    if (!lastName) {
      setErrorMessage("Prezime je obavezno.");
      return false;
    }

    if (password) {
      if (password.length < 6) {
        setErrorMessage("Lozinka mora imati najmanje 6 karaktera.");
        return false;
      }

      if (password !== confirmPassword) {
        setErrorMessage("Lozinka i potvrda lozinke se ne poklapaju.");
        return false;
      }
    }

    const payload: UpdateCurrentUserPayload = {
      username,
      email,
      firstName,
      lastName,
      profileImage,
      password: password || undefined,
    };

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedUser = await userAPI.updateCurrentUser(token, payload);
      setProfile(updatedUser);
      setFormState(mapUserToForm(updatedUser));
      updateUserClaims({
        username: updatedUser.username,
        firstName: updatedUser.firstName ?? undefined,
        lastName: updatedUser.lastName ?? undefined,
        profileImage: updatedUser.profileImage ?? "",
      });
      setSuccessMessage("Profil je uspesno sacuvan.");
      return true;
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Neuspesno cuvanje korisnickog profila."));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [formState, token, updateUserClaims, userAPI]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return {
    profile,
    formState,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    loadProfile,
    saveProfile,
    updateField,
    clearMessages,
  };
};
