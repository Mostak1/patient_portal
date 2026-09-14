import { authState, clearSession, isSessionValid, login, logout } from '../services/portalApi'

export function usePatientAuth() {
  return {
    authState,
    isSessionValid,
    login,
    logout,
    clearSession,
  }
}
