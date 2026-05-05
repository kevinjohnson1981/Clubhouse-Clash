import React, { useState } from 'react';
import { auth } from './firebase';
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';

function Login({ onLogin, onJoinWithCode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [eventCode, setEventCode] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const [loginError, setLoginError] = useState('');

  const closeModal = () => {
    setActiveModal(null);
    setLoginError('');
    setSignupComplete(false);
    setIsSignup(false);
  };

  const openJoinModal = () => {
    setLoginError('');
    setSignupComplete(false);
    setActiveModal('join');
  };

  const openCreateModal = () => {
    setLoginError('');
    setSignupComplete(false);
    setIsSignup(false);
    setActiveModal('create');
  };

  const handleAuth = async () => {
    setLoginError('');

    try {
      let userCredential;

      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        await setDoc(doc(db, "admins", newUser.uid), {
          email: newUser.email,
          createdAt: new Date().toISOString()
        });

        await sendEmailVerification(newUser);
        setSignupComplete(true);
        setIsSignup(false);
        return;
      }

      userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        setLoginError("Please verify your email before logging in.");
        return;
      }

      onLogin(userCredential.user);
    } catch (error) {
      console.error("Auth Error:", error.message);
      setLoginError(error.message);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-backdrop" />

      <div className="login-page login-page-simple">
        <section className="login-hero login-hero-simple">
          <img src="/ClubhouseClashLogoMain.png" alt="Clubhouse Clash Logo" className="login-hero-logo login-hero-logo-standalone" />

          <div className="login-action-stack">
            <button
              type="button"
              className="login-home-button login-home-button-primary"
              onClick={openJoinModal}
            >
              Join
            </button>
            <button
              type="button"
              className="login-home-button"
              onClick={openCreateModal}
            >
              Create
            </button>
          </div>
        </section>
      </div>

      {activeModal && (
        <div className="login-modal-overlay" onClick={closeModal}>
          <div className="login-modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="login-modal-close" onClick={closeModal}>
              ×
            </button>

            {activeModal === 'join' && (
              <>
                <div className="login-card-header">
                  <h2 className="login-modal-title-centered">Join a tournament</h2>
                </div>

                <div className="login-field-group">
                  <input
                    id="event-code"
                    type="text"
                    placeholder="Enter Event Code"
                    value={eventCode}
                    onChange={(e) => setEventCode(e.target.value)}
                    className="login-code-input"
                  />
                </div>

                <button
                  className="login-action login-action-accent"
                  onClick={() => onJoinWithCode(eventCode.trim())}
                >
                  Enter
                </button>
              </>
            )}

            {activeModal === 'create' && (
              <>
                <div className="login-card-header">
                  <h2 className="login-modal-title-centered">
                    {isSignup ? 'Create Account' : 'Admin Login'}
                  </h2>
                </div>

                {signupComplete && (
                  <div className="login-message login-message-success">
                    Account created. Check your email to verify it before logging in.
                  </div>
                )}

                {loginError && (
                  <div className="login-message login-message-error">
                    {loginError}
                  </div>
                )}

                <div className="login-field-group">
                  <label htmlFor="admin-email">Email</label>
                  <input
                    id="admin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="login-field-group">
                  <label htmlFor="admin-password">Password</label>
                  <input
                    id="admin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button className="login-action login-action-admin" onClick={handleAuth}>
                  {isSignup ? 'Create Account' : 'Login'}
                </button>

                <button
                  type="button"
                  className="login-mode-toggle login-mode-toggle-bottom"
                  onClick={() => {
                    setLoginError('');
                    setSignupComplete(false);
                    setIsSignup(!isSignup);
                  }}
                >
                  {isSignup ? 'Already have an account? Log in' : 'Need an account? Create one'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
