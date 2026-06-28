/**
 * Supabase Database Types
 * Minimal type definitions for Supabase client
 * These map to the database schema in supabase-schema.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          uid: string;
          email: string;
          username: string | null;
          nickname: string;
          bio: string;
          gender: string;
          profile_image: string;
          cover_image: string;
          status: string;
          role: string;
          is_verified: boolean;
          is_premium: boolean;
          region: string;
          followers_count: number;
          following_count: number;
          posts_count: number;
          level: number;
          xp: number;
          popularity: number;
          gifts_count: number;
          subscribers: number;
          coins_balance: number;
          diamonds_balance: number;
          is_profile_complete: boolean;
          is_email_verified: boolean;
          join_date: string;
          last_seen: number;
          created_at: string;
          updated_at: string;
          badge_type?: 'vip' | 'government' | 'press' | 'organization' | 'verified' | 'founder' | null;
          is_suspended?: boolean;
          suspended_reason?: string | null;
          suspended_until?: string | null;
          profile_views?: number;
          total_views?: number;
        };
        Insert: {
          uid: string;
          email: string;
          username?: string | null;
          nickname?: string;
          bio?: string;
          gender?: string;
          profile_image?: string;
          cover_image?: string;
          status?: string;
          role?: string;
          is_verified?: boolean;
          is_premium?: boolean;
          region?: string;
          followers_count?: number;
          following_count?: number;
          posts_count?: number;
          level?: number;
          xp?: number;
          popularity?: number;
          gifts_count?: number;
          subscribers?: number;
          coins_balance?: number;
          diamonds_balance?: number;
          is_profile_complete?: boolean;
          is_email_verified?: boolean;
          join_date?: string;
          last_seen?: number;
        };
        Update: {
          uid?: string;
          email?: string;
          username?: string | null;
          nickname?: string;
          bio?: string;
          gender?: string;
          profile_image?: string;
          cover_image?: string;
          status?: string;
          role?: string;
          is_verified?: boolean;
          is_premium?: boolean;
          region?: string;
          followers_count?: number;
          following_count?: number;
          posts_count?: number;
          level?: number;
          xp?: number;
          popularity?: number;
          gifts_count?: number;
          subscribers?: number;
          coins_balance?: number;
          diamonds_balance?: number;
          is_profile_complete?: boolean;
          is_email_verified?: boolean;
          last_seen?: number;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          publisher_uid: string;
          type: string;
          content: string;
          media_base64: string;
          media_mime_type: string;
          description: string;
          likes_count: number;
          comments_count: number;
          views_count: number;
          shares_count: number;
          is_private: boolean;
          is_pinned: boolean;
          comments_disabled: boolean;
          favorites_disabled: boolean;
          region: string;
          created_at: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          publisher_uid: string;
          type: string;
          content?: string;
          media_base64?: string;
          media_mime_type?: string;
          description?: string;
          is_private?: boolean;
          region?: string;
        };
        Update: {
          content?: string;
          media_base64?: string;
          description?: string;
          is_private?: boolean;
          is_pinned?: boolean;
          comments_disabled?: boolean;
          favorites_disabled?: boolean;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          publisher_uid: string;
          content: string;
          likes_count: number;
          is_liked_by_publisher: boolean;
          parent_comment_id: string | null;
          replies_count: number;
          created_at: number;
        };
        Insert: {
          id?: string;
          post_id: string;
          publisher_uid: string;
          content: string;
          parent_comment_id?: string | null;
        };
        Update: {
          content?: string;
          likes_count?: number;
        };
      };
      stories: {
        Row: {
          id: string;
          publisher_uid: string;
          media_base64: string;
          media_mime_type: string;
          views_count: number;
          viewers: string[];
          created_at: number;
        };
        Insert: {
          id?: string;
          publisher_uid: string;
          media_base64: string;
          media_mime_type: string;
        };
        Update: {
          viewers?: string[];
          views_count?: number;
        };
      };
      followers: {
        Row: {
          follower_uid: string;
          followed_uid: string;
          created_at: string;
        };
        Insert: {
          follower_uid: string;
          followed_uid: string;
        };
        Update: Record<string, never>;
      };
      chat_rooms: {
        Row: {
          id: string;
          participant_1: string;
          participant_2: string;
          last_message: string;
          last_message_time: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_1: string;
          participant_2: string;
          last_message?: string;
        };
        Update: {
          last_message?: string;
          last_message_time?: number;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          room_id: string;
          sender_uid: string;
          content: string;
          media_base64: string;
          media_mime_type: string;
          message_type: string;
          is_read: boolean;
          created_at: number;
        };
        Insert: {
          id?: string;
          room_id: string;
          sender_uid: string;
          content?: string;
          media_base64?: string;
          media_mime_type?: string;
          message_type?: string;
        };
        Update: {
          is_read?: boolean;
          content?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_uid: string;
          type: string;
          from_uid: string | null;
          post_id: string | null;
          content: string;
          is_read: boolean;
          created_at: number;
        };
        Insert: {
          id?: string;
          user_uid: string;
          type: string;
          from_uid?: string | null;
          post_id?: string | null;
          content?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
      gift_types: {
        Row: {
          id: string;
          name: string;
          name_ar: string;
          emoji: string;
          image_url: string;
          coin_cost: number;
          diamond_value: number;
          category: string;
          animation_type: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_ar?: string;
          emoji?: string;
          coin_cost: number;
          diamond_value?: number;
          category?: string;
          animation_type?: string;
          sort_order?: number;
        };
        Update: {
          name?: string;
          coin_cost?: number;
          is_active?: boolean;
        };
      };
      gifts: {
        Row: {
          id: string;
          gift_type_id: string;
          sender_uid: string;
          receiver_uid: string;
          post_id: string | null;
          live_stream_id: string | null;
          quantity: number;
          message: string;
          created_at: number;
        };
        Insert: {
          id?: string;
          gift_type_id: string;
          sender_uid: string;
          receiver_uid: string;
          post_id?: string | null;
          live_stream_id?: string | null;
          quantity?: number;
          message?: string;
        };
        Update: Record<string, never>;
      };
      live_streams: {
        Row: {
          id: string;
          host_uid: string;
          title: string;
          description: string;
          thumbnail_base64: string;
          category: string;
          viewer_count: number;
          peak_viewer_count: number;
          like_count: number;
          gifts_coins_total: number;
          status: string;
          co_host_uid: string | null;
          is_recording: boolean;
          recording_url: string;
          scheduled_at: string | null;
          started_at: number;
          ended_at: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          host_uid: string;
          title?: string;
          description?: string;
          category?: string;
          status?: string;
          scheduled_at?: string | null;
        };
        Update: {
          title?: string;
          description?: string;
          viewer_count?: number;
          like_count?: number;
          gifts_coins_total?: number;
          status?: string;
          ended_at?: number | null;
        };
      };
      wallets: {
        Row: {
          uid: string;
          coins_balance: number;
          diamonds_balance: number;
          total_coins_earned: number;
          total_diamonds_earned: number;
          total_coins_spent: number;
          updated_at: string;
        };
        Insert: {
          uid: string;
          coins_balance?: number;
          diamonds_balance?: number;
        };
        Update: {
          coins_balance?: number;
          diamonds_balance?: number;
          total_coins_earned?: number;
          total_diamonds_earned?: number;
          total_coins_spent?: number;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_uid: string;
          type: string;
          currency: string;
          amount: number;
          description: string;
          reference_id: string | null;
          created_at: number;
        };
        Insert: {
          id?: string;
          user_uid: string;
          type: string;
          currency: string;
          amount: number;
          description?: string;
          reference_id?: string | null;
        };
        Update: Record<string, never>;
      };
      achievements: {
        Row: {
          id: string;
          code: string;
          name: string;
          name_ar: string;
          description: string;
          description_ar: string;
          icon_emoji: string;
          category: string;
          requirement_value: number;
          reward_coins: number;
          reward_diamonds: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          name_ar?: string;
          description?: string;
          icon_emoji?: string;
          category?: string;
          requirement_value?: number;
          reward_coins?: number;
          reward_diamonds?: number;
        };
        Update: {
          is_active?: boolean;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          code: string;
          name: string;
          name_ar: string;
          type: 'manual' | 'auto' | 'gateway';
          instructions: string | null;
          instructions_ar: string | null;
          icon_emoji: string;
          min_amount: number;
          max_amount: number;
          fee_percent: number;
          fee_fixed: number;
          is_active: boolean;
          sort_order: number;
          countries: string[];
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          name_ar: string;
          type?: 'manual' | 'auto' | 'gateway';
          instructions?: string | null;
          instructions_ar?: string | null;
          icon_emoji?: string;
          min_amount?: number;
          max_amount?: number;
          fee_percent?: number;
          fee_fixed?: number;
          is_active?: boolean;
          sort_order?: number;
          countries?: string[];
          metadata?: Record<string, unknown>;
        };
        Update: {
          code?: string;
          name?: string;
          name_ar?: string;
          type?: 'manual' | 'auto' | 'gateway';
          instructions?: string | null;
          instructions_ar?: string | null;
          icon_emoji?: string;
          min_amount?: number;
          max_amount?: number;
          fee_percent?: number;
          fee_fixed?: number;
          is_active?: boolean;
          sort_order?: number;
          countries?: string[];
          metadata?: Record<string, unknown>;
        };
      };
      deposit_requests: {
        Row: {
          id: string;
          user_uid: string;
          payment_method_id: string;
          amount_coins: number;
          amount_paid: number;
          currency: string;
          status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
          reference_code: string | null;
          user_note: string | null;
          admin_note: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          receipt_base64: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_uid: string;
          payment_method_id: string;
          amount_coins: number;
          amount_paid?: number;
          currency?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
          reference_code?: string | null;
          user_note?: string | null;
          admin_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          receipt_base64?: string | null;
        };
        Update: {
          status?: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
          reference_code?: string | null;
          user_note?: string | null;
          admin_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          receipt_base64?: string | null;
        };
      };
      withdrawal_requests: {
        Row: {
          id: string;
          user_uid: string;
          payment_method_id: string;
          amount_coins: number;
          amount_payout: number;
          currency: string;
          status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
          reference_code: string | null;
          destination_account: string | null;
          user_note: string | null;
          admin_note: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_uid: string;
          payment_method_id: string;
          amount_coins: number;
          amount_payout?: number;
          currency?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
          reference_code?: string | null;
          destination_account?: string | null;
          user_note?: string | null;
          admin_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          paid_at?: string | null;
        };
        Update: {
          status?: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
          reference_code?: string | null;
          destination_account?: string | null;
          user_note?: string | null;
          admin_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          paid_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_post_views: { Args: { post_id: string }; Returns: undefined };
      increment_stream_viewers: { Args: { stream_id: string }; Returns: undefined };
      increment_stream_likes: { Args: { stream_id: string }; Returns: undefined };
      increment_stream_gifts: { Args: { stream_id: string; amount: number }; Returns: undefined };
      send_gift: { Args: { p_gift_type_id: string; p_receiver_uid: string; p_quantity?: number; p_message?: string; p_post_id?: string; p_live_stream_id?: string }; Returns: Record<string, unknown> };
      create_deposit_request: { Args: { p_payment_method_id: string; p_amount_coins: number; p_user_note?: string; p_receipt_base64?: string }; Returns: Record<string, unknown> };
      create_withdrawal_request: { Args: { p_payment_method_id: string; p_amount_coins: number; p_destination_account: string; p_user_note?: string }; Returns: Record<string, unknown> };
      process_deposit_request: { Args: { p_request_id: string; p_action: string; p_admin_note?: string }; Returns: Record<string, unknown> };
      process_withdrawal_request: { Args: { p_request_id: string; p_action: string; p_admin_note?: string }; Returns: Record<string, unknown> };
    };
    Enums: {
      gender: 'male' | 'female' | 'unspecified';
      user_status: 'online' | 'offline' | 'busy' | 'away';
      user_role: 'user' | 'moderator' | 'admin' | 'supporter';
    };
  };
}
