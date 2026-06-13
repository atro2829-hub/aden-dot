/**
 * Firebase / Supabase Integration Layer for Skyline
 *
 * This module provides the abstraction layer for database operations.
 * Currently using Zustand in-memory store.
 * Replace the implementations with Firebase or Supabase calls when ready.
 *
 * FIREBASE SETUP:
 * 1. npm install firebase
 * 2. Create a Firebase project at https://console.firebase.google.com
 * 3. Enable Authentication (Email/Password + Google)
 * 4. Enable Realtime Database or Firestore
 * 5. Enable Storage for media files
 * 6. Update the config below with your Firebase credentials
 *
 * SUPABASE SETUP:
 * 1. npm install @supabase/supabase-js
 * 2. Create a Supabase project at https://supabase.com
 * 3. Enable Auth providers (Email + Google)
 * 4. Create tables matching our types
 * 5. Enable Storage buckets
 * 6. Update the config below with your Supabase credentials
 */

// ===== Firebase Configuration =====
// Uncomment and fill in when ready to connect Firebase:

/*
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getDatabase, ref, set, get, push, remove, update, onValue, off } from 'firebase/database';
import { getStorage, uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
*/

// ===== Supabase Configuration =====
// Uncomment and fill in when ready to connect Supabase:

/*
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
*/

// ===== Database Path Structure (Firebase Realtime Database) =====
// skyline/
//   users/{uid}/
//     - uid, email, username, nickname, bio, gender
//     - profileImage, coverImage
//     - status, role, isVerified, isPremium
//     - region, followersCount, followingCount
//     - postsCount, level, popularity, gifts, subscribers
//     - joinDate, lastSeen
//
//   posts/{postId}/
//     - id, publisherUID, publisherUsername, publisherNickname
//     - publisherProfileImage, publisherVerified
//     - type, content, mediaBase64, mediaMimeType
//     - description, likesCount, commentsCount, viewsCount
//     - isPrivate, commentsDisabled, favoritesDisabled
//     - createdAt, region
//
//   posts-likes/{postId}/{uid}: true/false
//   posts-favorites/{postId}/{uid}: true/false
//   posts-comments/{postId}/{commentId}/
//     - id, postID, publisherUID, publisherUsername
//     - publisherNickname, publisherProfileImage
//     - content, likesCount, isLikedByPublisher
//     - parentCommentID, repliesCount, createdAt
//
//   posts-comments-like/{commentId}/{uid}: true/false
//   stories/{storyId}/ - id, publisherUID, mediaBase64, mediaMimeType, createdAt
//   chat-rooms/{roomId}/ - id, participants[], lastMessage, lastMessageTime
//   chat-messages/{roomId}/{messageId}/ - id, senderUID, content, mediaBase64, mediaMimeType, isRead, createdAt
//   followers/{uid}/{followedUid}: true
//   following/{uid}/{followingUid}: true
//   notifications/{uid}/{notificationId}/

// ===== Supabase Table Structure =====
// CREATE TABLE users ( ... );
// CREATE TABLE posts ( ... );
// CREATE TABLE post_likes ( ... );
// CREATE TABLE post_favorites ( ... );
// CREATE TABLE comments ( ... );
// CREATE TABLE comment_likes ( ... );
// CREATE TABLE stories ( ... );
// CREATE TABLE chat_rooms ( ... );
// CREATE TABLE chat_messages ( ... );
// CREATE TABLE followers ( ... );
// CREATE TABLE notifications ( ... );

// ===== Helper: Upload media as Base64 to Firebase Storage =====
/*
export async function uploadMediaBase64(base64Data: string, path: string): Promise<string> {
  // Convert base64 to blob
  const response = await fetch(base64Data);
  const blob = await response.blob();

  // Upload to Firebase Storage
  const fileRef = storageRef(storage, path);
  await uploadBytes(fileRef, blob);

  // Get download URL
  return getDownloadURL(fileRef);
}
*/

// ===== Helper: Upload media as Base64 to Supabase Storage =====
/*
export async function uploadMediaBase64Supabase(base64Data: string, bucket: string, path: string): Promise<string> {
  const response = await fetch(base64Data);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return urlData.publicUrl;
}
*/

// ===== Environment Variables Template =====
// Create a .env.local file with:

// Firebase:
// NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
// NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
// NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
// NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

// Supabase:
// NEXT_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

export const DB_PATHS = {
  USERS: 'skyline/users',
  POSTS: 'skyline/posts',
  POST_LIKES: 'skyline/posts-likes',
  POST_FAVORITES: 'skyline/posts-favorites',
  POST_COMMENTS: 'skyline/posts-comments',
  COMMENT_LIKES: 'skyline/posts-comments-like',
  STORIES: 'skyline/stories',
  CHAT_ROOMS: 'skyline/chat-rooms',
  CHAT_MESSAGES: 'skyline/chat-messages',
  FOLLOWERS: 'skyline/followers',
  FOLLOWING: 'skyline/following',
  NOTIFICATIONS: 'skyline/notifications',
} as const;
