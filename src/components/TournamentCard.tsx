import React from 'react';
import { Card } from "@/components/ui/card";
import { Trophy, Users, Gamepad2 } from "lucide-react";

interface TournamentCardProps {
  title: string;
  game: string;
  prizePool: number;
  entryFee: number;
  playersJoined: number;
  maxPlayers: number;
  image?: string;
}

const TournamentCard = ({ 
  title, 
  game, 
  prizePool,
  entryFee,
  playersJoined,
  maxPlayers,
  image 
}: TournamentCardProps) => {
  return (
    <Card className="group relative overflow-hidden bg-gaming-dark/50 border-gaming-accent/20 hover:border-gaming-accent/50 transition-all duration-300">
      <div className="flex h-full">
        <div className="relative w-48 overflow-hidden">
          <img 
            src={image || '/placeholder.svg'} 
            alt={title}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gaming-dark" />
        </div>
        
        <div className="flex-1 p-4">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
            <Gamepad2 className="w-4 h-4 text-gaming-accent" />
            <span>{game}</span>
          </div>
          
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Entry Fee: ₹{entryFee}</span>
            <span className="text-gaming-accent">Prize Pool: ₹{prizePool}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{playersJoined}/{maxPlayers} Players</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TournamentCard;
