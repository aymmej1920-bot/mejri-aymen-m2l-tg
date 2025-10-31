"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, UploadCloud, Loader2, XCircle } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";

interface AvatarUploadProps {
  currentAvatarUrl: string | null | undefined;
  onUploadSuccess: (url: string) => void;
  onRemove: () => void;
  userId: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  onUploadSuccess,
  onRemove,
  userId,
}) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (avatarFile) {
      const objectUrl = URL.createObjectURL(avatarFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [avatarFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showError("La taille du fichier ne doit pas dépasser 5 Mo.");
        setAvatarFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (!file.type.startsWith("image/")) {
        showError("Veuillez télécharger un fichier image.");
        setAvatarFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setAvatarFile(file);
    } else {
      setAvatarFile(null);
    }
  };

  const handleUpload = async () => {
    if (!avatarFile) {
      showError("Veuillez sélectionner un fichier à télécharger.");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true, // Overwrite if file with same name exists
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error("Impossible d'obtenir l'URL publique de l'avatar.");
      }

      onUploadSuccess(publicUrlData.publicUrl);
      showSuccess("Avatar téléchargé avec succès !");
      setAvatarFile(null); // Clear selected file after successful upload
      if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input
    } catch (error: any) {
      showError("Échec du téléchargement de l'avatar : " + error.message);
      console.error("Error uploading avatar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return;

    setIsUploading(true); // Use isUploading for deletion state too
    try {
      // Extract file path from URL
      const urlParts = currentAvatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = fileName; // Assuming the file is directly in the bucket root

      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) {
        throw deleteError;
      }

      onRemove();
      showSuccess("Avatar supprimé avec succès !");
    } catch (error: any) {
      showError("Échec de la suppression de l'avatar : " + error.message);
      console.error("Error deleting avatar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const displayAvatarUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24 border-2 border-primary">
        {displayAvatarUrl ? (
          <AvatarImage src={displayAvatarUrl} alt="Avatar" />
        ) : (
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
            <User className="h-12 w-12" />
          </AvatarFallback>
        )}
      </Avatar>

      <div className="flex flex-col items-center space-y-2 w-full max-w-xs">
        <Label htmlFor="avatar-upload" className="sr-only">Télécharger un avatar</Label>
        <Input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="cursor-pointer"
          disabled={isUploading}
        />
        {avatarFile && (
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full hover:animate-hover-lift gradient-brand text-primary-foreground"
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            {isUploading ? "Téléchargement..." : "Télécharger l'avatar"}
          </Button>
        )}
        {currentAvatarUrl && !avatarFile && (
          <Button
            variant="outline"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
            className="w-full text-destructive hover:bg-destructive/10"
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Supprimer l'avatar actuel
          </Button>
        )}
      </div>
    </div>
  );
};

export default AvatarUpload;