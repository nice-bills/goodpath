"use client";

import { useCallback, useEffect, useState } from "react";
import {
  usePrivy,
  useLoginWithEmail,
  useLoginWithOAuth,
  useConnectWallet,
} from "@privy-io/react-auth";
import { useSwitchChain } from "wagmi";
import { celo } from "wagmi/chains";
import { EmailLogoIcon, GoogleLogoIcon, WalletLogoIcon } from "@/components/connect-brand-icons";
import { usePrivyEmbeddedWalletLink } from "@/hooks/use-privy-embedded-wallet";

function useAfterPrivyConnect(onClose: () => void) {
  const { switchChain } = useSwitchChain();

  return useCallback(() => {
    switchChain({ chainId: celo.id }, { onError: () => undefined });
    onClose();
  }, [onClose, switchChain]);
}

function WalletSetupPanel({
  phase,
  error,
  onReset,
  onUseMetaMask,
}: {
  phase: string;
  error: string | null;
  onReset: () => void;
  onUseMetaMask: () => void;
}) {
  const setupMessage =
    phase === "creating"
      ? "Creating your Celo wallet…"
      : phase === "slow"
        ? "Still working — Privy can take up to 90s the first time."
        : phase === "failed"
          ? "Wallet setup stalled."
          : "Linking wallet to G$ Path…";

  const showMetaMaskEscape =
    phase === "slow" || phase === "failed" || phase === "creating" || phase === "linking";

  return (
    <div className="wallet-connect-actions">
      <p className="text-sm font-medium text-foreground">{setupMessage}</p>
      <p className="text-xs text-muted">
        Email login creates a Privy embedded wallet on Celo (required after your code). First
        sign-in is often slow — MetaMask below is usually faster.
      </p>
      {error && <p className="wallet-connect-error">{error}</p>}
      {showMetaMaskEscape && (
        <button type="button" className="btn-primary mt-3 w-full" onClick={onUseMetaMask}>
          Use MetaMask instead (faster)
        </button>
      )}
      {(phase === "slow" || phase === "failed") && (
        <button type="button" className="wallet-connect-back" onClick={onReset}>
          Reset email sign-in
        </button>
      )}
    </div>
  );
}

function PrivySignInLoading() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 6000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!slow) {
    return <p className="text-xs text-muted">Loading sign-in…</p>;
  }

  return (
    <div className="wallet-connect-actions">
      <p className="text-sm font-medium text-foreground">Sign-in is taking longer than usual</p>
      <p className="text-xs leading-relaxed text-muted">
        Check that{" "}
        <code className="rounded bg-surface-muted px-1">NEXT_PUBLIC_PRIVY_APP_ID</code> is set,
        http://localhost:3000 is in your Privy app allowed origins, and ad blockers are off for
        this site.
      </p>
      <button
        type="button"
        className="btn-secondary mt-2 w-full text-xs"
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );
}

