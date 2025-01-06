import React from 'react';
import { User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  isEditing: boolean;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileAvatar = ({ avatarUrl, isEditing, onAvatarChange }: ProfileAvatarProps) => {
  return (
    <div className="relative">
      <Avatar className="w-24 h-24">
        <AvatarImage src={avatarUrl || ''} />
        <AvatarFallback>
          <User className="w-12 h-12" />
        </AvatarFallback>
      </Avatar>
      {isEditing && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <label className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-blue-600">
            Change
            <Input
              type="file"
              accept="image/*"
              onChange={onAvatarChange}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
