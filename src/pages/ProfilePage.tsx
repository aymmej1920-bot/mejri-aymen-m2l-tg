"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Loader2 } from "lucide-react";
import { useFleet } from "@/context/FleetContext";
import { Profile } from "@/types/profile";

const formSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères." }).nullable(),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }).nullable(),
  avatarUrl: z.string().url({ message: "L'URL de l'avatar n'est pas valide." }).nullable().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof formSchema>;

const ProfilePage: React.FC = () => {
  const { profile, updateProfile, isLoadingFleetData } = useFleet();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      avatarUrl: profile?.avatarUrl || "",
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        avatarUrl: profile.avatarUrl || "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        firstName: values.firstName === "" ? null : values.firstName,
        lastName: values.lastName === "" ? null : values.lastName,
        avatarUrl: values.avatarUrl === "" ? null : values.avatarUrl,
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingFleetData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="glass rounded-2xl animate-fadeIn max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">Mon Profil</CardTitle>
          <CardDescription>Gérez vos informations personnelles et votre avatar.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
              {profile?.avatarUrl ? (
                <AvatarImage src={profile.avatarUrl} alt="Avatar" />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {profile?.firstName ? profile.firstName[0] : <User className="h-12 w-12" />}
                </AvatarFallback>
              )}
            </Avatar>
            <h3 className="text-xl font-semibold">
              {profile?.firstName || "Utilisateur"} {profile?.lastName || ""}
            </h3>
            <p className="text-sm text-muted-foreground">ID: {profile?.id}</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre prénom" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre nom" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de l'Avatar</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.jpg" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full hover:animate-hover-lift gradient-brand text-primary-foreground" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;