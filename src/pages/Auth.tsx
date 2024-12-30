import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from '@supabase/auth-helpers-react';

const Auth = () => {
  const navigate = useNavigate();
  const { session } = useSessionContext();

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-gaming-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-gaming-dark/50 p-8 rounded-lg border border-gaming-accent/20">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gaming-accent to-gaming-primary bg-clip-text text-transparent">
            Enter your HomeGround
          </h2>
          <p className="mt-2 text-gray-400">
            Sign in to your account or create a new one
          </p>
        </div>
        <SupabaseAuth 
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#6d28d9',
                  brandAccent: '#7c3aed',
                }
              }
            },
            className: {
              container: 'w-full',
              button: 'w-full bg-gaming-accent hover:bg-gaming-accent/90 text-white',
              input: 'bg-gaming-dark/50 border-gaming-accent/20 text-white',
              label: 'text-white'
            }
          }}
          providers={[]}
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
};

export default Auth;
