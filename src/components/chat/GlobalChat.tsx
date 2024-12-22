import React, { useState, useEffect } from 'react';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useToast } from "../ui/use-toast";
import { MessageCircle, X, Bell, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { supabase } from "../../integrations/supabase/client";
import ChatUserList from './ChatUserList';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

const GlobalChat = () => {
  const { session } = useSessionContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState([]);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (!session?.user?.id || !selectedUser) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${selectedUser}),and(sender_id.eq.${selectedUser},receiver_id.eq.${session.user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`direct_messages:${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `or(sender_id=eq.${session.user.id},receiver_id=eq.${session.user.id})`,
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages((prev) => [...prev, payload.new]);
          // Fetch sender's username
          const fetchSender = async () => {
            const { data, error } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', (payload.new as { sender_id: string }).sender_id)
              .single();

            if (error) {
              console.error('Error fetching sender username:', error);
              return;
            }

            // Show notification
            if (data?.username) {
              const { toast } = useToast();
              toast({
                title: `New message from ${data.username}`,
                description: (payload.new as { message: string }).message,
              });
            }
          };
          fetchSender();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, selectedUser]);

    // Fetch unread messages count
    useEffect(() => {
      if (!session?.user?.id) return;
  
      const fetchUnreadMessages = async () => {
        const { data, error, count } = await supabase
          .from('direct_messages')
          .select('*, sender_id:profiles(username)')
          .eq('receiver_id', session.user.id)
          .eq('read', false);
  
        if (error) {
          console.error('Error fetching unread messages:', error);
          return;
        }
        setUnreadCount(count || 0);
        setUnreadMessages(data || []);
      };
  
      fetchUnreadMessages();
  
      const channel = supabase
        .channel(`direct_messages_unread:${session.user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'direct_messages',
            filter: `receiver_id=eq.${session.user.id}`,
          },
          (payload) => {
            if (payload.new && (payload.new as { read: boolean }).read === false) {
              fetchUnreadMessages();
            }
          }
        )
        .subscribe();
  
      return () => {
        supabase.removeChannel(channel);
      };
    }, [session?.user?.id]);

  // Handle online users presence
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase.channel('online_users', {
      config: {
        presence: {
          key: session.user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const presenceUsers = Object.values(newState).flat();
        console.log('Online users:', presenceUsers);
        setOnlineUsers(presenceUsers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && session?.user?.id) {
          await channel.track({
            id: session.user.id,
            username: session.user.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [session?.user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    if (session?.user?.id === selectedUser) {
      return;
    }

    try {
      const messageData = {
        sender_id: session?.user?.id,
        receiver_id: selectedUser,
        message: newMessage.trim(),
        read: false,
      };

      console.log('Message data:', messageData);

      const { error, data } = await supabase
        .from('direct_messages')
        .insert(messageData)
        .select('*')
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return;
      }

      console.log('Message sent:', data);
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSelectUser = async (userId: string) => {
    setSelectedUser(userId);
    setSearchQuery('');

    // Mark messages as read when user opens the chat
    await supabase
      .from('direct_messages')
      .update({ read: true })
      .match({ sender_id: userId, receiver_id: session?.user?.id });
  };

    const handleBack = () => {
        setSelectedUser(null);
    };

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-row">
        <Button
          className="bg-gaming-accent hover:bg-gaming-accent/80 mr-2"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat
        </Button>
        <Button
          className="bg-gaming-accent hover:bg-gaming-accent/80 relative"
          onClick={handleOpenNotifications}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
              {unreadCount}
            </span>
          )}
        </Button>
        {showNotifications && (
          <div className="absolute bottom-12 right-0 bg-gaming-dark border border-gaming-accent/20 rounded-lg w-80 h-96 flex flex-col">
            <div className="p-4 border-b border-gaming-accent/20 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {unreadMessages.length > 0 ? (
              <div className="p-4 text-white">
                {unreadMessages.map((message) => (
                  <div key={message.id}>
                    You have a new message from {message.sender_id?.username}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-white">No new messages</div>
            )}
          </div>
        )}
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-gaming-dark border border-gaming-accent/20 rounded-lg w-80 h-96 flex flex-col">
          <div className="p-4 border-b border-gaming-accent/20 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Chat</h3>
            {selectedUser && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="mr-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {selectedUser ? (
            <>
              <ChatMessages 
                messages={messages} 
                currentUserId={session?.user?.id} 
              />
              <ChatInput
                newMessage={newMessage}
                onMessageChange={setNewMessage}
                onSendMessage={handleSendMessage}
              />
            </>
          ) : (
            <ChatUserList
              users={onlineUsers}
              onSelectUser={handleSelectUser}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalChat;
