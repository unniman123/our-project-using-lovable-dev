import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface ChatUserListProps {
  users: any[];
  onSelectUser: (userId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ChatUserList = ({ users, onSelectUser, searchQuery, onSearchChange }: ChatUserListProps) => {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, game_id, is_online')
          .ilike('username', `%${searchQuery}%`)
          .limit(10);

        if (error) {
          console.error('Error searching users:', error);
          throw error;
        }
        
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const displayUsers = searchQuery ? searchResults : users;

  return (
    <div className="space-y-4 p-4">
      <Input
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by username..."
        className="bg-gaming-dark/50 border-gaming-accent/20 text-white"
      />
      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {isSearching ? (
            <div className="text-center text-gray-400">Searching...</div>
          ) : displayUsers.length === 0 ? (
            <div className="text-center text-gray-400">
              {searchQuery ? 'No users found' : 'No online users'}
            </div>
          ) : (
            displayUsers.map((user) => (
              <div className="flex items-center justify-between w-full">
                <Button
                  key={user.id}
                  variant="ghost"
                  className="flex-1 justify-start hover:bg-gaming-accent/10"
                  onClick={() => onSelectUser(user.id)}
                >
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm text-white">{user.username}</span>
                    {user.game_id && (
                      <span className="text-xs text-gray-400">Game ID: {user.game_id}</span>
                    )}
                  </div>
                  <div className="ml-auto flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-500'}`} />
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gaming-accent/10"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatUserList;
