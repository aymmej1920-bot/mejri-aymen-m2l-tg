"use client";

import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/context/SessionContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LoginPage: React.FC = () => {
  const { session, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session && !isLoading) {
      navigate('/');
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-muted-foreground">Chargement de la session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center app-background-gradient p-4">
      <Card className="w-full max-w-md glass rounded-2xl p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-4">Connectez-vous à Fleet Manager Pro</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                  },
                },
                dark: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                  },
                },
              },
            }}
            theme="dark" // Utilise le thème sombre par défaut pour Auth UI
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Adresse e-mail',
                  password_label: 'Mot de passe',
                  email_input_placeholder: 'Votre adresse e-mail',
                  password_input_placeholder: 'Votre mot de passe',
                  button_label: 'Se connecter',
                  social_auth_button_text: 'Se connecter avec {{provider}}',
                  link_text: 'Déjà un compte ? Connectez-vous',
                  forgotten_password: 'Mot de passe oublié ?',
                  confirmation_text: 'Vérifiez votre e-mail pour le lien de connexion',
                },
                sign_up: {
                  email_label: 'Adresse e-mail',
                  password_label: 'Mot de passe',
                  email_input_placeholder: 'Votre adresse e-mail',
                  password_input_placeholder: 'Votre mot de passe',
                  button_label: 'S\'inscrire',
                  social_auth_button_text: 'S\'inscrire avec {{provider}}',
                  link_text: 'Pas encore de compte ? Inscrivez-vous',
                  confirmation_text: 'Vérifiez votre e-mail pour le lien de confirmation',
                },
                forgotten_password: {
                  email_label: 'Adresse e-mail',
                  password_label: 'Nouveau mot de passe',
                  email_input_placeholder: 'Votre adresse e-mail',
                  button_label: 'Envoyer les instructions de réinitialisation',
                  link_text: 'Mot de passe oublié ?',
                  confirmation_text: 'Vérifiez votre e-mail pour le lien de réinitialisation',
                },
                update_password: {
                  password_label: 'Nouveau mot de passe',
                  password_input_placeholder: 'Votre nouveau mot de passe',
                  button_label: 'Mettre à jour le mot de passe',
                  confirmation_text: 'Votre mot de passe a été mis à jour',
                },
                magic_link: {
                  email_input_placeholder: 'Votre adresse e-mail',
                  button_label: 'Envoyer le lien magique',
                  link_text: 'Envoyer un lien magique par e-mail',
                  confirmation_text: 'Vérifiez votre e-mail pour le lien magique',
                },
                verify_otp: {
                  email_input_placeholder: 'Votre adresse e-mail',
                  phone_input_placeholder: 'Votre numéro de téléphone',
                  token_input_placeholder: 'Votre code OTP',
                  email_label: 'Adresse e-mail',
                  phone_label: 'Numéro de téléphone',
                  token_label: 'Code OTP',
                  button_label: 'Vérifier le code OTP',
                  link_text: 'Vous avez déjà un code OTP ?',
                  confirmation_text: 'Vérifiez votre e-mail/téléphone pour le code OTP',
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;