import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Button } from "./ui/button";
import { Trophy, LogOut } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { MessageCircle } from 'lucide-react';

const Navbar = () => {
  const { session } = useSessionContext();
  const navigate = useNavigate();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUnreadMessages = async () => {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*', { count: 'exact' })
        .eq('receiver_id', session.user.id)
        .eq('read', false);

      if (error) {
        console.error('Error fetching unread messages:', error);
        return;
      }

      setUnreadMessagesCount(data.length);
    };

    fetchUnreadMessages();

    const channel = supabase
      .channel(`direct_messages:${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${session.user.id}`,
        },
        (payload) => {
          if (payload.new.sender_id !== session.user.id && !payload.new.read) {
            setUnreadMessagesCount((prev) => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${session.user.id}`,
        },
        (payload) => {
          if (payload.new.read) {
            setUnreadMessagesCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);


  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate('/login');
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gaming-dark/95 backdrop-blur-sm border-b border-gaming-accent/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-gaming-accent" />
            <span className="text-xl font-bold text-white">HomeGround</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link to="/tournaments">
                  <Button variant="ghost">Tournaments</Button>
                </Link>
                <Link to="/matchmaking">
                  <Button variant="ghost">Matchmaking</Button>
                </Link>
                 <div className="relative">
                    <Link to="/profile">
                      <Button variant="ghost">Profile</Button>
                    </Link>
                    {unreadMessagesCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                        {unreadMessagesCount}
                      </span>
                    )}
                  </div>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-400"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
