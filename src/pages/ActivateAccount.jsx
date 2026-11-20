import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import authService from '../services/authService';

/**
 * ActivateAccount Page
 * Handles user account activation via email link with uid and token.
 */
const ActivateAccount = () => {
  const { uid: paramUid, token: paramToken } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uid = paramUid || searchParams.get('uid');
  const token = paramToken || searchParams.get('token');

  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleActivation = async () => {
    if (!uid || !token) {
      setStatus('error');
      setErrorMessage('Activation link is missing required parameters (UID or Token).');
      return;
    }

    try {
      setStatus('loading');
      setErrorMessage('');

      await authService.activateAccount({ uid, token });
      setStatus('success');
    } catch (err) {
      console.error('Account activation failed:', err);
      setStatus('error');
      setErrorMessage(
        err.response?.data?.detail ||
        err.response?.data?.token?.[0] ||
        err.response?.data?.uid?.[0] ||
        'The activation link is invalid, expired, or has already been used.'
      );
    }
  };

  // Auto-trigger activation if uid & token are present in URL
  useEffect(() => {
    if (uid && token) {
      handleActivation();
    }
  }, [uid, token]);

  return (
    <div className="animate-fade-in text-center py-4">
      {/* Loading State */}
      {status === 'loading' && (
        <div className="py-8">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Verifying Your Account
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Please wait while we confirm your email and activate your NexaMart account...
          </p>
        </div>
      )}

      {/* Success State */}
      {status === 'success' && (
        <div className="py-6 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
            Account Activated!
          </h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">
            Your email has been successfully verified. You can now sign in to start exploring and shopping on NexaMart.
          </p>

          <Link
            to="/login"
            className="w-full bg-indigo-600 text-white py-3.5 px-6 rounded-xl font-bold text-base hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="py-6 animate-fade-in">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 border border-rose-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <AlertCircle className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
            Activation Failed
          </h2>
          <p className="text-sm text-rose-600 font-medium max-w-sm mx-auto mb-6">
            {errorMessage}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Go to Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
            >
              Register Again
            </Link>
          </div>
        </div>
      )}

      {/* Idle State (No parameters provided) */}
      {status === 'idle' && !uid && (
        <div className="py-8">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 border border-amber-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Account Activation
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Please use the activation link sent to your registered email address to verify your account.
          </p>
          <Link
            to="/login"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Return to Sign in &rarr;
          </Link>
        </div>
      )}
    </div>
  );
};

export default ActivateAccount;
