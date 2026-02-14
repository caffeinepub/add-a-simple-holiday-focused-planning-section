import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-card/80 backdrop-blur-xl shadow-2xl p-8 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Kians Cloud
            </h1>
            <p className="text-muted-foreground">
              Your Personal Dashboard
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full h-12 text-lg font-semibold"
            >
              {isLoggingIn ? (
                <>
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Logging in...
                </>
              ) : (
                'Login with Internet Identity'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure authentication powered by Internet Computer
            </p>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