function PrivyLoginOptionsReady({
  onClose,
}: {
  onClose: () => void;
  pendingClose?: boolean;
  onPendingClose?: (v: boolean) => void;
}) {
  const afterConnect = useAfterPrivyConnect(onClose);
  const [emailStep, setEmailStep] = useState<"pick" | "email" | "code">("pick");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

  const { authenticated, logout } = usePrivy();
  const { ensureEmbeddedWalletLinked, phase, error: setupError, isReady } =
    usePrivyEmbeddedWalletLink({ autoRestore: false });

  const switchToMetaMask = useCallback(() => {
    setFinishing(false);
    setFormError(null);
    void logout();
  }, [logout]);

  const finishSocialLogin = useCallback(async () => {
    setFormError(null);
    setFinishing(true);
    try {
      await ensureEmbeddedWalletLinked();
      afterConnect();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Could not finish sign-in");
    } finally {
      setFinishing(false);
    }
  }, [ensureEmbeddedWalletLinked, afterConnect]);

  const { initOAuth, state: oauthState } = useLoginWithOAuth({
    onComplete: () => {
      void finishSocialLogin();
    },
    onError: (err) => setFormError(String(err)),
  });
  const { sendCode, loginWithCode, state: emailState } = useLoginWithEmail({
    onError: (err) => setFormError(String(err)),
  });

  if ((authenticated && !isReady) || finishing) {
    return (
      <WalletSetupPanel
        phase={finishing ? "creating" : phase}
        error={setupError ?? formError}
        onReset={() => void logout()}
        onUseMetaMask={switchToMetaMask}
      />
    );
  }

  if (emailStep === "email") {
    return (
      <div className="wallet-connect-actions">
        <p className="text-sm text-muted">Enter your email — we&apos;ll send a one-time code.</p>
        <input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="wallet-connect-input"
        />
        <button
          type="button"
          className="wallet-connect-btn wallet-connect-email"
          disabled={!email.includes("@") || emailState.status === "sending-code"}
          onClick={async () => {
            setFormError(null);
            try {
              await sendCode({ email: email.trim() });
              setEmailStep("code");
            } catch (e) {
              setFormError(e instanceof Error ? e.message : "Could not send code");
            }
          }}
        >
          <EmailLogoIcon />
          {emailState.status === "sending-code" ? "Sending code…" : "Send code"}
        </button>
        <button type="button" className="wallet-connect-back" onClick={() => setEmailStep("pick")}>
          Back
        </button>
        {formError && <p className="wallet-connect-error">{formError}</p>}
      </div>
    );
  }

  if (emailStep === "code") {
    return (
      <div className="wallet-connect-actions">
        <p className="text-sm text-muted">Check your inbox for the code we sent to {email}.</p>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="wallet-connect-input font-mono tracking-widest"
        />
        <button
          type="button"
          className="wallet-connect-btn wallet-connect-google"
          disabled={
            code.length < 4 || emailState.status === "submitting-code" || finishing
          }
          onClick={async () => {
            setFormError(null);
            setFinishing(true);
            try {
              await loginWithCode({ code });
              await ensureEmbeddedWalletLinked();
              afterConnect();
            } catch (e) {
              setFormError(e instanceof Error ? e.message : "Invalid code or wallet setup failed");
            } finally {
              setFinishing(false);
            }
          }}
        >
          {emailState.status === "submitting-code" || finishing
            ? "Setting up wallet…"
            : "Verify & continue"}
        </button>
        <button type="button" className="wallet-connect-back" onClick={() => setEmailStep("email")}>
          Resend to different email
        </button>
        {formError && <p className="wallet-connect-error">{formError}</p>}
      </div>
    );
  }

  return (
    <div className="wallet-connect-actions">
      <button
        type="button"
        className="wallet-connect-btn wallet-connect-google"
        disabled={oauthState.status === "loading" || finishing}
        onClick={() => {
          setFormError(null);
          void initOAuth({ provider: "google" });
        }}
      >
        <GoogleLogoIcon />
        {oauthState.status === "loading" ? "Opening Google…" : "Continue with Google"}
      </button>
      <button
        type="button"
        className="wallet-connect-btn wallet-connect-email"
        onClick={() => {
          setFormError(null);
          setEmailStep("email");
        }}
      >
        <EmailLogoIcon />
        Continue with email
      </button>
      {formError && <p className="wallet-connect-error">{formError}</p>}
    </div>
  );
}

export function PrivyLoginOptions({
  onClose,
}: {
  onClose: () => void;
  pendingClose?: boolean;
  onPendingClose?: (v: boolean) => void;
}) {
  const { ready } = usePrivy();
  if (!ready) return <PrivySignInLoading />;
  return <PrivyLoginOptionsReady onClose={onClose} />;
}

function PrivyWalletLoginButtonReady({
  onClose,
  disabled,
}: {
  onClose: () => void;
  disabled?: boolean;
}) {
  const { switchChain } = useSwitchChain();
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const afterConnect = useCallback(() => {
    switchChain({ chainId: celo.id }, { onError: () => undefined });
    onClose();
  }, [onClose, switchChain]);

  const { connectWallet } = useConnectWallet({
    onSuccess: () => {
      setPending(false);
      afterConnect();
    },
    onError: (err) => {
      setPending(false);
      setFormError(String(err));
    },
  });

  return (
    <>
      <button
        type="button"
        disabled={disabled || pending}
        className="wallet-connect-btn wallet-connect-google wallet-connect-wallet"
        onClick={() => {
          setFormError(null);
          setPending(true);
          connectWallet({
            walletList: ["metamask", "detected_ethereum_wallets", "wallet_connect"],
          });
        }}
      >
        <WalletLogoIcon />
        {pending ? "Connecting…" : "Connect MetaMask / Wallet"}
      </button>
      {formError && (
        <p className="wallet-connect-error" role="alert">
          {formError}
        </p>
      )}
    </>
  );
}

export function PrivyWalletLoginButton({
  onClose,
  disabled,
}: {
  onClose: () => void;
  onPendingClose?: (v: boolean) => void;
  className?: string;
  disabled?: boolean;
}) {
  const { ready } = usePrivy();
  if (!ready) return null;
  return <PrivyWalletLoginButtonReady onClose={onClose} disabled={disabled} />;
}
