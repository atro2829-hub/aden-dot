"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ──────────────────────── Types ──────────────────────── */

export type GiftCategory = "love" | "celebration" | "luxury" | "nature" | "fun";

export interface AnimatedGift {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  category: GiftCategory;
  svgRenderer: (size?: number) => React.ReactNode;
}

/* ──────────────────── Category Meta ──────────────────── */

const CATEGORY_META: Record<GiftCategory, { labelAr: string; labelEn: string; color: string; gradient: string }> = {
  love: { labelAr: "حب", labelEn: "Love", color: "#e11d48", gradient: "from-rose-500 to-pink-600" },
  celebration: { labelAr: "احتفال", labelEn: "Celebration", color: "#f59e0b", gradient: "from-amber-400 to-orange-500" },
  luxury: { labelAr: "فخامة", labelEn: "Luxury", color: "#a855f7", gradient: "from-purple-500 to-indigo-600" },
  nature: { labelAr: "طبيعة", labelEn: "Nature", color: "#22c55e", gradient: "from-emerald-400 to-teal-500" },
  fun: { labelAr: "مرح", labelEn: "Fun", color: "#3b82f6", gradient: "from-blue-400 to-cyan-500" },
};

/* ──────────────── Shared Keyframe Styles ──────────────── */

const KEYFRAMES = `
@keyframes ag-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes ag-bounce { 0%,100%{transform:translateY(0) scaleY(1)} 30%{transform:translateY(-8px) scaleY(1.05)} 60%{transform:translateY(0) scaleY(.95)} }
@keyframes ag-spin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
@keyframes ag-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:.85} }
@keyframes ag-shake { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-8deg)} 40%{transform:rotate(8deg)} 60%{transform:rotate(-5deg)} 80%{transform:rotate(5deg)} }
@keyframes ag-sparkle { 0%,100%{opacity:1;filter:brightness(1)} 50%{opacity:.7;filter:brightness(1.6)} }
@keyframes ag-glow { 0%,100%{filter:drop-shadow(0 0 2px currentColor)} 50%{filter:drop-shadow(0 0 10px currentColor)} }
@keyframes ag-heartbeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.15)} 28%{transform:scale(1)} 42%{transform:scale(1.1)} }
@keyframes ag-wiggle { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-6deg)} 75%{transform:rotate(6deg)} }
@keyframes ag-rise { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(-20px);opacity:.3} }
`;

/* ══════════════════════════════════════════════════════════
   LOVE GIFTS  (10 – 500 coins)
   ══════════════════════════════════════════════════════════ */

const loveGifts: AnimatedGift[] = [
  {
    id: "heart-balloon",
    nameAr: "بالون قلب",
    nameEn: "Heart Balloon",
    price: 10,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .hb{animation:ag-float 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="hb-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fb7185"/><stop offset="100%" stopColor="#e11d48"/></linearGradient>
          <radialGradient id="hb-h" cx=".35" cy=".3" r=".5"><stop offset="0%" stopColor="#fff" stopOpacity=".6"/><stop offset="100%" stopColor="#fff" stopOpacity="0"/></radialGradient>
        </defs>
        <g className="hb">
          <path d="M24 42C24 42 23 40 22 38C21 36 18 33 18 28C18 23 24 18 24 18C24 18 30 23 30 28C30 33 27 36 26 38C25 40 24 42 24 42Z" fill="#888" opacity=".5"/>
          <path d="M24 18C24 18 14 18 14 10C14 4 24 2 24 10C24 2 34 4 34 10C34 18 24 18 24 18Z" fill="url(#hb-g)"/>
          <ellipse cx="20" cy="8" rx="4" ry="5" fill="url(#hb-h)"/>
        </g>
      </svg>
    ),
  },
  {
    id: "rose",
    nameAr: "وردة",
    nameEn: "Rose",
    price: 20,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .rs{animation:ag-pulse 2.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="rs-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e"/><stop offset="100%" stopColor="#9f1239"/></linearGradient>
          <linearGradient id="rs-stem" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#15803d"/></linearGradient>
        </defs>
        <g className="rs">
          <path d="M24 44L24 22" stroke="url(#rs-stem)" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M24 32C24 32 18 30 16 27C16 27 20 28 24 32Z" fill="#22c55e"/>
          <path d="M24 36C24 36 30 34 32 31C32 31 28 32 24 36Z" fill="#16a34a"/>
          <ellipse cx="24" cy="16" rx="8" ry="9" fill="url(#rs-g)"/>
          <path d="M24 7C22 10 18 12 20 17C22 14 24 13 24 13C24 13 26 14 28 17C30 12 26 10 24 7Z" fill="#be123c"/>
          <ellipse cx="24" cy="16" rx="3" ry="4" fill="#fda4af"/>
          <path d="M21 14C22 16 24 18 24 18C24 18 26 16 27 14" stroke="#9f1239" strokeWidth=".8" fill="none"/>
        </g>
      </svg>
    ),
  },
  {
    id: "love-letter",
    nameAr: "رسالة حب",
    nameEn: "Love Letter",
    price: 30,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .ll{animation:ag-shake 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="ll-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fda4af"/><stop offset="100%" stopColor="#e11d48"/></linearGradient>
        </defs>
        <g className="ll">
          <rect x="8" y="10" width="32" height="24" rx="3" fill="url(#ll-g)"/>
          <path d="M8 13L24 25L40 13" stroke="#fff" strokeWidth="1.5" fill="none" opacity=".7"/>
          <path d="M8 34L20 24" stroke="#fff" strokeWidth="1" fill="none" opacity=".4"/>
          <path d="M40 34L28 24" stroke="#fff" strokeWidth="1" fill="none" opacity=".4"/>
          <path d="M20 8C20 6 22 4 24 6C26 4 28 6 28 8C28 12 24 14 24 14C24 14 20 12 20 8Z" fill="#e11d48"/>
        </g>
      </svg>
    ),
  },
  {
    id: "chocolate-box",
    nameAr: "صندوق شوكولاتة",
    nameEn: "Chocolate Box",
    price: 50,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .cb{animation:ag-bounce 1.8s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="cb-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#92400e"/><stop offset="100%" stopColor="#451a03"/></linearGradient>
          <radialGradient id="cb-c1" cx=".5" cy=".5" r=".5"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#92400e"/></radialGradient>
          <radialGradient id="cb-c2" cx=".5" cy=".5" r=".5"><stop offset="0%" stopColor="#f472b6"/><stop offset="100%" stopColor="#9f1239"/></radialGradient>
          <radialGradient id="cb-c3" cx=".5" cy=".5" r=".5"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#5b21b6"/></radialGradient>
        </defs>
        <g className="cb">
          <path d="M6 20L10 38H38L42 20H6Z" fill="url(#cb-g)"/>
          <rect x="6" y="14" width="36" height="6" rx="1" fill="#78350f"/>
          <path d="M6 14L24 8L42 14" fill="#a16207" stroke="#92400e" strokeWidth=".5"/>
          <circle cx="17" cy="26" r="4" fill="url(#cb-c1)"/>
          <circle cx="31" cy="26" r="4" fill="url(#cb-c2)"/>
          <circle cx="24" cy="32" r="4" fill="url(#cb-c3)"/>
          <path d="M16 17L24 13L32 17" stroke="#d4a574" strokeWidth=".5" fill="none" opacity=".6"/>
        </g>
      </svg>
    ),
  },
  {
    id: "teddy-bear",
    nameAr: "دب محشو",
    nameEn: "Teddy Bear",
    price: 80,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .tb{animation:ag-float 2.2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <radialGradient id="tb-g" cx=".5" cy=".4" r=".6"><stop offset="0%" stopColor="#d4a574"/><stop offset="100%" stopColor="#8b5e3c"/></radialGradient>
        </defs>
        <g className="tb">
          <circle cx="12" cy="12" r="6" fill="url(#tb-g)"/>
          <circle cx="36" cy="12" r="6" fill="url(#tb-g)"/>
          <circle cx="12" cy="12" r="3" fill="#a0724e"/>
          <circle cx="36" cy="12" r="3" fill="#a0724e"/>
          <ellipse cx="24" cy="28" rx="14" ry="16" fill="url(#tb-g)"/>
          <ellipse cx="24" cy="20" rx="10" ry="8" fill="#c4956a"/>
          <circle cx="20" cy="18" r="2" fill="#3a2010"/>
          <circle cx="28" cy="18" r="2" fill="#3a2010"/>
          <ellipse cx="24" cy="22" rx="2.5" ry="1.8" fill="#3a2010"/>
          <circle cx="20" cy="17.5" r=".7" fill="#fff"/>
          <circle cx="28" cy="17.5" r=".7" fill="#fff"/>
          <ellipse cx="24" cy="36" rx="8" ry="6" fill="#c4956a"/>
          <path d="M22 24C22 24 23 25.5 24 25.5C25 25.5 26 24 26 24" stroke="#3a2010" strokeWidth=".8" fill="none"/>
        </g>
      </svg>
    ),
  },
  {
    id: "cupid-arrow",
    nameAr: "سهم كيوبيد",
    nameEn: "Cupid Arrow",
    price: 100,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .ca{animation:ag-bounce 1.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="ca-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
        </defs>
        <g className="ca">
          <line x1="6" y1="42" x2="36" y2="12" stroke="url(#ca-g)" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M30 6L42 6L42 18Z" fill="#e11d48" transform="rotate(45 36 12)"/>
          <path d="M6 42L2 44L4 40" stroke="#d97706" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
          <path d="M6 42L8 46L4 44" stroke="#d97706" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
          <path d="M14 14C14 12 16 10 18 12C20 10 22 12 22 14C22 18 18 20 18 20C18 20 14 18 14 14Z" fill="#e11d48" transform="rotate(-45 18 16)"/>
        </g>
      </svg>
    ),
  },
  {
    id: "love-potion",
    nameAr: "جرعة حب",
    nameEn: "Love Potion",
    price: 150,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .lp{animation:ag-glow 2s ease-in-out infinite;transform-origin:center;color:#e11d48}`}</style>
        <defs>
          <linearGradient id="lp-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#e11d48"/></linearGradient>
          <radialGradient id="lp-liq" cx=".5" cy=".6" r=".5"><stop offset="0%" stopColor="#f472b6"/><stop offset="100%" stopColor="#9f1239"/></radialGradient>
        </defs>
        <g className="lp">
          <rect x="20" y="6" width="8" height="6" rx="1" fill="#9ca3af"/>
          <rect x="22" y="4" width="4" height="4" rx="2" fill="#6b7280"/>
          <path d="M20 12C20 12 14 18 14 28C14 36 18 40 24 40C30 40 34 36 34 28C34 18 28 12 28 12Z" fill="url(#lp-g)" opacity=".8"/>
          <path d="M16 28C16 22 20 16 24 14L24 38C20 36 16 34 16 28Z" fill="url(#lp-liq)" opacity=".7"/>
          <circle cx="22" cy="26" r="1.5" fill="#fda4af" opacity=".8"/>
          <circle cx="26" cy="30" r="1" fill="#fda4af" opacity=".6"/>
          <circle cx="24" cy="22" r="1.2" fill="#fda4af" opacity=".7"/>
        </g>
      </svg>
    ),
  },
  {
    id: "diamond-ring",
    nameAr: "خاتم ألماس",
    nameEn: "Diamond Ring",
    price: 250,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .dr{animation:ag-sparkle 1.8s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="dr-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
          <linearGradient id="dr-dia" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#e0f2fe"/><stop offset="50%" stopColor="#7dd3fc"/><stop offset="100%" stopColor="#bae6fd"/></linearGradient>
        </defs>
        <g className="dr">
          <ellipse cx="24" cy="30" rx="12" ry="10" stroke="url(#dr-g)" strokeWidth="3" fill="none"/>
          <ellipse cx="24" cy="30" rx="10" ry="8" stroke="#fde68a" strokeWidth="1" fill="none" opacity=".4"/>
          <path d="M18 18L24 8L30 18L24 22Z" fill="url(#dr-dia)" stroke="#93c5fd" strokeWidth=".8"/>
          <line x1="24" y1="8" x2="24" y2="22" stroke="#bfdbfe" strokeWidth=".6" opacity=".6"/>
          <line x1="18" y1="18" x2="30" y2="18" stroke="#bfdbfe" strokeWidth=".6" opacity=".6"/>
          <circle cx="20" cy="10" r="1" fill="#fff" opacity=".8"/>
        </g>
      </svg>
    ),
  },
  {
    id: "kissing-lips",
    nameAr: "شفاه تقبيل",
    nameEn: "Kissing Lips",
    price: 350,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .kl{animation:ag-pulse 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="kl-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fb7185"/><stop offset="100%" stopColor="#be123c"/></linearGradient>
        </defs>
        <g className="kl">
          <path d="M24 28C24 28 10 22 10 16C10 10 17 8 24 14C31 8 38 10 38 16C38 22 24 28 24 28Z" fill="url(#kl-g)"/>
          <path d="M24 28C24 28 10 34 10 28C10 24 16 22 24 22C32 22 38 24 38 28C38 34 24 28 24 28Z" fill="#9f1239"/>
          <path d="M14 16C16 14 20 14 24 18" stroke="#fda4af" strokeWidth=".8" fill="none" opacity=".5"/>
          <path d="M34 16C32 14 28 14 24 18" stroke="#fda4af" strokeWidth=".8" fill="none" opacity=".5"/>
          <ellipse cx="24" cy="24" rx="3" ry="2" fill="#f43f5e" opacity=".5"/>
        </g>
      </svg>
    ),
  },
  {
    id: "love-birds",
    nameAr: "طيور الحب",
    nameEn: "Love Birds",
    price: 500,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .lb{animation:ag-float 2.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="lb-g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fb923c"/><stop offset="100%" stopColor="#ea580c"/></linearGradient>
          <linearGradient id="lb-g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#0369a1"/></linearGradient>
        </defs>
        <g className="lb">
          <path d="M8 20C8 14 14 12 18 16C22 12 24 16 22 20C20 24 14 26 8 20Z" fill="url(#lb-g1)"/>
          <circle cx="12" cy="17" r="1" fill="#1e1e1e"/>
          <path d="M6 18L3 16" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M40 20C40 14 34 12 30 16C26 12 24 16 26 20C28 24 34 26 40 20Z" fill="url(#lb-g2)"/>
          <circle cx="36" cy="17" r="1" fill="#1e1e1e"/>
          <path d="M42 18L45 16" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M18 20C20 22 22 22 22 20" stroke="#f97316" strokeWidth=".8" fill="none"/>
          <path d="M30 20C28 22 26 22 26 20" stroke="#0ea5e9" strokeWidth=".8" fill="none"/>
          <path d="M20 24C21 22 23 22 24 24C25 22 27 22 28 24" stroke="#e11d48" strokeWidth="1" fill="none"/>
        </g>
      </svg>
    ),
  },
  {
    id: "heart-crown",
    nameAr: "قلب متوج",
    nameEn: "Heart Crown",
    price: 150,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .hc{animation:ag-float 2.2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="hc-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fb7185"/><stop offset="100%" stopColor="#be123c"/></linearGradient>
          <linearGradient id="hc-crown" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
        </defs>
        <g className="hc">
          <path d="M24 42C18 36 8 28 8 18C8 10 14 6 20 8C22 9 24 12 24 12C24 12 26 9 28 8C34 6 40 10 40 18C40 28 30 36 24 42Z" fill="url(#hc-g)"/>
          <path d="M14 14L18 10L22 14L24 8L26 14L30 10L34 14L32 18L16 18Z" fill="url(#hc-crown)"/>
          <circle cx="18" cy="11" r="1.5" fill="#e11d48"/>
          <circle cx="24" cy="9" r="1.5" fill="#3b82f6"/>
          <circle cx="30" cy="11" r="1.5" fill="#22c55e"/>
          <ellipse cx="20" cy="24" rx="5" ry="4" fill="#fda4af" opacity=".3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "diamond-heart",
    nameAr: "قلب ألماس",
    nameEn: "Diamond Heart",
    price: 500,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .dh{animation:ag-sparkle 1.8s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="dh-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#e0f2fe"/><stop offset="50%" stopColor="#7dd3fc"/><stop offset="100%" stopColor="#bae6fd"/></linearGradient>
        </defs>
        <g className="dh">
          <path d="M24 42C18 36 8 28 8 18C8 10 14 6 20 8C22 9 24 12 24 12C24 12 26 9 28 8C34 6 40 10 40 18C40 28 30 36 24 42Z" fill="url(#dh-g)" opacity=".8"/>
          <line x1="24" y1="12" x2="16" y2="24" stroke="#93c5fd" strokeWidth=".6" opacity=".5"/>
          <line x1="24" y1="12" x2="32" y2="24" stroke="#93c5fd" strokeWidth=".6" opacity=".5"/>
          <line x1="16" y1="24" x2="24" y2="42" stroke="#93c5fd" strokeWidth=".6" opacity=".5"/>
          <line x1="32" y1="24" x2="24" y2="42" stroke="#93c5fd" strokeWidth=".6" opacity=".5"/>
          <line x1="8" y1="18" x2="40" y2="18" stroke="#bfdbfe" strokeWidth=".4" opacity=".4"/>
          <line x1="12" y1="28" x2="36" y2="28" stroke="#bfdbfe" strokeWidth=".4" opacity=".3"/>
          <circle cx="18" cy="16" r="1" fill="#fff" opacity=".8"/>
          <circle cx="28" cy="14" r=".8" fill="#fff" opacity=".7"/>
        </g>
      </svg>
    ),
  },
  {
    id: "rose-bouquet",
    nameAr: "باقة ورد",
    nameEn: "Rose Bouquet",
    price: 200,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .rbq{animation:ag-pulse 2.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <radialGradient id="rbq-r1" cx=".4" cy=".3" r=".5"><stop offset="0%" stopColor="#fb7185"/><stop offset="100%" stopColor="#e11d48"/></radialGradient>
          <radialGradient id="rbq-r2" cx=".4" cy=".3" r=".5"><stop offset="0%" stopColor="#fda4af"/><stop offset="100%" stopColor="#f43f5e"/></radialGradient>
          <radialGradient id="rbq-r3" cx=".4" cy=".3" r=".5"><stop offset="0%" stopColor="#fecdd3"/><stop offset="100%" stopColor="#fb7185"/></radialGradient>
        </defs>
        <g className="rbq">
          <path d="M20 28L18 44" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
          <path d="M28 28L30 44" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
          <path d="M24 30L24 44" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
          <path d="M22 36C22 36 16 34 14 31C16 33 20 35 22 36Z" fill="#22c55e"/>
          <path d="M26 38C26 38 32 36 34 33C32 35 28 37 26 38Z" fill="#16a34a"/>
          <ellipse cx="18" cy="16" rx="6" ry="7" fill="url(#rbq-r1)"/>
          <ellipse cx="30" cy="16" rx="6" ry="7" fill="url(#rbq-r2)"/>
          <ellipse cx="24" cy="12" rx="7" ry="8" fill="url(#rbq-r3)"/>
          <ellipse cx="16" cy="15" rx="2.5" ry="3" fill="#fda4af" opacity=".5"/>
          <ellipse cx="32" cy="15" rx="2.5" ry="3" fill="#fda4af" opacity=".5"/>
          <ellipse cx="24" cy="10" rx="3" ry="4" fill="#fff" opacity=".3"/>
          <path d="M16 26L32 26" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
        </g>
      </svg>
    ),
  },
  {
    id: "love-lock",
    nameAr: "قفل الحب",
    nameEn: "Love Lock",
    price: 60,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .lk{animation:ag-shake 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="lk-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fda4af"/><stop offset="100%" stopColor="#e11d48"/></linearGradient>
        </defs>
        <g className="lk">
          <path d="M16 22V16C16 10 20 6 24 6C28 6 32 10 32 16V22" stroke="#9ca3af" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <rect x="12" y="22" width="24" height="18" rx="3" fill="url(#lk-g)"/>
          <circle cx="24" cy="30" r="3" fill="#9f1239"/>
          <rect x="23" y="32" width="2" height="5" rx="1" fill="#9f1239"/>
          <path d="M20 26C22 24 26 24 28 26" stroke="#fda4af" strokeWidth=".8" fill="none" opacity=".5"/>
          <circle cx="18" cy="26" r="1" fill="#fff" opacity=".4"/>
          <circle cx="30" cy="26" r="1" fill="#fff" opacity=".4"/>
        </g>
      </svg>
    ),
  },
  {
    id: "heart-wings",
    nameAr: "قلب مجنح",
    nameEn: "Heart Wings",
    price: 300,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .hw{animation:ag-float 1.8s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="hw-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fb7185"/><stop offset="100%" stopColor="#e11d48"/></linearGradient>
          <linearGradient id="hw-w1" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#cbd5e1"/></linearGradient>
          <linearGradient id="hw-w2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#cbd5e1"/></linearGradient>
        </defs>
        <g className="hw">
          <path d="M4 18C4 12 8 8 14 10C16 11 18 14 18 18C18 24 4 26 4 18Z" fill="url(#hw-w1)" opacity=".8"/>
          <path d="M2 22C2 18 6 14 10 16C10 16 8 20 4 22Z" fill="#e2e8f0" opacity=".6"/>
          <path d="M44 18C44 12 40 8 34 10C32 11 30 14 30 18C30 24 44 26 44 18Z" fill="url(#hw-w2)" opacity=".8"/>
          <path d="M46 22C46 18 42 14 38 16C38 16 40 20 44 22Z" fill="#e2e8f0" opacity=".6"/>
          <path d="M24 38C20 34 14 28 14 20C14 14 18 10 22 12C23 13 24 14 24 14C24 14 25 13 26 12C30 10 34 14 34 20C34 28 28 34 24 38Z" fill="url(#hw-g)"/>
          <ellipse cx="21" cy="20" rx="3" ry="4" fill="#fda4af" opacity=".3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "love-candle",
    nameAr: "شمعة حب",
    nameEn: "Love Candle",
    price: 70,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .lc{animation:ag-glow 2s ease-in-out infinite;transform-origin:center;color:#f59e0b}`}</style>
        <defs>
          <linearGradient id="lc-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fda4af"/><stop offset="100%" stopColor="#e11d48"/></linearGradient>
          <radialGradient id="lc-flame" cx=".5" cy=".3" r=".5"><stop offset="0%" stopColor="#fef9c3"/><stop offset="50%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#f97316"/></radialGradient>
        </defs>
        <g className="lc">
          <rect x="18" y="20" width="12" height="22" rx="3" fill="url(#lc-g)"/>
          <rect x="20" y="22" width="8" height="18" rx="2" fill="#fda4af" opacity=".4"/>
          <rect x="22" y="8" width="4" height="12" rx="1" fill="#f1f5f9"/>
          <ellipse cx="24" cy="8" rx="4" ry="6" fill="url(#lc-flame)"/>
          <ellipse cx="24" cy="7" rx="2" ry="3.5" fill="#fef9c3"/>
          <ellipse cx="24" cy="6" rx="1" ry="2" fill="#fff" opacity=".8"/>
          <path d="M22 28C23 27 25 27 26 28" stroke="#be123c" strokeWidth=".6" fill="none" opacity=".5"/>
          <path d="M22 32C23 31 25 31 26 32" stroke="#be123c" strokeWidth=".6" fill="none" opacity=".5"/>
          <path d="M21 20C22 19 26 19 27 20" stroke="#9f1239" strokeWidth=".8" fill="none"/>
        </g>
      </svg>
    ),
  },
  {
    id: "eternal-flame",
    nameAr: "لهيب أبدي",
    nameEn: "Eternal Flame",
    price: 800,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .ef{animation:ag-rise 1.5s ease-in-out infinite alternate;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="ef-g" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#e11d48"/><stop offset="40%" stopColor="#f97316"/><stop offset="100%" stopColor="#fbbf24"/></linearGradient>
          <radialGradient id="ef-core" cx=".5" cy=".6" r=".4"><stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fbbf24" stopOpacity="0"/></radialGradient>
        </defs>
        <g className="ef">
          <path d="M24 4C24 4 36 14 36 28C36 36 30 42 24 42C18 42 12 36 12 28C12 14 24 4 24 4Z" fill="url(#ef-g)"/>
          <path d="M24 12C24 12 32 20 32 30C32 36 28 40 24 40C20 40 16 36 16 30C16 20 24 12 24 12Z" fill="#f97316" opacity=".6"/>
          <ellipse cx="24" cy="32" rx="6" ry="8" fill="url(#ef-core)"/>
          <path d="M20 36C20 36 22 34 24 36C26 34 28 36 28 36" stroke="#e11d48" strokeWidth="1" fill="none" opacity=".4"/>
          <ellipse cx="24" cy="28" rx="3" ry="5" fill="#fef9c3" opacity=".4"/>
          <circle cx="20" cy="18" r="1" fill="#fde68a" opacity=".6"/>
          <circle cx="28" cy="22" r="1" fill="#fde68a" opacity=".5"/>
        </g>
      </svg>
    ),
  },
  {
    id: "blushing-heart",
    nameAr: "قلب خجول",
    nameEn: "Blushing Heart",
    price: 40,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .bh{animation:ag-heartbeat 1.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="bh-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fda4af"/><stop offset="100%" stopColor="#e11d48"/></linearGradient>
        </defs>
        <g className="bh">
          <path d="M24 42C18 36 8 28 8 18C8 10 14 6 20 8C22 9 24 12 24 12C24 12 26 9 28 8C34 6 40 10 40 18C40 28 30 36 24 42Z" fill="url(#bh-g)"/>
          <ellipse cx="16" cy="22" rx="4" ry="2.5" fill="#f43f5e" opacity=".3"/>
          <ellipse cx="32" cy="22" rx="4" ry="2.5" fill="#f43f5e" opacity=".3"/>
          <circle cx="19" cy="18" r="2" fill="#1e1e1e"/>
          <circle cx="29" cy="18" r="2" fill="#1e1e1e"/>
          <circle cx="19.5" cy="17.5" r=".7" fill="#fff"/>
          <circle cx="29.5" cy="17.5" r=".7" fill="#fff"/>
          <path d="M21 26C22 28 26 28 27 26" stroke="#9f1239" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        </g>
      </svg>
    ),
  },
  {
    id: "sweet-candy",
    nameAr: "حلوى لذيذة",
    nameEn: "Sweet Candy",
    price: 45,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .sc2{animation:ag-wiggle 1.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="sc2-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f472b6"/><stop offset="50%" stopColor="#e11d48"/><stop offset="100%" stopColor="#f472b6"/></linearGradient>
        </defs>
        <g className="sc2">
          <ellipse cx="24" cy="24" rx="10" ry="7" fill="url(#sc2-g)"/>
          <path d="M14 24L6 20L6 28Z" fill="#fda4af"/>
          <path d="M34 24L42 20L42 28Z" fill="#fda4af"/>
          <path d="M14 24L8 22L8 26Z" fill="#f43f5e" opacity=".5"/>
          <path d="M34 24L40 22L40 26Z" fill="#f43f5e" opacity=".5"/>
          <line x1="17" y1="24" x2="31" y2="24" stroke="#fff" strokeWidth="1.5" opacity=".3"/>
          <ellipse cx="22" cy="22" rx="2" ry="1.5" fill="#fff" opacity=".2"/>
        </g>
      </svg>
    ),
  },
  {
    id: "promise-ring",
    nameAr: "خاتم وعد",
    nameEn: "Promise Ring",
    price: 350,
    category: "love",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .pr{animation:ag-glow 2s ease-in-out infinite;transform-origin:center;color:#e11d48}`}</style>
        <defs>
          <linearGradient id="pr-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#b45309"/></linearGradient>
        </defs>
        <g className="pr">
          <ellipse cx="24" cy="28" rx="12" ry="10" stroke="url(#pr-g)" strokeWidth="3.5" fill="none"/>
          <ellipse cx="24" cy="28" rx="10" ry="8" stroke="#fef3c7" strokeWidth="1" fill="none" opacity=".3"/>
          <path d="M20 18C20 18 22 14 24 16C26 14 28 18 28 18C28 20 26 22 24 20C22 22 20 20 20 18Z" fill="#e11d48"/>
          <circle cx="20" cy="12" r="1" fill="#fbbf24" opacity=".6"/>
          <circle cx="28" cy="12" r="1" fill="#fbbf24" opacity=".6"/>
        </g>
      </svg>
    ),
  },
];

/* ══════════════════════════════════════════════════════════
   CELEBRATION GIFTS  (100 – 2000 coins)
   ══════════════════════════════════════════════════════════ */

const celebrationGifts: AnimatedGift[] = [
  {
    id: "party-hat",
    nameAr: "قبعة حفلة",
    nameEn: "Party Hat",
    price: 100,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .ph{animation:ag-bounce 1.6s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="ph-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fbbf24"/><stop offset="50%" stopColor="#a855f7"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient>
        </defs>
        <g className="ph">
          <path d="M24 4L10 40H38L24 4Z" fill="url(#ph-g)"/>
          <path d="M24 4L20 18L28 14Z" fill="#fff" opacity=".2"/>
          <circle cx="24" cy="4" r="2.5" fill="#fbbf24"/>
          <ellipse cx="17" cy="20" rx="2" ry="1.5" fill="#fff" opacity=".4"/>
          <ellipse cx="30" cy="26" rx="2" ry="1.5" fill="#fff" opacity=".4"/>
          <ellipse cx="20" cy="32" rx="2" ry="1.5" fill="#fff" opacity=".4"/>
          <path d="M8 40C8 40 14 44 24 44C34 44 40 40 40 40" stroke="#fbbf24" strokeWidth="2" fill="none"/>
        </g>
      </svg>
    ),
  },
  {
    id: "confetti",
    nameAr: "كونفيتي",
    nameEn: "Confetti",
    price: 200,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .cf1{animation:ag-shake 1.2s ease-in-out infinite}.cf2{animation:ag-float 1.5s ease-in-out infinite .3s}.cf3{animation:ag-shake 1.4s ease-in-out infinite .6s}`}</style>
        <defs>
          <linearGradient id="cf-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#f59e0b"/></linearGradient>
        </defs>
        <g className="cf1">
          <rect x="6" y="8" width="5" height="3" rx="1" fill="#e11d48" transform="rotate(25 8 9)"/>
          <rect x="36" y="6" width="5" height="3" rx="1" fill="#3b82f6" transform="rotate(-15 38 7)"/>
          <circle cx="18" cy="14" r="2" fill="#fbbf24"/>
          <rect x="28" y="12" width="4" height="2.5" rx="1" fill="#22c55e" transform="rotate(40 30 13)"/>
        </g>
        <g className="cf2">
          <rect x="10" y="24" width="5" height="3" rx="1" fill="#a855f7" transform="rotate(-30 12 25)"/>
          <rect x="32" y="22" width="5" height="3" rx="1" fill="#f97316" transform="rotate(20 34 23)"/>
          <circle cx="24" cy="20" r="2.5" fill="#ec4899"/>
          <rect x="22" y="10" width="3" height="4" rx="1" fill="#14b8a6" transform="rotate(15 23 12)"/>
        </g>
        <g className="cf3">
          <rect x="8" y="36" width="5" height="3" rx="1" fill="#06b6d4" transform="rotate(35 10 37)"/>
          <rect x="34" y="34" width="5" height="3" rx="1" fill="#e11d48" transform="rotate(-25 36 35)"/>
          <circle cx="20" cy="38" r="2" fill="#fbbf24"/>
          <circle cx="30" cy="40" r="1.5" fill="#a855f7"/>
          <rect x="16" y="30" width="4" height="2.5" rx="1" fill="#22c55e" transform="rotate(50 18 31)"/>
        </g>
      </svg>
    ),
  },
  {
    id: "birthday-cake",
    nameAr: "كيكة عيد ميلاد",
    nameEn: "Birthday Cake",
    price: 300,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .bc{animation:ag-glow 2s ease-in-out infinite;transform-origin:center;color:#f59e0b}`}</style>
        <defs>
          <linearGradient id="bc-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fda4af"/><stop offset="100%" stopColor="#e11d48"/></linearGradient>
          <linearGradient id="bc-ice" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fef3c7"/><stop offset="100%" stopColor="#fde68a"/></linearGradient>
        </defs>
        <g className="bc">
          <rect x="10" y="28" width="28" height="12" rx="3" fill="url(#bc-g)"/>
          <rect x="14" y="22" width="20" height="8" rx="2" fill="url(#bc-ice)"/>
          <path d="M14 28C16 26 20 26 24 28C28 26 32 26 34 28" stroke="#fbbf24" strokeWidth="1" fill="none"/>
          <rect x="22" y="14" width="4" height="8" rx="1" fill="#fbbf24"/>
          <ellipse cx="24" cy="12" rx="3" ry="3" fill="#f97316" opacity=".9"/>
          <ellipse cx="24" cy="10" rx="2" ry="2" fill="#fbbf24" opacity=".8"/>
          <ellipse cx="24" cy="9" rx="1" ry="1.5" fill="#fef3c7"/>
          <circle cx="16" cy="34" r="1.5" fill="#fff" opacity=".5"/>
          <circle cx="24" cy="36" r="1.5" fill="#fff" opacity=".5"/>
          <circle cx="32" cy="34" r="1.5" fill="#fff" opacity=".5"/>
        </g>
      </svg>
    ),
  },
  {
    id: "fireworks",
    nameAr: "ألعاب نارية",
    nameEn: "Fireworks",
    price: 500,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .fw{animation:ag-sparkle 1s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <radialGradient id="fw-g1" cx=".5" cy=".5" r=".5"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/></radialGradient>
          <radialGradient id="fw-g2" cx=".5" cy=".5" r=".5"><stop offset="0%" stopColor="#f472b6"/><stop offset="100%" stopColor="#e11d48" stopOpacity="0"/></radialGradient>
          <radialGradient id="fw-g3" cx=".5" cy=".5" r=".5"><stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/></radialGradient>
        </defs>
        <g className="fw">
          <circle cx="16" cy="16" r="6" fill="url(#fw-g1)"/>
          <line x1="16" y1="16" x2="8" y2="8" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="16" y1="16" x2="24" y2="8" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="16" y1="16" x2="8" y2="24" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="16" y1="16" x2="24" y2="24" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="16" y1="16" x2="16" y2="6" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="16" y1="16" x2="6" y2="16" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="34" cy="14" r="5" fill="url(#fw-g2)"/>
          <line x1="34" y1="14" x2="28" y2="8" stroke="#f472b6" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="34" y1="14" x2="40" y2="8" stroke="#f472b6" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="34" y1="14" x2="28" y2="20" stroke="#f472b6" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="34" y1="14" x2="40" y2="20" stroke="#f472b6" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="24" cy="36" r="5" fill="url(#fw-g3)"/>
          <line x1="24" y1="36" x2="18" y2="30" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="24" y1="36" x2="30" y2="30" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="24" y1="36" x2="18" y2="42" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="24" y1="36" x2="30" y2="42" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="8" cy="8" r="1" fill="#fbbf24" opacity=".7"/>
          <circle cx="40" cy="8" r="1" fill="#f472b6" opacity=".7"/>
          <circle cx="30" cy="30" r="1" fill="#60a5fa" opacity=".7"/>
        </g>
      </svg>
    ),
  },
  {
    id: "champagne",
    nameAr: "شمبانيا",
    nameEn: "Champagne",
    price: 700,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .ch{animation:ag-bounce 1.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="ch-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fef3c7"/><stop offset="100%" stopColor="#fde68a"/></linearGradient>
          <linearGradient id="ch-liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fbbf24"/></linearGradient>
        </defs>
        <g className="ch">
          <path d="M20 8H28V12L30 36C30 40 18 40 18 36L20 12V8Z" fill="url(#ch-g)" opacity=".8"/>
          <path d="M20 12L18 36C18 38 22 40 24 40L24 12Z" fill="url(#ch-liq)" opacity=".5"/>
          <rect x="20" y="6" width="8" height="3" rx="1" fill="#d4d4d8"/>
          <circle cx="22" cy="22" r="1" fill="#fff" opacity=".6"/>
          <circle cx="26" cy="28" r=".8" fill="#fff" opacity=".5"/>
          <circle cx="23" cy="32" r="1.2" fill="#fff" opacity=".4"/>
          <circle cx="24" cy="4" r="1.5" fill="#fef3c7"/>
          <circle cx="22" cy="2" r="1" fill="#fef3c7" opacity=".7"/>
          <circle cx="26" cy="1" r=".8" fill="#fef3c7" opacity=".5"/>
        </g>
      </svg>
    ),
  },
  {
    id: "trophy-cup",
    nameAr: "كأس البطل",
    nameEn: "Trophy Cup",
    price: 1000,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .tc{animation:ag-glow 2s ease-in-out infinite;transform-origin:center;color:#f59e0b}`}</style>
        <defs>
          <linearGradient id="tc-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
        </defs>
        <g className="tc">
          <path d="M14 8H34V18C34 26 28 30 24 30C20 30 14 26 14 18V8Z" fill="url(#tc-g)"/>
          <path d="M14 12C14 12 8 12 8 18C8 22 12 24 14 24" stroke="#d97706" strokeWidth="2" fill="#fde68a"/>
          <path d="M34 12C34 12 40 12 40 18C40 22 36 24 34 24" stroke="#d97706" strokeWidth="2" fill="#fde68a"/>
          <rect x="21" y="30" width="6" height="6" fill="#d97706"/>
          <rect x="16" y="36" width="16" height="4" rx="1" fill="#b45309"/>
          <path d="M20 16L24 12L28 16" stroke="#b45309" strokeWidth="1.5" fill="none"/>
          <ellipse cx="24" cy="18" rx="3" ry="4" fill="#fef3c7" opacity=".3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "star-burst",
    nameAr: "انفجار نجمي",
    nameEn: "Star Burst",
    price: 1200,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .sb{animation:ag-spin 3s linear infinite;transform-origin:24px 24px}`}</style>
        <defs>
          <linearGradient id="sb-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#f97316"/></linearGradient>
        </defs>
        <g className="sb">
          <path d="M24 2L27 18L44 12L30 22L46 30L28 26L32 44L24 30L16 44L20 26L2 30L18 22L4 12L21 18Z" fill="url(#sb-g)"/>
          <circle cx="24" cy="24" r="6" fill="#fef3c7"/>
          <circle cx="24" cy="24" r="3" fill="#fbbf24"/>
        </g>
      </svg>
    ),
  },
  {
    id: "drum",
    nameAr: "طبل",
    nameEn: "Drum",
    price: 1500,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .dm{animation:ag-shake 0.8s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="dm-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#dc2626"/><stop offset="100%" stopColor="#991b1b"/></linearGradient>
        </defs>
        <g className="dm">
          <ellipse cx="24" cy="16" rx="14" ry="5" fill="#fbbf24"/>
          <ellipse cx="24" cy="16" rx="14" ry="5" fill="url(#dm-g)" opacity=".3"/>
          <rect x="10" y="16" width="28" height="16" fill="url(#dm-g)"/>
          <ellipse cx="24" cy="32" rx="14" ry="5" fill="#991b1b"/>
          <line x1="10" y1="20" x2="38" y2="20" stroke="#fbbf24" strokeWidth="1"/>
          <line x1="10" y1="24" x2="38" y2="24" stroke="#fbbf24" strokeWidth="1"/>
          <line x1="10" y1="28" x2="38" y2="28" stroke="#fbbf24" strokeWidth="1"/>
          <line x1="6" y1="8" x2="20" y2="18" stroke="#a16207" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="42" y1="8" x2="28" y2="18" stroke="#a16207" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="6" cy="7" r="2" fill="#fbbf24"/>
          <circle cx="42" cy="7" r="2" fill="#fbbf24"/>
        </g>
      </svg>
    ),
  },
  {
    id: "balloon-bouquet",
    nameAr: "باقة بالونات",
    nameEn: "Balloon Bouquet",
    price: 1800,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .bb1{animation:ag-float 2s ease-in-out infinite}.bb2{animation:ag-float 2.3s ease-in-out infinite .3s}.bb3{animation:ag-float 1.8s ease-in-out infinite .6s}`}</style>
        <defs>
          <radialGradient id="bb-r" cx=".35" cy=".3" r=".5"><stop offset="0%" stopColor="#fca5a5"/><stop offset="100%" stopColor="#e11d48"/></radialGradient>
          <radialGradient id="bb-b" cx=".35" cy=".3" r=".5"><stop offset="0%" stopColor="#93c5fd"/><stop offset="100%" stopColor="#3b82f6"/></radialGradient>
          <radialGradient id="bb-y" cx=".35" cy=".3" r=".5"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#f59e0b"/></radialGradient>
        </defs>
        <g className="bb1">
          <ellipse cx="16" cy="16" rx="8" ry="10" fill="url(#bb-r)"/>
          <path d="M16 26L16 28L24 34" stroke="#9ca3af" strokeWidth="1"/>
        </g>
        <g className="bb2">
          <ellipse cx="30" cy="12" rx="8" ry="10" fill="url(#bb-b)"/>
          <path d="M30 22L30 24L24 34" stroke="#9ca3af" strokeWidth="1"/>
        </g>
        <g className="bb3">
          <ellipse cx="24" cy="8" rx="7" ry="9" fill="url(#bb-y)"/>
          <path d="M24 17L24 20L24 34" stroke="#9ca3af" strokeWidth="1"/>
        </g>
        <path d="M24 34L22 44L26 42Z" fill="#fbbf24"/>
      </svg>
    ),
  },
  {
    id: "gift-box",
    nameAr: "صندوق هدية",
    nameEn: "Gift Box",
    price: 2000,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .gb{animation:ag-bounce 1.4s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="gb-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#1d4ed8"/></linearGradient>
        </defs>
        <g className="gb">
          <rect x="6" y="20" width="36" height="22" rx="2" fill="url(#gb-g)"/>
          <rect x="6" y="14" width="36" height="8" rx="2" fill="#60a5fa"/>
          <rect x="20" y="14" width="8" height="28" fill="#fbbf24"/>
          <rect x="6" y="17" width="36" height="3" fill="#fbbf24" opacity=".5"/>
          <path d="M24 14C24 14 18 8 14 10C10 12 16 14 24 14Z" fill="#fbbf24"/>
          <path d="M24 14C24 14 30 8 34 10C38 12 32 14 24 14Z" fill="#fbbf24"/>
          <circle cx="24" cy="14" r="2" fill="#f59e0b"/>
        </g>
      </svg>
    ),
  },
  {
    id: "confetti-bomb",
    nameAr: "قنبلة كونفيتي",
    nameEn: "Confetti Bomb",
    price: 150,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .cbm{animation:ag-shake 0.8s ease-in-out infinite;transform-origin:center}.cbm-sp{animation:ag-sparkle 1s ease-in-out infinite .2s}`}</style>
        <defs>
          <radialGradient id="cbm-g" cx=".5" cy=".5" r=".5"><stop offset="0%" stopColor="#1e1e1e"/><stop offset="100%" stopColor="#374151"/></radialGradient>
        </defs>
        <g className="cbm">
          <ellipse cx="24" cy="28" rx="10" ry="12" fill="url(#cbm-g)"/>
          <ellipse cx="24" cy="28" rx="10" ry="12" stroke="#4b5563" strokeWidth="1.5" fill="none"/>
          <rect x="20" y="16" width="8" height="4" rx="1" fill="#6b7280"/>
          <line x1="24" y1="16" x2="24" y2="10" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="24" cy="8" r="2" fill="#fbbf24"/>
        </g>
        <g className="cbm-sp">
          <rect x="6" y="6" width="4" height="2" rx=".5" fill="#e11d48" transform="rotate(30 8 7)"/>
          <rect x="38" y="4" width="4" height="2" rx=".5" fill="#3b82f6" transform="rotate(-20 40 5)"/>
          <rect x="4" y="38" width="4" height="2" rx=".5" fill="#22c55e" transform="rotate(45 6 39)"/>
          <rect x="36" y="36" width="4" height="2" rx=".5" fill="#f59e0b" transform="rotate(-35 38 37)"/>
          <circle cx="10" cy="14" r="2" fill="#a855f7" opacity=".7"/>
          <circle cx="38" cy="18" r="1.5" fill="#f472b6" opacity=".7"/>
          <circle cx="14" cy="40" r="1.5" fill="#06b6d4" opacity=".6"/>
          <circle cx="34" cy="10" r="1.5" fill="#fbbf24" opacity=".6"/>
        </g>
      </svg>
    ),
  },
  {
    id: "firework-rocket",
    nameAr: "صاروخ ألعاب نارية",
    nameEn: "Firework Rocket",
    price: 400,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .fwr{animation:ag-rise 1.5s ease-in-out infinite alternate;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="fwr-g" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#dc2626"/><stop offset="100%" stopColor="#fbbf24"/></linearGradient>
          <radialGradient id="fwr-spark" cx=".5" cy=".5" r=".5"><stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fbbf24" stopOpacity="0"/></radialGradient>
        </defs>
        <g className="fwr">
          <path d="M24 46L24 16" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M22 20L24 16L26 20" fill="url(#fwr-g)"/>
          <circle cx="24" cy="14" r="3" fill="url(#fwr-spark)"/>
          <circle cx="24" cy="14" r="1.5" fill="#fef9c3"/>
          <line x1="24" y1="14" x2="16" y2="6" stroke="#e11d48" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="24" y1="14" x2="32" y2="6" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="24" y1="14" x2="14" y2="12" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="24" y1="14" x2="34" y2="12" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="24" y1="14" x2="24" y2="4" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="16" cy="5" r="1.5" fill="#e11d48" opacity=".7"/>
          <circle cx="32" cy="5" r="1.5" fill="#3b82f6" opacity=".7"/>
          <circle cx="24" cy="3" r="1.5" fill="#fbbf24" opacity=".7"/>
          <path d="M20 42L24 46L28 42" stroke="#f97316" strokeWidth="1.5" fill="none" opacity=".6"/>
        </g>
      </svg>
    ),
  },
  {
    id: "party-horn",
    nameAr: "بوق الحفلة",
    nameEn: "Party Horn",
    price: 80,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .pth{animation:ag-wiggle 1.2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="pth-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fbbf24"/><stop offset="50%" stopColor="#f97316"/><stop offset="100%" stopColor="#e11d48"/></linearGradient>
        </defs>
        <g className="pth">
          <path d="M10 38L30 10L36 16L16 44Z" fill="url(#pth-g)"/>
          <ellipse cx="13" cy="41" rx="5" ry="4" fill="#f97316" transform="rotate(-45 13 41)"/>
          <ellipse cx="13" cy="41" rx="3" ry="2" fill="#fbbf24" transform="rotate(-45 13 41)"/>
          <path d="M30 10L34 6L38 10L36 16Z" fill="#e11d48"/>
          <circle cx="34" cy="8" r="1.5" fill="#fbbf24"/>
          <line x1="18" y1="28" x2="24" y2="22" stroke="#fef3c7" strokeWidth=".5" opacity=".4"/>
          <line x1="22" y1="32" x2="28" y2="26" stroke="#fef3c7" strokeWidth=".5" opacity=".4"/>
        </g>
      </svg>
    ),
  },
  {
    id: "award-ribbon",
    nameAr: "شريط جائزة",
    nameEn: "Award Ribbon",
    price: 250,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .ar{animation:ag-bounce 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="ar-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
          <radialGradient id="ar-center" cx=".5" cy=".5" r=".5"><stop offset="0%" stopColor="#fef3c7"/><stop offset="100%" stopColor="#fbbf24"/></radialGradient>
        </defs>
        <g className="ar">
          <circle cx="24" cy="20" r="12" fill="url(#ar-g)"/>
          <circle cx="24" cy="20" r="9" fill="url(#ar-center)"/>
          <circle cx="24" cy="20" r="6" fill="#fbbf24"/>
          <path d="M16 30L12 44L20 38L24 44L28 38L36 44L32 30" fill="#dc2626"/>
          <path d="M16 30L12 44L20 38" fill="#e11d48"/>
          <path d="M32 30L36 44L28 38" fill="#e11d48"/>
          <path d="M22 18L24 14L26 18" stroke="#92400e" strokeWidth="1.2" fill="none"/>
          <circle cx="24" cy="20" r="2" fill="#92400e"/>
        </g>
      </svg>
    ),
  },
  {
    id: "victory-trophy",
    nameAr: "كأس النصر",
    nameEn: "Victory Trophy",
    price: 500,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .vt{animation:ag-glow 2s ease-in-out infinite;transform-origin:center;color:#f59e0b`}</style>
        <defs>
          <linearGradient id="vt-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#b45309"/></linearGradient>
        </defs>
        <g className="vt">
          <path d="M14 6H34V16C34 24 28 28 24 28C20 28 14 24 14 16V6Z" fill="url(#vt-g)"/>
          <path d="M14 10C14 10 6 10 6 16C6 20 10 22 14 22" stroke="#d97706" strokeWidth="2.5" fill="#fde68a"/>
          <path d="M34 10C34 10 42 10 42 16C42 20 38 22 34 22" stroke="#d97706" strokeWidth="2.5" fill="#fde68a"/>
          <rect x="20" y="28" width="8" height="6" fill="#d97706"/>
          <rect x="14" y="34" width="20" height="4" rx="1" fill="#b45309"/>
          <rect x="16" y="38" width="16" height="3" rx="1" fill="#92400e"/>
          <path d="M20 14L24 10L28 14" stroke="#92400e" strokeWidth="1.5" fill="none"/>
          <path d="M20 14L24 18L28 14" stroke="#92400e" strokeWidth="1.5" fill="none"/>
          <ellipse cx="24" cy="14" rx="2" ry="4" fill="#fef3c7" opacity=".3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "new-year-bell",
    nameAr: "جرس العام الجديد",
    nameEn: "New Year Bell",
    price: 1000,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .nyb{animation:ag-shake 1.5s ease-in-out infinite;transform-origin:center top}`}</style>
        <defs>
          <linearGradient id="nyb-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#b45309"/></linearGradient>
        </defs>
        <g className="nyb">
          <circle cx="24" cy="6" r="3" fill="#d97706"/>
          <rect x="22" y="6" width="4" height="4" fill="#d97706"/>
          <path d="M12 34C12 34 12 18 24 14C36 18 36 34 36 34Z" fill="url(#nyb-g)"/>
          <path d="M10 34H38V38H10Z" fill="#d97706"/>
          <circle cx="24" cy="40" r="3" fill="#92400e"/>
          <path d="M16 28C18 24 22 22 24 22" stroke="#fef3c7" strokeWidth=".6" fill="none" opacity=".4"/>
          <ellipse cx="24" cy="20" rx="4" ry="3" fill="#fef3c7" opacity=".2"/>
          <line x1="24" y1="14" x2="24" y2="32" stroke="#fef3c7" strokeWidth=".4" opacity=".3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "sparkler",
    nameAr: "شعلة احتفال",
    nameEn: "Sparkler",
    price: 120,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .spk{animation:ag-sparkle 0.8s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <radialGradient id="spk-g" cx=".5" cy=".3" r=".5"><stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fbbf24" stopOpacity="0"/></radialGradient>
        </defs>
        <g className="spk">
          <rect x="22" y="20" width="4" height="26" rx="1" fill="#78350f"/>
          <rect x="23" y="20" width="2" height="26" fill="#92400e"/>
          <circle cx="24" cy="16" r="8" fill="url(#spk-g)"/>
          <line x1="24" y1="16" x2="24" y2="4" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="24" y1="16" x2="14" y2="6" stroke="#f97316" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="24" y1="16" x2="34" y2="6" stroke="#f97316" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="24" y1="16" x2="12" y2="12" stroke="#e11d48" strokeWidth="1" strokeLinecap="round"/>
          <line x1="24" y1="16" x2="36" y2="12" stroke="#e11d48" strokeWidth="1" strokeLinecap="round"/>
          <line x1="24" y1="16" x2="16" y2="18" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round"/>
          <line x1="24" y1="16" x2="32" y2="18" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round"/>
          <circle cx="24" cy="16" r="3" fill="#fef9c3"/>
          <circle cx="14" cy="5" r="1" fill="#fbbf24" opacity=".7"/>
          <circle cx="34" cy="5" r="1" fill="#fbbf24" opacity=".7"/>
          <circle cx="24" cy="3" r="1" fill="#fef9c3" opacity=".8"/>
        </g>
      </svg>
    ),
  },
  {
    id: "party-blower",
    nameAr: "نفاخة الحفلة",
    nameEn: "Party Blower",
    price: 60,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .pb{animation:ag-wiggle 1s ease-in-out infinite;transform-origin:left center}`}</style>
        <defs>
          <linearGradient id="pb-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#e11d48"/><stop offset="50%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient>
        </defs>
        <g className="pb">
          <circle cx="10" cy="24" r="4" fill="#e11d48"/>
          <path d="M14 22C14 22 20 8 36 10C40 10 42 14 38 16C34 18 28 14 24 18C20 22 18 28 14 26Z" fill="url(#pb-g)"/>
          <path d="M14 24L28 18" stroke="#fda4af" strokeWidth=".5" opacity=".5"/>
          <path d="M14 24L32 16" stroke="#fde68a" strokeWidth=".5" opacity=".4"/>
          <circle cx="38" cy="12" r="2" fill="#3b82f6" opacity=".6"/>
          <circle cx="34" cy="10" r="1.5" fill="#fbbf24" opacity=".5"/>
          <circle cx="40" cy="14" r="1" fill="#e11d48" opacity=".5"/>
          <rect x="8" y="22" width="4" height="4" rx="1" fill="#9f1239"/>
        </g>
      </svg>
    ),
  },
  {
    id: "countdown-clock",
    nameAr: "ساعة العد التنازلي",
    nameEn: "Countdown Clock",
    price: 750,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .cd{animation:ag-pulse 1s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="cd-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1e1e1e"/><stop offset="100%" stopColor="#374151"/></linearGradient>
        </defs>
        <g className="cd">
          <circle cx="24" cy="26" r="18" fill="url(#cd-g)" stroke="#6b7280" strokeWidth="2"/>
          <circle cx="24" cy="26" r="15" fill="#0f172a"/>
          <rect x="20" y="6" width="8" height="4" rx="2" fill="#6b7280"/>
          <line x1="24" y1="26" x2="24" y2="14" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
          <line x1="24" y1="26" x2="34" y2="26" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="24" cy="26" r="2" fill="#e11d48"/>
          <text x="24" y="32" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#fbbf24">00</text>
          <circle cx="24" cy="12" r="1" fill="#f8fafc" opacity=".6"/>
          <circle cx="24" cy="40" r="1" fill="#f8fafc" opacity=".6"/>
          <circle cx="12" cy="26" r="1" fill="#f8fafc" opacity=".6"/>
          <circle cx="36" cy="26" r="1" fill="#f8fafc" opacity=".6"/>
        </g>
      </svg>
    ),
  },
  {
    id: "celebration-crown",
    nameAr: "تاج الاحتفال",
    nameEn: "Celebration Crown",
    price: 600,
    category: "celebration",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .cc{animation:ag-sparkle 1.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="cc-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
        </defs>
        <g className="cc">
          <path d="M6 34L12 14L18 26L24 8L30 26L36 14L42 34Z" fill="url(#cc-g)"/>
          <rect x="6" y="34" width="36" height="6" rx="1" fill="#d97706"/>
          <circle cx="12" cy="14" r="3" fill="#e11d48"/>
          <circle cx="24" cy="8" r="3.5" fill="#3b82f6"/>
          <circle cx="36" cy="14" r="3" fill="#22c55e"/>
          <circle cx="18" cy="36" r="1.5" fill="#fbbf24" opacity=".7"/>
          <circle cx="24" cy="36" r="1.5" fill="#fbbf24" opacity=".7"/>
          <circle cx="30" cy="36" r="1.5" fill="#fbbf24" opacity=".7"/>
          <path d="M12 14L16 26" stroke="#fef3c7" strokeWidth=".5" opacity=".4"/>
          <path d="M36 14L32 26" stroke="#fef3c7" strokeWidth=".5" opacity=".4"/>
          <path d="M24 8L24 26" stroke="#fef3c7" strokeWidth=".5" opacity=".4"/>
        </g>
      </svg>
    ),
  },
];

/* ══════════════════════════════════════════════════════════
   LUXURY GIFTS  (1000 – 10000 coins)
   ══════════════════════════════════════════════════════════ */

const luxuryGifts: AnimatedGift[] = [
  {
    id: "crown",
    nameAr: "تاج ملكي",
    nameEn: "Crown",
    price: 1000,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .cr{animation:ag-glow 2s ease-in-out infinite;transform-origin:center;color:#f59e0b}`}</style>
        <defs>
          <linearGradient id="cr-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
        </defs>
        <g className="cr">
          <path d="M8 34L12 14L20 24L24 10L28 24L36 14L40 34Z" fill="url(#cr-g)"/>
          <rect x="8" y="34" width="32" height="6" rx="1" fill="#d97706"/>
          <circle cx="12" cy="14" r="2.5" fill="#e11d48"/>
          <circle cx="24" cy="10" r="3" fill="#3b82f6"/>
          <circle cx="36" cy="14" r="2.5" fill="#22c55e"/>
          <circle cx="18" cy="36" r="1.5" fill="#fbbf24" opacity=".6"/>
          <circle cx="24" cy="36" r="1.5" fill="#fbbf24" opacity=".6"/>
          <circle cx="30" cy="36" r="1.5" fill="#fbbf24" opacity=".6"/>
          <path d="M12 14L16 24" stroke="#fef3c7" strokeWidth=".5" opacity=".4"/>
          <path d="M36 14L32 24" stroke="#fef3c7" strokeWidth=".5" opacity=".4"/>
        </g>
      </svg>
    ),
  },
  {
    id: "private-jet",
    nameAr: "طائرة خاصة",
    nameEn: "Private Jet",
    price: 2000,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .pj{animation:ag-float 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="pj-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f1f5f9"/><stop offset="100%" stopColor="#cbd5e1"/></linearGradient>
        </defs>
        <g className="pj">
          <path d="M4 24L14 20L36 20L44 24L36 26L14 26Z" fill="url(#pj-g)"/>
          <path d="M30 20L34 12L40 14L38 20Z" fill="#94a3b8"/>
          <path d="M30 26L34 34L40 32L38 26Z" fill="#94a3b8"/>
          <rect x="14" y="20" width="16" height="6" rx="1" fill="#e2e8f0"/>
          <circle cx="18" cy="23" r="1.5" fill="#60a5fa"/>
          <circle cx="24" cy="23" r="1.5" fill="#60a5fa"/>
          <path d="M4 24L2 22L6 22Z" fill="#94a3b8"/>
          <path d="M4 24L2 26L6 26Z" fill="#94a3b8"/>
          <circle cx="42" cy="23" r="1" fill="#e11d48"/>
        </g>
      </svg>
    ),
  },
  {
    id: "sports-car",
    nameAr: "سيارة رياضية",
    nameEn: "Sports Car",
    price: 3000,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .sc{animation:ag-bounce 1.2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="sc-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#dc2626"/><stop offset="100%" stopColor="#991b1b"/></linearGradient>
        </defs>
        <g className="sc">
          <path d="M4 28L8 22L18 18L34 18L42 22L46 28Z" fill="url(#sc-g)"/>
          <rect x="4" y="28" width="42" height="8" rx="2" fill="#991b1b"/>
          <path d="M18 18L22 12L34 12L38 18Z" fill="#60a5fa" opacity=".6"/>
          <path d="M22 12L24 18" stroke="#94a3b8" strokeWidth=".5"/>
          <circle cx="14" cy="36" r="4" fill="#1e1e1e"/>
          <circle cx="14" cy="36" r="2" fill="#6b7280"/>
          <circle cx="36" cy="36" r="4" fill="#1e1e1e"/>
          <circle cx="36" cy="36" r="2" fill="#6b7280"/>
          <rect x="6" y="30" width="6" height="2" rx="1" fill="#fbbf24"/>
          <rect x="38" y="30" width="6" height="2" rx="1" fill="#e11d48"/>
        </g>
      </svg>
    ),
  },
  {
    id: "yacht",
    nameAr: "يخت فاخر",
    nameEn: "Yacht",
    price: 4000,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .yt{animation:ag-float 2.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="yt-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#cbd5e1"/></linearGradient>
          <linearGradient id="yt-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity=".3"/><stop offset="100%" stopColor="#1d4ed8" stopOpacity=".6"/></linearGradient>
        </defs>
        <g className="yt">
          <path d="M4 36C4 36 10 32 24 32C38 32 44 36 44 36Z" fill="url(#yt-water)"/>
          <path d="M8 32L12 28L40 28L44 32Z" fill="url(#yt-g)"/>
          <rect x="14" y="20" width="20" height="8" rx="1" fill="#e2e8f0"/>
          <rect x="20" y="10" width="2" height="10" fill="#94a3b8"/>
          <path d="M22 10L36 18L22 18Z" fill="#f8fafc" opacity=".9"/>
          <circle cx="18" cy="24" r="1.5" fill="#60a5fa"/>
          <circle cx="24" cy="24" r="1.5" fill="#60a5fa"/>
          <circle cx="30" cy="24" r="1.5" fill="#60a5fa"/>
          <path d="M4 38C8 36 16 36 24 38C32 36 40 36 44 38" stroke="#3b82f6" strokeWidth="1" fill="none" opacity=".3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "mansion",
    nameAr: "قصر فاخر",
    nameEn: "Mansion",
    price: 5000,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .mn{animation:ag-pulse 3s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="mn-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f1f5f9"/><stop offset="100%" stopColor="#94a3b8"/></linearGradient>
        </defs>
        <g className="mn">
          <rect x="6" y="20" width="36" height="20" fill="url(#mn-g)"/>
          <path d="M4 20L24 8L44 20Z" fill="#cbd5e1"/>
          <rect x="18" y="30" width="12" height="10" rx="1" fill="#78350f"/>
          <rect x="10" y="24" width="5" height="5" fill="#60a5fa" opacity=".7"/>
          <rect x="33" y="24" width="5" height="5" fill="#60a5fa" opacity=".7"/>
          <rect x="10" y="32" width="5" height="4" fill="#60a5fa" opacity=".5"/>
          <rect x="33" y="32" width="5" height="4" fill="#60a5fa" opacity=".5"/>
          <rect x="22" y="34" width="4" height="6" fill="#92400e"/>
          <circle cx="22" cy="14" r="2" fill="#fbbf24"/>
          <rect x="6" y="40" width="36" height="2" fill="#64748b"/>
        </g>
      </svg>
    ),
  },
  {
    id: "gold-bar",
    nameAr: "سبيك ذهب",
    nameEn: "Gold Bar",
    price: 6000,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .gb2{animation:ag-sparkle 1.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="gb2-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#b45309"/></linearGradient>
        </defs>
        <g className="gb2">
          <path d="M8 32L14 20H34L40 32Z" fill="url(#gb2-g)"/>
          <path d="M14 20L18 12H30L34 20Z" fill="#fbbf24"/>
          <path d="M8 32H40V36H8Z" fill="#92400e"/>
          <path d="M14 20L34 20" stroke="#fef3c7" strokeWidth=".8" opacity=".5"/>
          <path d="M20 24L28 24" stroke="#fef3c7" strokeWidth=".5" opacity=".3"/>
          <text x="24" y="30" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#92400e">Au</text>
        </g>
      </svg>
    ),
  },
  {
    id: "diamond-necklace",
    nameAr: "عقد ألماس",
    nameEn: "Diamond Necklace",
    price: 7000,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .dn{animation:ag-sparkle 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="dn-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
          <linearGradient id="dn-dia" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#e0f2fe"/><stop offset="100%" stopColor="#7dd3fc"/></linearGradient>
        </defs>
        <g className="dn">
          <path d="M10 10C10 10 14 30 24 34C34 30 38 10 38 10" stroke="url(#dn-g)" strokeWidth="2.5" fill="none"/>
          <circle cx="14" cy="18" r="2" fill="#7dd3fc"/>
          <circle cx="20" cy="26" r="2.5" fill="#7dd3fc"/>
          <circle cx="28" cy="26" r="2.5" fill="#7dd3fc"/>
          <circle cx="34" cy="18" r="2" fill="#7dd3fc"/>
          <path d="M22 32L24 28L26 32L24 36Z" fill="url(#dn-dia)" stroke="#93c5fd" strokeWidth=".5"/>
          <circle cx="24" cy="8" r="2" fill="#fbbf24"/>
        </g>
      </svg>
    ),
  },
  {
    id: "rolex-watch",
    nameAr: "ساعة رولكس",
    nameEn: "Rolex Watch",
    price: 8000,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .rw{animation:ag-spin 6s linear infinite;transform-origin:24px 26px}`}</style>
        <defs>
          <linearGradient id="rw-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
        </defs>
        <g>
          <rect x="20" y="4" width="8" height="10" rx="2" fill="#b45309"/>
          <rect x="20" y="38" width="8" height="6" rx="2" fill="#b45309"/>
          <circle cx="24" cy="26" r="14" fill="url(#rw-g)" stroke="#92400e" strokeWidth="2"/>
          <circle cx="24" cy="26" r="11" fill="#1e293b"/>
          <circle cx="24" cy="26" r="10" fill="#0f172a"/>
          <line x1="24" y1="26" x2="24" y2="18" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="24" y1="26" x2="30" y2="26" stroke="#f8fafc" strokeWidth="1" strokeLinecap="round"/>
          <g className="rw">
            <line x1="24" y1="26" x2="24" y2="20" stroke="#e11d48" strokeWidth=".8" strokeLinecap="round"/>
          </g>
          <circle cx="24" cy="26" r="1.5" fill="#fbbf24"/>
          <line x1="24" y1="16" x2="24" y2="18" stroke="#f8fafc" strokeWidth=".5"/>
          <line x1="24" y1="34" x2="24" y2="36" stroke="#f8fafc" strokeWidth=".5"/>
          <line x1="14" y1="26" x2="16" y2="26" stroke="#f8fafc" strokeWidth=".5"/>
          <line x1="32" y1="26" x2="34" y2="26" stroke="#f8fafc" strokeWidth=".5"/>
        </g>
      </svg>
    ),
  },
  {
    id: "caviar",
    nameAr: "كافيار",
    nameEn: "Caviar",
    price: 9000,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .cv{animation:ag-glow 2.5s ease-in-out infinite;transform-origin:center;color:#1e1e1e}`}</style>
        <defs>
          <linearGradient id="cv-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#e2e8f0"/></linearGradient>
        </defs>
        <g className="cv">
          <ellipse cx="24" cy="32" rx="14" ry="8" fill="url(#cv-g)"/>
          <ellipse cx="24" cy="30" rx="14" ry="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1"/>
          <ellipse cx="24" cy="28" rx="12" ry="6" fill="#1e1e1e"/>
          <circle cx="18" cy="26" r="2" fill="#374151"/>
          <circle cx="22" cy="25" r="2" fill="#374151"/>
          <circle cx="26" cy="26" r="2" fill="#374151"/>
          <circle cx="30" cy="25" r="2" fill="#374151"/>
          <circle cx="20" cy="28" r="2" fill="#374151"/>
          <circle cx="24" cy="28" r="2" fill="#374151"/>
          <circle cx="28" cy="28" r="2" fill="#374151"/>
          <circle cx="22" cy="30" r="1.5" fill="#4b5563"/>
          <circle cx="26" cy="30" r="1.5" fill="#4b5563"/>
          <path d="M20 22L18 20" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
          <ellipse cx="14" cy="18" rx="3" ry="1.5" fill="#fbbf24" opacity=".7"/>
        </g>
      </svg>
    ),
  },
  {
    id: "helicopter",
    nameAr: "هليكوبتر",
    nameEn: "Helicopter",
    price: 10000,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .hl{animation:ag-float 1.8s ease-in-out infinite;transform-origin:center}.hl-rotor{animation:ag-spin 0.3s linear infinite;transform-origin:24px 8px}`}</style>
        <defs>
          <linearGradient id="hl-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#f1f5f9"/><stop offset="100%" stopColor="#94a3b8"/></linearGradient>
        </defs>
        <g className="hl">
          <g className="hl-rotor">
            <rect x="4" y="7" width="40" height="2" rx="1" fill="#64748b"/>
          </g>
          <rect x="22" y="8" width="4" height="4" fill="#94a3b8"/>
          <ellipse cx="22" cy="22" rx="12" ry="7" fill="url(#hl-g)"/>
          <path d="M34 22L42 18V26Z" fill="#cbd5e1"/>
          <rect x="14" y="28" width="3" height="10" fill="#94a3b8"/>
          <rect x="28" y="28" width="3" height="10" fill="#94a3b8"/>
          <rect x="10" y="38" width="12" height="2" rx="1" fill="#64748b"/>
          <rect x="24" y="38" width="12" height="2" rx="1" fill="#64748b"/>
          <circle cx="18" cy="20" r="3" fill="#60a5fa" opacity=".6"/>
          <circle cx="26" cy="20" r="2" fill="#60a5fa" opacity=".4"/>
        </g>
      </svg>
    ),
  },
  {
    id: "royal-scepter",
    nameAr: "صولجان ملكي",
    nameEn: "Royal Scepter",
    price: 1500,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .rs2{animation:ag-glow 2s ease-in-out infinite;transform-origin:center;color:#f59e0b`}</style>
        <defs>
          <linearGradient id="rs2-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#92400e"/></linearGradient>
          <radialGradient id="rs2-orb" cx=".4" cy=".3" r=".5"><stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#1d4ed8"/></radialGradient>
        </defs>
        <g className="rs2">
          <rect x="22" y="16" width="4" height="28" rx="1" fill="url(#rs2-g)"/>
          <rect x="21" y="18" width="6" height="2" fill="#d97706"/>
          <rect x="21" y="24" width="6" height="2" fill="#d97706"/>
          <rect x="21" y="30" width="6" height="2" fill="#d97706"/>
          <path d="M16 16L24 4L32 16L28 14L24 18L20 14Z" fill="#fde68a" stroke="#d97706" strokeWidth=".8"/>
          <circle cx="24" cy="8" r="4" fill="url(#rs2-orb)"/>
          <circle cx="23" cy="7" r="1.5" fill="#93c5fd" opacity=".6"/>
          <path d="M18 16L20 12" stroke="#fbbf24" strokeWidth=".8" opacity=".5"/>
          <path d="M30 16L28 12" stroke="#fbbf24" strokeWidth=".8" opacity=".5"/>
        </g>
      </svg>
    ),
  },
  {
    id: "crown-jewel",
    nameAr: "جوهرة التاج",
    nameEn: "Crown Jewel",
    price: 5000,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .cj{animation:ag-sparkle 1.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="cj-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
          <linearGradient id="cj-dia" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c084fc"/><stop offset="50%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#a78bfa"/></linearGradient>
        </defs>
        <g className="cj">
          <path d="M6 34L12 14L18 26L24 8L30 26L36 14L42 34Z" fill="url(#cj-g)"/>
          <rect x="6" y="34" width="36" height="6" rx="1" fill="#d97706"/>
          <path d="M18 20L24 10L30 20L24 26Z" fill="url(#cj-dia)" stroke="#a78bfa" strokeWidth="1"/>
          <line x1="24" y1="10" x2="24" y2="26" stroke="#c4b5fd" strokeWidth=".6" opacity=".5"/>
          <line x1="18" y1="20" x2="30" y2="20" stroke="#c4b5fd" strokeWidth=".6" opacity=".5"/>
          <circle cx="22" cy="14" r="1" fill="#fff" opacity=".7"/>
          <circle cx="12" cy="14" r="2" fill="#e11d48"/>
          <circle cx="36" cy="14" r="2" fill="#22c55e"/>
          <circle cx="24" cy="8" r="2.5" fill="#3b82f6"/>
          <circle cx="18" cy="36" r="1.5" fill="#fbbf24" opacity=".6"/>
          <circle cx="30" cy="36" r="1.5" fill="#fbbf24" opacity=".6"/>
        </g>
      </svg>
    ),
  },
  {
    id: "pearl-necklace",
    nameAr: "عقد لؤلؤ",
    nameEn: "Pearl Necklace",
    price: 2500,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .pn{animation:ag-glow 2.5s ease-in-out infinite;transform-origin:center;color:#f8fafc`}</style>
        <defs>
          <radialGradient id="pn-pearl" cx=".35" cy=".3" r=".5"><stop offset="0%" stopColor="#fff"/><stop offset="100%" stopColor="#d1d5db"/></radialGradient>
        </defs>
        <g className="pn">
          <path d="M10 10C10 10 12 32 24 36C36 32 38 10 38 10" stroke="#d1d5db" strokeWidth="1.5" fill="none"/>
          <circle cx="12" cy="14" r="3" fill="url(#pn-pearl)"/>
          <circle cx="10" cy="20" r="3" fill="url(#pn-pearl)"/>
          <circle cx="10" cy="26" r="3" fill="url(#pn-pearl)"/>
          <circle cx="12" cy="32" r="3" fill="url(#pn-pearl)"/>
          <circle cx="36" cy="14" r="3" fill="url(#pn-pearl)"/>
          <circle cx="38" cy="20" r="3" fill="url(#pn-pearl)"/>
          <circle cx="38" cy="26" r="3" fill="url(#pn-pearl)"/>
          <circle cx="36" cy="32" r="3" fill="url(#pn-pearl)"/>
          <circle cx="18" cy="34" r="3" fill="url(#pn-pearl)"/>
          <circle cx="30" cy="34" r="3" fill="url(#pn-pearl)"/>
          <circle cx="24" cy="36" r="4" fill="#fde68a" stroke="#d97706" strokeWidth="1"/>
          <circle cx="23" cy="35" r="1" fill="#fef3c7" opacity=".6"/>
        </g>
      </svg>
    ),
  },
  {
    id: "platinum-card",
    nameAr: "بطاقة بلاتينية",
    nameEn: "Platinum Card",
    price: 4000,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .pc2{animation:ag-sparkle 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="pc2-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#e2e8f0"/><stop offset="50%" stopColor="#94a3b8"/><stop offset="100%" stopColor="#cbd5e1"/></linearGradient>
        </defs>
        <g className="pc2">
          <rect x="4" y="10" width="40" height="28" rx="4" fill="url(#pc2-g)"/>
          <rect x="4" y="10" width="40" height="8" rx="4" fill="#64748b"/>
          <rect x="4" y="14" width="40" height="4" fill="#475569"/>
          <rect x="8" y="28" width="14" height="3" rx="1" fill="#94a3b8" opacity=".6"/>
          <rect x="8" y="33" width="10" height="2" rx="1" fill="#94a3b8" opacity=".4"/>
          <circle cx="36" cy="30" r="4" fill="#fde68a" opacity=".4"/>
          <circle cx="36" cy="30" r="2.5" fill="#fbbf24" opacity=".3"/>
          <path d="M36 28L38 30L36 32L34 30Z" fill="#fef3c7" opacity=".5"/>
          <text x="24" y="22" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#475569" opacity=".6">PLATINUM</text>
        </g>
      </svg>
    ),
  },
  {
    id: "luxury-car",
    nameAr: "سيارة فاخرة",
    nameEn: "Luxury Car",
    price: 8000,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .lc2{animation:ag-float 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="lc2-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#f1f5f9"/><stop offset="100%" stopColor="#94a3b8"/></linearGradient>
        </defs>
        <g className="lc2">
          <path d="M4 28L8 22L16 18L34 18L42 22L46 28Z" fill="url(#lc2-g)"/>
          <rect x="4" y="28" width="42" height="8" rx="2" fill="#cbd5e1"/>
          <path d="M16 18L20 12L34 12L38 18Z" fill="#60a5fa" opacity=".5"/>
          <line x1="26" y1="12" x2="26" y2="18" stroke="#94a3b8" strokeWidth=".5"/>
          <circle cx="14" cy="36" r="4" fill="#1e1e1e"/>
          <circle cx="14" cy="36" r="2.5" fill="#6b7280"/>
          <circle cx="14" cy="36" r="1" fill="#9ca3af"/>
          <circle cx="36" cy="36" r="4" fill="#1e1e1e"/>
          <circle cx="36" cy="36" r="2.5" fill="#6b7280"/>
          <circle cx="36" cy="36" r="1" fill="#9ca3af"/>
          <rect x="6" y="30" width="6" height="2" rx="1" fill="#fde68a"/>
          <rect x="38" y="30" width="6" height="2" rx="1" fill="#fca5a5"/>
          <path d="M8 22L12 20" stroke="#fbbf24" strokeWidth=".8" opacity=".5"/>
          <path d="M40 22L36 20" stroke="#fbbf24" strokeWidth=".8" opacity=".5"/>
        </g>
      </svg>
    ),
  },
  {
    id: "golden-key",
    nameAr: "مفتاح ذهبي",
    nameEn: "Golden Key",
    price: 1000,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .gk{animation:ag-shake 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="gk-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#b45309"/></linearGradient>
        </defs>
        <g className="gk">
          <circle cx="16" cy="16" r="10" fill="url(#gk-g)" stroke="#92400e" strokeWidth="1"/>
          <circle cx="16" cy="16" r="6" fill="#fbbf24"/>
          <circle cx="16" cy="16" r="3" fill="#d97706"/>
          <rect x="24" y="14" width="20" height="4" rx="1" fill="url(#gk-g)"/>
          <rect x="38" y="18" width="3" height="5" rx=".5" fill="#d97706"/>
          <rect x="34" y="18" width="3" height="4" rx=".5" fill="#d97706"/>
          <rect x="30" y="18" width="3" height="3" rx=".5" fill="#d97706"/>
          <circle cx="14" cy="14" r="1" fill="#fef3c7" opacity=".6"/>
        </g>
      </svg>
    ),
  },
  {
    id: "ruby-gem",
    nameAr: "ياقوت أحمر",
    nameEn: "Ruby Gem",
    price: 3500,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .rg{animation:ag-sparkle 1.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="rg-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fca5a5"/><stop offset="50%" stopColor="#dc2626"/><stop offset="100%" stopColor="#991b1b"/></linearGradient>
        </defs>
        <g className="rg">
          <path d="M14 10L24 4L34 10L38 22L24 42L10 22Z" fill="url(#rg-g)" stroke="#991b1b" strokeWidth=".8"/>
          <line x1="24" y1="4" x2="24" y2="42" stroke="#fca5a5" strokeWidth=".5" opacity=".4"/>
          <line x1="10" y1="22" x2="38" y2="22" stroke="#fca5a5" strokeWidth=".5" opacity=".4"/>
          <line x1="14" y1="10" x2="38" y2="22" stroke="#fca5a5" strokeWidth=".3" opacity=".3"/>
          <line x1="34" y1="10" x2="10" y2="22" stroke="#fca5a5" strokeWidth=".3" opacity=".3"/>
          <path d="M14 10L24 22L34 10" stroke="#fecaca" strokeWidth=".4" opacity=".3" fill="none"/>
          <circle cx="18" cy="14" r="1.5" fill="#fff" opacity=".6"/>
          <circle cx="28" cy="12" r="1" fill="#fff" opacity=".4"/>
        </g>
      </svg>
    ),
  },
  {
    id: "emperor-throne",
    nameAr: "عرش الإمبراطور",
    nameEn: "Emperor Throne",
    price: 10000,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .et{animation:ag-glow 2.5s ease-in-out infinite;transform-origin:center;color:#f59e0b`}</style>
        <defs>
          <linearGradient id="et-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#92400e"/></linearGradient>
        </defs>
        <g className="et">
          <rect x="10" y="4" width="4" height="38" rx="1" fill="url(#et-g)"/>
          <rect x="34" y="4" width="4" height="38" rx="1" fill="url(#et-g)"/>
          <path d="M10 4L14 2L34 2L38 4Z" fill="#fde68a"/>
          <rect x="14" y="14" width="20" height="4" rx="1" fill="url(#et-g)"/>
          <rect x="14" y="26" width="20" height="4" rx="1" fill="url(#et-g)"/>
          <rect x="10" y="32" width="28" height="4" rx="1" fill="#d97706"/>
          <rect x="8" y="36" width="32" height="4" rx="1" fill="#b45309"/>
          <rect x="6" y="40" width="36" height="4" rx="1" fill="#92400e"/>
          <circle cx="12" cy="8" r="2" fill="#e11d48"/>
          <circle cx="36" cy="8" r="2" fill="#e11d48"/>
          <path d="M14 20L34 20" stroke="#fbbf24" strokeWidth=".5" opacity=".5"/>
          <circle cx="24" cy="18" r="2" fill="#3b82f6"/>
          <circle cx="20" cy="16" r="1" fill="#22c55e"/>
          <circle cx="28" cy="16" r="1" fill="#7c3aed"/>
        </g>
      </svg>
    ),
  },
  {
    id: "crystal-ball",
    nameAr: "كرة بلورية",
    nameEn: "Crystal Ball",
    price: 6000,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .clb{animation:ag-glow 2s ease-in-out infinite;transform-origin:center;color:#a855f7}`}</style>
        <defs>
          <radialGradient id="clb-g" cx=".45" cy=".4" r=".5"><stop offset="0%" stopColor="#e9d5ff"/><stop offset="50%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#7c3aed"/></radialGradient>
          <radialGradient id="clb-shine" cx=".3" cy=".25" r=".3"><stop offset="0%" stopColor="#fff" stopOpacity=".6"/><stop offset="100%" stopColor="#fff" stopOpacity="0"/></radialGradient>
        </defs>
        <g className="clb">
          <ellipse cx="24" cy="40" rx="12" ry="3" fill="#6b21a8" opacity=".4"/>
          <path d="M14 40H34L32 44H16Z" fill="#92400e"/>
          <rect x="16" y="44" width="16" height="2" rx="1" fill="#78350f"/>
          <circle cx="24" cy="24" r="16" fill="url(#clb-g)"/>
          <circle cx="24" cy="24" r="16" fill="url(#clb-shine)"/>
          <circle cx="18" cy="18" r="3" fill="#fff" opacity=".15"/>
          <path d="M20 28C22 26 26 26 28 28" stroke="#c4b5fd" strokeWidth=".8" fill="none" opacity=".5"/>
          <circle cx="22" cy="22" r="1" fill="#fde68a" opacity=".4"/>
          <circle cx="26" cy="26" r=".8" fill="#fde68a" opacity=".3"/>
          <path d="M16 22L18 20L20 24Z" fill="#c4b5fd" opacity=".2"/>
        </g>
      </svg>
    ),
  },
  {
    id: "silver-chalice",
    nameAr: "كأس فضية",
    nameEn: "Silver Chalice",
    price: 4500,
    category: "luxury",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .sch{animation:ag-sparkle 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="sch-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e2e8f0"/><stop offset="100%" stopColor="#94a3b8"/></linearGradient>
        </defs>
        <g className="sch">
          <path d="M14 8H34C34 8 36 22 24 26C12 22 14 8 14 8Z" fill="url(#sch-g)"/>
          <path d="M14 8H34C34 8 32 20 24 24C16 20 14 8 14 8Z" fill="#f1f5f9" opacity=".4"/>
          <rect x="22" y="26" width="4" height="10" fill="#94a3b8"/>
          <ellipse cx="24" cy="36" rx="10" ry="4" fill="url(#sch-g)"/>
          <ellipse cx="24" cy="36" rx="8" ry="3" fill="#cbd5e1"/>
          <ellipse cx="24" cy="8" rx="10" ry="2" fill="#cbd5e1" opacity=".3"/>
          <circle cx="24" cy="16" r="3" fill="#e11d48" opacity=".3"/>
          <circle cx="24" cy="16" r="1.5" fill="#dc2626" opacity=".4"/>
          <circle cx="20" cy="12" r=".8" fill="#fff" opacity=".6"/>
        </g>
      </svg>
    ),
  },
];

/* ══════════════════════════════════════════════════════════
   NATURE GIFTS  (50 – 1000 coins)
   ══════════════════════════════════════════════════════════ */

const natureGifts: AnimatedGift[] = [
  {
    id: "butterfly",
    nameAr: "فراشة",
    nameEn: "Butterfly",
    price: 50,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .bf{animation:ag-float 1.8s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <radialGradient id="bf-g1" cx=".4" cy=".4" r=".6"><stop offset="0%" stopColor="#c084fc"/><stop offset="100%" stopColor="#7c3aed"/></radialGradient>
          <radialGradient id="bf-g2" cx=".4" cy=".4" r=".6"><stop offset="0%" stopColor="#f0abfc"/><stop offset="100%" stopColor="#c026d3"/></radialGradient>
        </defs>
        <g className="bf">
          <path d="M24 18C24 18 12 8 10 16C8 24 20 26 24 22Z" fill="url(#bf-g1)"/>
          <path d="M24 18C24 18 36 8 38 16C40 24 28 26 24 22Z" fill="url(#bf-g1)"/>
          <path d="M24 22C24 22 14 28 14 34C14 38 22 36 24 30Z" fill="url(#bf-g2)"/>
          <path d="M24 22C24 22 34 28 34 34C34 38 26 36 24 30Z" fill="url(#bf-g2)"/>
          <rect x="23" y="14" width="2" height="20" rx="1" fill="#1e1e1e"/>
          <circle cx="14" cy="14" r="2" fill="#1e1e1e"/>
          <circle cx="34" cy="14" r="2" fill="#1e1e1e"/>
          <line x1="23" y1="14" x2="16" y2="8" stroke="#1e1e1e" strokeWidth=".8"/>
          <line x1="25" y1="14" x2="32" y2="8" stroke="#1e1e1e" strokeWidth=".8"/>
          <circle cx="18" cy="18" r="1.5" fill="#fef3c7" opacity=".6"/>
          <circle cx="30" cy="18" r="1.5" fill="#fef3c7" opacity=".6"/>
        </g>
      </svg>
    ),
  },
  {
    id: "rainbow",
    nameAr: "قوس قزح",
    nameEn: "Rainbow",
    price: 100,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .rb{animation:ag-glow 3s ease-in-out infinite;transform-origin:center;color:#fbbf24}`}</style>
        <defs>
          <linearGradient id="rb-cloud" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff"/><stop offset="100%" stopColor="#e2e8f0"/></linearGradient>
        </defs>
        <g className="rb">
          <path d="M8 36A20 20 0 0 1 40 36" stroke="#e11d48" strokeWidth="3" fill="none"/>
          <path d="M11 36A17 17 0 0 1 37 36" stroke="#f97316" strokeWidth="3" fill="none"/>
          <path d="M14 36A14 14 0 0 1 34 36" stroke="#fbbf24" strokeWidth="3" fill="none"/>
          <path d="M17 36A11 11 0 0 1 31 36" stroke="#22c55e" strokeWidth="3" fill="none"/>
          <path d="M20 36A8 8 0 0 1 28 36" stroke="#3b82f6" strokeWidth="3" fill="none"/>
          <path d="M23 36A5 5 0 0 1 25 36" stroke="#8b5cf6" strokeWidth="3" fill="none"/>
          <ellipse cx="12" cy="38" rx="6" ry="4" fill="url(#rb-cloud)"/>
          <ellipse cx="36" cy="38" rx="6" ry="4" fill="url(#rb-cloud)"/>
        </g>
      </svg>
    ),
  },
  {
    id: "sunflower",
    nameAr: "دوار الشمس",
    nameEn: "Sunflower",
    price: 150,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .sf{animation:ag-pulse 2.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <radialGradient id="sf-center" cx=".5" cy=".5" r=".5"><stop offset="0%" stopColor="#92400e"/><stop offset="100%" stopColor="#451a03"/></radialGradient>
        </defs>
        <g className="sf">
          <line x1="24" y1="26" x2="24" y2="46" stroke="#16a34a" strokeWidth="3" strokeLinecap="round"/>
          <path d="M24 36C24 36 18 34 16 30C18 32 22 34 24 36Z" fill="#22c55e"/>
          <path d="M24 40C24 40 30 38 32 34C30 36 26 38 24 40Z" fill="#16a34a"/>
          {[0,45,90,135,180,225,270,315].map((angle, i) => (
            <ellipse key={i} cx="24" cy="10" rx="4" ry="8" fill="#fbbf24" transform={`rotate(${angle} 24 20)`}/>
          ))}
          {[22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5].map((angle, i) => (
            <ellipse key={`o${i}`} cx="24" cy="12" rx="3" ry="6" fill="#f59e0b" transform={`rotate(${angle} 24 20)`}/>
          ))}
          <circle cx="24" cy="20" r="6" fill="url(#sf-center)"/>
          <circle cx="22" cy="18" r="1" fill="#78350f" opacity=".6"/>
          <circle cx="26" cy="20" r="1" fill="#78350f" opacity=".6"/>
          <circle cx="24" cy="22" r="1" fill="#78350f" opacity=".6"/>
        </g>
      </svg>
    ),
  },
  {
    id: "firefly",
    nameAr: "يراعة",
    nameEn: "Firefly",
    price: 200,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .ff{animation:ag-sparkle 1.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <radialGradient id="ff-glow" cx=".5" cy=".5" r=".5"><stop offset="0%" stopColor="#fef08a" stopOpacity=".9"/><stop offset="100%" stopColor="#fef08a" stopOpacity="0"/></radialGradient>
        </defs>
        <g className="ff">
          <circle cx="24" cy="24" r="14" fill="url(#ff-glow)"/>
          <circle cx="24" cy="24" r="8" fill="url(#ff-glow)" opacity=".6"/>
          <ellipse cx="24" cy="24" rx="5" ry="7" fill="#1e293b"/>
          <ellipse cx="24" cy="20" rx="4" ry="3" fill="#334155"/>
          <circle cx="24" cy="28" r="3" fill="#fef08a" opacity=".9"/>
          <circle cx="24" cy="28" r="2" fill="#fef9c3"/>
          <circle cx="22" cy="19" r="1" fill="#fff" opacity=".8"/>
          <circle cx="26" cy="19" r="1" fill="#fff" opacity=".8"/>
          <path d="M20 24L16 22" stroke="#334155" strokeWidth=".8"/>
          <path d="M28 24L32 22" stroke="#334155" strokeWidth=".8"/>
        </g>
      </svg>
    ),
  },
  {
    id: "snowflake",
    nameAr: "ندفة ثلج",
    nameEn: "Snowflake",
    price: 300,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .sn{animation:ag-spin 4s linear infinite;transform-origin:24px 24px}`}</style>
        <g className="sn">
          {[0,60,120,180,240,300].map((angle, i) => (
            <g key={i} transform={`rotate(${angle} 24 24)`}>
              <line x1="24" y1="24" x2="24" y2="4" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round"/>
              <line x1="24" y1="10" x2="20" y2="6" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="24" y1="10" x2="28" y2="6" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="24" y1="16" x2="20" y2="13" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round"/>
              <line x1="24" y1="16" x2="28" y2="13" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round"/>
            </g>
          ))}
          <circle cx="24" cy="24" r="2" fill="#bfdbfe"/>
        </g>
      </svg>
    ),
  },
  {
    id: "ocean-wave",
    nameAr: "موجة المحيط",
    nameEn: "Ocean Wave",
    price: 400,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .ow{animation:ag-float 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="ow-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#0369a1"/></linearGradient>
        </defs>
        <g className="ow">
          <path d="M0 28C8 22 16 34 24 28C32 22 40 34 48 28V48H0Z" fill="url(#ow-g)" opacity=".6"/>
          <path d="M0 32C8 26 16 38 24 32C32 26 40 38 48 32V48H0Z" fill="url(#ow-g)" opacity=".8"/>
          <path d="M0 36C8 30 16 42 24 36C32 30 40 42 48 36V48H0Z" fill="#0284c7"/>
          <path d="M12 18C12 14 18 12 18 16C18 12 24 14 24 18C24 24 12 24 12 18Z" fill="#fff" opacity=".3"/>
          <circle cx="36" cy="16" r="3" fill="#fff" opacity=".2"/>
          <circle cx="8" cy="20" r="2" fill="#fff" opacity=".2"/>
        </g>
      </svg>
    ),
  },
  {
    id: "mountain-peak",
    nameAr: "قمة جبل",
    nameEn: "Mountain Peak",
    price: 500,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .mp{animation:ag-pulse 3s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="mp-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#94a3b8"/><stop offset="100%" stopColor="#475569"/></linearGradient>
        </defs>
        <g className="mp">
          <path d="M0 44L18 12L28 28L34 18L48 44Z" fill="url(#mp-g)"/>
          <path d="M18 12L22 20L14 20Z" fill="#f1f5f9"/>
          <path d="M34 18L36 22L32 22Z" fill="#f1f5f9"/>
          <circle cx="38" cy="10" r="4" fill="#fbbf24"/>
          <circle cx="38" cy="10" r="3" fill="#fde68a"/>
          <path d="M0 44C8 42 16 44 24 42C32 44 40 42 48 44" stroke="#22c55e" strokeWidth="1.5" fill="none" opacity=".5"/>
          <path d="M0 46L48 46" stroke="#16a34a" strokeWidth="2"/>
        </g>
      </svg>
    ),
  },
  {
    id: "shooting-star",
    nameAr: "شهاب",
    nameEn: "Shooting Star",
    price: 700,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .ss{animation:ag-bounce 1.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="ss-tail" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fbbf24" stopOpacity="0"/><stop offset="100%" stopColor="#fbbf24"/></linearGradient>
        </defs>
        <g className="ss">
          <path d="M40 8L14 34" stroke="url(#ss-tail)" strokeWidth="3" strokeLinecap="round"/>
          <path d="M38 10L16 32" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" opacity=".4"/>
          <path d="M38 8L42 4L40 10L46 8L40 12L42 18L38 12L34 18L36 12L30 10L36 10L34 4Z" fill="#fbbf24"/>
          <circle cx="38" cy="10" r="2" fill="#fef3c7"/>
          <circle cx="10" cy="14" r="1" fill="#fff" opacity=".5"/>
          <circle cx="6" cy="28" r=".8" fill="#fff" opacity=".4"/>
          <circle cx="44" cy="32" r="1" fill="#fff" opacity=".5"/>
          <circle cx="30" cy="40" r=".8" fill="#fff" opacity=".3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "cherry-blossom",
    nameAr: "زهر الكرز",
    nameEn: "Cherry Blossom",
    price: 800,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .cb2{animation:ag-float 2.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <radialGradient id="cb2-p" cx=".3" cy=".3" r=".6"><stop offset="0%" stopColor="#fda4af"/><stop offset="100%" stopColor="#e11d48"/></radialGradient>
        </defs>
        <g className="cb2">
          <line x1="24" y1="48" x2="24" y2="22" stroke="#78350f" strokeWidth="2"/>
          <line x1="24" y1="32" x2="16" y2="26" stroke="#78350f" strokeWidth="1.5"/>
          <line x1="24" y1="28" x2="34" y2="22" stroke="#78350f" strokeWidth="1.5"/>
          {[0,72,144,216,288].map((angle, i) => (
            <ellipse key={i} cx="24" cy="12" rx="3.5" ry="7" fill="url(#cb2-p)" transform={`rotate(${angle} 24 20)`}/>
          ))}
          <circle cx="24" cy="20" r="3" fill="#fbbf24"/>
          <circle cx="23" cy="19" r=".8" fill="#f59e0b"/>
          <circle cx="25" cy="21" r=".8" fill="#f59e0b"/>
          <circle cx="14" cy="24" r="3.5" fill="#fda4af" opacity=".5" transform="rotate(-20 14 24)"/>
          <circle cx="36" cy="20" r="3" fill="#fda4af" opacity=".4" transform="rotate(15 36 20)"/>
          <circle cx="20" cy="10" r="2.5" fill="#fda4af" opacity=".3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "dolphin",
    nameAr: "دلفين",
    nameEn: "Dolphin",
    price: 1000,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .dp{animation:ag-bounce 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="dp-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#1d4ed8"/></linearGradient>
          <linearGradient id="dp-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity=".3"/><stop offset="100%" stopColor="#1d4ed8" stopOpacity=".5"/></linearGradient>
        </defs>
        <g className="dp">
          <path d="M4 36C10 34 20 36 24 36C28 36 38 34 44 36C38 38 28 36 24 36C20 36 10 38 4 36Z" fill="url(#dp-water)"/>
          <path d="M12 30C12 22 20 16 30 18C36 19 40 24 38 30C36 34 28 34 24 32C20 34 12 34 12 30Z" fill="url(#dp-g)"/>
          <path d="M30 18C32 14 38 14 40 18C38 16 34 16 32 18Z" fill="#3b82f6"/>
          <path d="M12 30C14 28 18 30 16 34Z" fill="#3b82f6"/>
          <circle cx="32" cy="22" r="1.5" fill="#fff"/>
          <circle cx="32.5" cy="22" r=".8" fill="#1e1e1e"/>
          <path d="M36 26C38 26 40 25 42 26" stroke="#93c5fd" strokeWidth=".8" fill="none"/>
          <path d="M12 30L10 28L14 28" fill="#bfdbfe" opacity=".3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "falling-leaf",
    nameAr: "ورقة ساقطة",
    nameEn: "Falling Leaf",
    price: 50,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .fl{animation:ag-float 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="fl-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#ea580c"/></linearGradient>
        </defs>
        <g className="fl">
          <path d="M24 6C24 6 38 14 38 28C38 38 24 44 24 44C24 44 10 38 10 28C10 14 24 6 24 6Z" fill="url(#fl-g)"/>
          <line x1="24" y1="10" x2="24" y2="40" stroke="#92400e" strokeWidth="1.5"/>
          <line x1="24" y1="18" x2="16" y2="14" stroke="#92400e" strokeWidth=".8"/>
          <line x1="24" y1="24" x2="32" y2="20" stroke="#92400e" strokeWidth=".8"/>
          <line x1="24" y1="30" x2="16" y2="26" stroke="#92400e" strokeWidth=".8"/>
          <line x1="24" y1="36" x2="32" y2="32" stroke="#92400e" strokeWidth=".8"/>
          <path d="M24 6L26 4" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
      </svg>
    ),
  },
  {
    id: "moon-stars",
    nameAr: "قمر ونجوم",
    nameEn: "Moon & Stars",
    price: 120,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .ms{animation:ag-glow 2.5s ease-in-out infinite;transform-origin:center;color:#fbbf24`}</style>
        <defs>
          <linearGradient id="ms-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#f59e0b"/></linearGradient>
        </defs>
        <g className="ms">
          <path d="M20 6C20 6 10 12 10 24C10 36 20 42 20 42C10 40 4 32 4 24C4 16 10 8 20 6Z" fill="url(#ms-g)"/>
          <circle cx="34" cy="10" r="1.5" fill="#fbbf24"/>
          <path d="M34 7L35 9L37 10L35 11L34 13L33 11L31 10L33 9Z" fill="#fde68a"/>
          <circle cx="40" cy="22" r="1" fill="#fbbf24" opacity=".7"/>
          <path d="M40 20L40.8 21.2L42 22L40.8 22.8L40 24L39.2 22.8L38 22L39.2 21.2Z" fill="#fde68a" opacity=".7"/>
          <circle cx="28" cy="40" r="1" fill="#fbbf24" opacity=".6"/>
          <path d="M28 38L28.6 39L30 40L28.6 41L28 42L27.4 41L26 40L27.4 39Z" fill="#fde68a" opacity=".6"/>
          <circle cx="42" cy="36" r=".8" fill="#fbbf24" opacity=".5"/>
        </g>
      </svg>
    ),
  },
  {
    id: "aurora",
    nameAr: "شفق قطبي",
    nameEn: "Aurora",
    price: 300,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .au{animation:ag-float 3s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="au-g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity=".8"/><stop offset="100%" stopColor="#22c55e" stopOpacity="0"/></linearGradient>
          <linearGradient id="au-g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" stopOpacity=".6"/><stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/></linearGradient>
          <linearGradient id="au-g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity=".5"/><stop offset="100%" stopColor="#a78bfa" stopOpacity="0"/></linearGradient>
        </defs>
        <g className="au">
          <rect x="0" y="40" width="48" height="8" fill="#1e293b"/>
          <path d="M4 40L8 28C12 18 18 14 24 16C30 18 36 12 40 18L44 40Z" fill="url(#au-g1)"/>
          <path d="M8 40L12 30C16 22 22 18 28 20C34 22 38 16 42 22L46 40Z" fill="url(#au-g2)"/>
          <path d="M12 40L16 32C20 26 26 22 32 24C36 26 40 20 44 26L46 40Z" fill="url(#au-g3)"/>
          <circle cx="8" cy="8" r="1" fill="#fff" opacity=".6"/>
          <circle cx="20" cy="4" r=".8" fill="#fff" opacity=".5"/>
          <circle cx="36" cy="6" r="1" fill="#fff" opacity=".7"/>
          <circle cx="42" cy="12" r=".6" fill="#fff" opacity=".4"/>
          <circle cx="14" cy="12" r=".8" fill="#fff" opacity=".5"/>
        </g>
      </svg>
    ),
  },
  {
    id: "cactus",
    nameAr: "صبار",
    nameEn: "Cactus",
    price: 90,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .ct{animation:ag-wiggle 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="ct-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#15803d"/></linearGradient>
        </defs>
        <g className="ct">
          <rect x="20" y="10" width="8" height="28" rx="4" fill="url(#ct-g)"/>
          <path d="M20 22H14C12 22 10 20 10 18V16C10 14 12 14 14 16V22" fill="url(#ct-g)"/>
          <path d="M28 18H34C36 18 38 16 38 14V12C38 10 36 10 34 12V18" fill="url(#ct-g)"/>
          <rect x="16" y="38" width="16" height="6" rx="2" fill="#92400e"/>
          <circle cx="22" cy="16" r="1" fill="#86efac" opacity=".5"/>
          <circle cx="26" cy="24" r="1" fill="#86efac" opacity=".5"/>
          <circle cx="22" cy="30" r="1" fill="#86efac" opacity=".5"/>
          <circle cx="24" cy="8" r="2" fill="#e11d48"/>
          <circle cx="24" cy="8" r="1" fill="#fda4af"/>
        </g>
      </svg>
    ),
  },
  {
    id: "palm-tree",
    nameAr: "نخلة",
    nameEn: "Palm Tree",
    price: 180,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .plt{animation:ag-float 2.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="plt-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16a34a"/><stop offset="100%" stopColor="#15803d"/></linearGradient>
          <linearGradient id="plt-trunk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a16207"/><stop offset="100%" stopColor="#78350f"/></linearGradient>
        </defs>
        <g className="plt">
          <rect x="22" y="18" width="4" height="26" rx="1" fill="url(#plt-trunk)"/>
          <path d="M24 18C24 18 14 14 8 18C12 12 20 12 24 14Z" fill="url(#plt-g)"/>
          <path d="M24 18C24 18 34 14 40 18C36 12 28 12 24 14Z" fill="url(#plt-g)"/>
          <path d="M24 16C24 16 18 8 12 8C18 6 24 10 24 12Z" fill="#22c55e"/>
          <path d="M24 16C24 16 30 8 36 8C30 6 24 10 24 12Z" fill="#22c55e"/>
          <path d="M24 14C24 14 22 6 24 2C26 6 24 14 24 14Z" fill="#16a34a"/>
          <path d="M22 24L22 26" stroke="#78350f" strokeWidth="1" opacity=".3"/>
          <path d="M26 28L26 30" stroke="#78350f" strokeWidth="1" opacity=".3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "volcano",
    nameAr: "بركان",
    nameEn: "Volcano",
    price: 250,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .vlc{animation:ag-pulse 1.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="vlc-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#78350f"/><stop offset="100%" stopColor="#451a03"/></linearGradient>
          <radialGradient id="vlc-lava" cx=".5" cy=".5" r=".5"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#dc2626"/></radialGradient>
        </defs>
        <g className="vlc">
          <path d="M10 44L20 16L28 16L38 44Z" fill="url(#vlc-g)"/>
          <path d="M20 16L22 20L26 20L28 16Z" fill="#dc2626"/>
          <ellipse cx="24" cy="16" rx="4" ry="2" fill="url(#vlc-lava)"/>
          <path d="M22 14C22 10 20 6 18 4" stroke="#f97316" strokeWidth="1.5" fill="none" opacity=".7"/>
          <path d="M26 14C26 10 28 6 30 4" stroke="#f97316" strokeWidth="1.5" fill="none" opacity=".7"/>
          <path d="M24 14L24 4" stroke="#fbbf24" strokeWidth="1.5" fill="none" opacity=".6"/>
          <circle cx="18" cy="4" r="2" fill="#fbbf24" opacity=".6"/>
          <circle cx="30" cy="4" r="2" fill="#f97316" opacity=".6"/>
          <circle cx="24" cy="3" r="1.5" fill="#fef9c3" opacity=".7"/>
          <path d="M6 44H42" stroke="#451a03" strokeWidth="2"/>
          <path d="M16 26L18 24" stroke="#92400e" strokeWidth=".5" opacity=".4"/>
          <path d="M30 28L32 26" stroke="#92400e" strokeWidth=".5" opacity=".4"/>
        </g>
      </svg>
    ),
  },
  {
    id: "waterfall",
    nameAr: "شلال",
    nameEn: "Waterfall",
    price: 220,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .wf{animation:ag-float 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="wf-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#94a3b8"/><stop offset="100%" stopColor="#475569"/></linearGradient>
          <linearGradient id="wf-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#2563eb"/></linearGradient>
        </defs>
        <g className="wf">
          <rect x="4" y="4" width="16" height="36" rx="2" fill="url(#wf-g)"/>
          <rect x="28" y="4" width="16" height="36" rx="2" fill="url(#wf-g)"/>
          <rect x="18" y="8" width="12" height="32" rx="1" fill="url(#wf-water)" opacity=".7"/>
          <rect x="20" y="8" width="8" height="32" rx="1" fill="#93c5fd" opacity=".4"/>
          <path d="M4 40H44V44H4Z" fill="#2563eb" opacity=".5"/>
          <path d="M4 42C8 40 16 42 24 40C32 42 40 40 44 42" stroke="#60a5fa" strokeWidth="1" fill="none" opacity=".5"/>
          <circle cx="18" cy="44" r="3" fill="#93c5fd" opacity=".3"/>
          <circle cx="30" cy="44" r="3" fill="#93c5fd" opacity=".3"/>
          <circle cx="24" cy="10" r="1" fill="#fff" opacity=".4"/>
          <circle cx="22" cy="18" r="1" fill="#fff" opacity=".3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "comet",
    nameAr: "مذنب",
    nameEn: "Comet",
    price: 160,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .cmt{animation:ag-bounce 1.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="cmt-tail" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#60a5fa" stopOpacity="0"/><stop offset="100%" stopColor="#60a5fa"/></linearGradient>
          <radialGradient id="cmt-head" cx=".5" cy=".5" r=".5"><stop offset="0%" stopColor="#fef9c3"/><stop offset="100%" stopColor="#fbbf24"/></radialGradient>
        </defs>
        <g className="cmt">
          <path d="M4 4L34 28" stroke="url(#cmt-tail)" strokeWidth="4" strokeLinecap="round"/>
          <path d="M8 6L32 26" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" opacity=".4"/>
          <path d="M12 2L34 24" stroke="#bfdbfe" strokeWidth="1" strokeLinecap="round" opacity=".2"/>
          <circle cx="34" cy="28" r="6" fill="url(#cmt-head)"/>
          <circle cx="34" cy="28" r="3" fill="#fef9c3"/>
          <circle cx="33" cy="27" r="1" fill="#fff" opacity=".8"/>
        </g>
      </svg>
    ),
  },
  {
    id: "eagle",
    nameAr: "نسر",
    nameEn: "Eagle",
    price: 350,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .egl{animation:ag-float 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="egl-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#78350f"/><stop offset="100%" stopColor="#451a03"/></linearGradient>
        </defs>
        <g className="egl">
          <path d="M4 22C4 22 14 14 24 18C34 14 44 22 44 22C40 18 34 20 30 22C26 24 22 24 18 22C14 20 8 18 4 22Z" fill="url(#egl-g)"/>
          <ellipse cx="24" cy="22" rx="6" ry="4" fill="#92400e"/>
          <circle cx="24" cy="18" r="4" fill="#f1f5f9"/>
          <circle cx="22" cy="17" r="1" fill="#1e1e1e"/>
          <path d="M20 16L18 14" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M24 20L24 26" stroke="#92400e" strokeWidth="1.5"/>
          <path d="M22 26L20 34L24 30L28 34L26 26" fill="#fbbf24"/>
          <circle cx="20" cy="34" r="1" fill="#92400e"/>
          <circle cx="28" cy="34" r="1" fill="#92400e"/>
          <path d="M10 20L6 18" stroke="#451a03" strokeWidth=".5" opacity=".5"/>
          <path d="M38 20L42 18" stroke="#451a03" strokeWidth=".5" opacity=".5"/>
        </g>
      </svg>
    ),
  },
  {
    id: "desert-dune",
    nameAr: "كثبان صحراوية",
    nameEn: "Desert Dune",
    price: 130,
    category: "nature",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .dd{animation:ag-pulse 3s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="dd-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
        </defs>
        <g className="dd">
          <circle cx="38" cy="10" r="6" fill="#fbbf24"/>
          <circle cx="38" cy="10" r="4" fill="#fde68a"/>
          <path d="M0 36C8 28 16 32 24 28C32 24 40 30 48 36V48H0Z" fill="url(#dd-g)"/>
          <path d="M0 40C10 34 20 38 30 34C38 30 44 36 48 40V48H0Z" fill="#d97706"/>
          <path d="M0 44C12 40 24 42 36 40C42 38 46 42 48 44V48H0Z" fill="#b45309"/>
          <circle cx="12" cy="12" r="1" fill="#92400e" opacity=".3"/>
          <circle cx="18" cy="16" r=".8" fill="#92400e" opacity=".2"/>
        </g>
      </svg>
    ),
  },
];

/* ══════════════════════════════════════════════════════════
   FUN GIFTS  (20 – 500 coins)
   ══════════════════════════════════════════════════════════ */

const funGifts: AnimatedGift[] = [
  {
    id: "rocket",
    nameAr: "صاروخ",
    nameEn: "Rocket",
    price: 20,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .rk{animation:ag-bounce 1s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="rk-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f1f5f9"/><stop offset="100%" stopColor="#94a3b8"/></linearGradient>
        </defs>
        <g className="rk">
          <path d="M24 4C24 4 32 14 32 30L28 34H20L16 30C16 14 24 4 24 4Z" fill="url(#rk-g)"/>
          <path d="M24 4C24 4 28 12 28 22L24 20L20 22C20 12 24 4 24 4Z" fill="#e11d48"/>
          <circle cx="24" cy="20" r="3" fill="#60a5fa"/>
          <circle cx="24" cy="20" r="1.5" fill="#93c5fd"/>
          <path d="M20 34L16 40L22 36Z" fill="#f97316"/>
          <path d="M28 34L32 40L26 36Z" fill="#f97316"/>
          <path d="M22 36L24 44L26 36Z" fill="#fbbf24"/>
          <path d="M21 38L20 42" stroke="#f97316" strokeWidth="1" opacity=".6"/>
          <path d="M27 38L28 42" stroke="#f97316" strokeWidth="1" opacity=".6"/>
        </g>
      </svg>
    ),
  },
  {
    id: "magic-wand",
    nameAr: "عصا سحرية",
    nameEn: "Magic Wand",
    price: 50,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .mw{animation:ag-sparkle 1.2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="mw-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#78350f"/></linearGradient>
        </defs>
        <g className="mw">
          <rect x="22" y="18" width="4" height="28" rx="1" fill="url(#mw-g)" transform="rotate(-45 24 32)"/>
          <path d="M12 6L14 12L8 10L14 12L12 18L16 12L20 14L16 10L22 8L16 10Z" fill="#fbbf24"/>
          <circle cx="12" cy="10" r="2" fill="#fde68a"/>
          <circle cx="8" cy="6" r="1" fill="#fbbf24" opacity=".6"/>
          <circle cx="16" cy="4" r="1.2" fill="#c084fc" opacity=".7"/>
          <circle cx="6" cy="14" r="1" fill="#f472b6" opacity=".6"/>
          <circle cx="18" cy="14" r=".8" fill="#60a5fa" opacity=".6"/>
        </g>
      </svg>
    ),
  },
  {
    id: "dj-headphones",
    nameAr: "سماعات دي جي",
    nameEn: "DJ Headphones",
    price: 80,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .dj{animation:ag-shake 1.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="dj-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#312e81"/></linearGradient>
        </defs>
        <g className="dj">
          <path d="M10 24C10 14 16 8 24 8C32 8 38 14 38 24" stroke="#4f46e5" strokeWidth="3" fill="none"/>
          <rect x="6" y="22" width="8" height="14" rx="3" fill="url(#dj-g)"/>
          <rect x="34" y="22" width="8" height="14" rx="3" fill="url(#dj-g)"/>
          <rect x="8" y="26" width="4" height="6" rx="1" fill="#818cf8"/>
          <rect x="36" y="26" width="4" height="6" rx="1" fill="#818cf8"/>
          <circle cx="10" cy="28" r="1" fill="#fbbf24"/>
          <circle cx="38" cy="28" r="1" fill="#fbbf24"/>
          <path d="M14 34C16 36 20 36 24 36" stroke="#fbbf24" strokeWidth="1" fill="none" opacity=".5"/>
          <path d="M34 34C32 36 28 36 24 36" stroke="#fbbf24" strokeWidth="1" fill="none" opacity=".5"/>
        </g>
      </svg>
    ),
  },
  {
    id: "popcorn",
    nameAr: "فشار",
    nameEn: "Popcorn",
    price: 100,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .pc{animation:ag-bounce 1.4s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="pc-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e11d48"/><stop offset="100%" stopColor="#9f1239"/></linearGradient>
        </defs>
        <g className="pc">
          <path d="M14 20L18 42H30L34 20H14Z" fill="url(#pc-g)"/>
          <path d="M12 20H36L34 24H14Z" fill="#f1f5f9"/>
          <path d="M14 20L16 14L18 20" fill="#e11d48" opacity=".5"/>
          <path d="M30 20L32 14L34 20" fill="#e11d48" opacity=".5"/>
          <circle cx="20" cy="16" r="4" fill="#fef3c7"/>
          <circle cx="28" cy="14" r="4.5" fill="#fde68a"/>
          <circle cx="24" cy="12" r="4" fill="#fef9c3"/>
          <circle cx="16" cy="18" r="3" fill="#fef3c7"/>
          <circle cx="32" cy="18" r="3" fill="#fde68a"/>
          <circle cx="22" cy="10" r="3" fill="#fef9c3"/>
          <circle cx="22" cy="14" r="1" fill="#fbbf24" opacity=".4"/>
          <circle cx="28" cy="12" r="1" fill="#f59e0b" opacity=".4"/>
          <circle cx="18" cy="16" r=".8" fill="#fbbf24" opacity=".3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "skateboard",
    nameAr: "سكيت بورد",
    nameEn: "Skateboard",
    price: 150,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .sk{animation:ag-float 1.6s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="sk-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#f97316"/><stop offset="100%" stopColor="#ea580c"/></linearGradient>
        </defs>
        <g className="sk">
          <path d="M8 24C4 24 4 28 8 28L12 28C14 28 14 32 16 32L32 32C34 32 34 28 36 28L40 28C44 28 44 24 40 24Z" fill="url(#sk-g)"/>
          <circle cx="14" cy="34" r="4" fill="#1e1e1e"/>
          <circle cx="14" cy="34" r="2" fill="#6b7280"/>
          <circle cx="34" cy="34" r="4" fill="#1e1e1e"/>
          <circle cx="34" cy="34" r="2" fill="#6b7280"/>
          <rect x="18" y="25" width="4" height="2" rx=".5" fill="#fbbf24"/>
          <rect x="26" y="25" width="4" height="2" rx=".5" fill="#fbbf24"/>
          <path d="M16 26L20 24" stroke="#fbbf24" strokeWidth=".5" opacity=".5"/>
          <path d="M28 26L32 24" stroke="#fbbf24" strokeWidth=".5" opacity=".5"/>
        </g>
      </svg>
    ),
  },
  {
    id: "robot",
    nameAr: "روبوت",
    nameEn: "Robot",
    price: 200,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .rb2{animation:ag-shake 1.8s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="rb2-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#94a3b8"/><stop offset="100%" stopColor="#475569"/></linearGradient>
        </defs>
        <g className="rb2">
          <rect x="20" y="2" width="8" height="4" rx="2" fill="#64748b"/>
          <circle cx="24" cy="2" r="2" fill="#e11d48"/>
          <rect x="14" y="8" width="20" height="16" rx="3" fill="url(#rb2-g)"/>
          <circle cx="20" cy="16" r="3" fill="#60a5fa"/>
          <circle cx="28" cy="16" r="3" fill="#60a5fa"/>
          <circle cx="20" cy="15" r="1.2" fill="#93c5fd"/>
          <circle cx="28" cy="15" r="1.2" fill="#93c5fd"/>
          <rect x="20" y="20" width="8" height="2" rx="1" fill="#1e293b"/>
          <rect x="10" y="12" width="4" height="10" rx="2" fill="#64748b"/>
          <rect x="34" y="12" width="4" height="10" rx="2" fill="#64748b"/>
          <rect x="16" y="26" width="16" height="12" rx="2" fill="#475569"/>
          <rect x="18" y="28" width="4" height="8" rx="1" fill="#64748b"/>
          <rect x="26" y="28" width="4" height="8" rx="1" fill="#64748b"/>
          <rect x="14" y="38" width="6" height="4" rx="2" fill="#475569"/>
          <rect x="28" y="38" width="6" height="4" rx="2" fill="#475569"/>
        </g>
      </svg>
    ),
  },
  {
    id: "alien",
    nameAr: "فضائي",
    nameEn: "Alien",
    price: 250,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .al{animation:ag-float 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <radialGradient id="al-g" cx=".5" cy=".4" r=".6"><stop offset="0%" stopColor="#86efac"/><stop offset="100%" stopColor="#16a34a"/></radialGradient>
        </defs>
        <g className="al">
          <ellipse cx="24" cy="18" rx="14" ry="16" fill="url(#al-g)"/>
          <ellipse cx="17" cy="16" rx="5" ry="6" fill="#1e1e1e"/>
          <ellipse cx="31" cy="16" rx="5" ry="6" fill="#1e1e1e"/>
          <ellipse cx="17" cy="16" rx="3" ry="4" fill="#22c55e"/>
          <ellipse cx="31" cy="16" rx="3" ry="4" fill="#22c55e"/>
          <circle cx="16" cy="15" r="1.2" fill="#fff" opacity=".7"/>
          <circle cx="30" cy="15" r="1.2" fill="#fff" opacity=".7"/>
          <ellipse cx="24" cy="26" rx="2" ry="1" fill="#15803d"/>
          <path d="M20 28C22 30 26 30 28 28" stroke="#15803d" strokeWidth=".8" fill="none"/>
          <ellipse cx="24" cy="40" rx="8" ry="4" fill="#22c55e" opacity=".5"/>
          <path d="M10 20L6 16" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
          <path d="M38 20L42 16" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="6" cy="15" r="1.5" fill="#22c55e"/>
          <circle cx="42" cy="15" r="1.5" fill="#22c55e"/>
        </g>
      </svg>
    ),
  },
  {
    id: "pirate-ship",
    nameAr: "سفينة قراصنة",
    nameEn: "Pirate Ship",
    price: 300,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .ps{animation:ag-bounce 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="ps-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#78350f"/><stop offset="100%" stopColor="#451a03"/></linearGradient>
        </defs>
        <g className="ps">
          <path d="M4 32C4 32 12 36 24 36C36 36 44 32 44 32L40 40H8Z" fill="url(#ps-g)"/>
          <rect x="8" y="28" width="32" height="4" rx="1" fill="#92400e"/>
          <rect x="22" y="10" width="4" height="18" fill="#78350f"/>
          <path d="M26 12L40 12L40 26L26 26Z" fill="#f1f5f9"/>
          <path d="M22 14L12 14L12 26L22 26Z" fill="#f1f5f9"/>
          <rect x="22" y="4" width="4" height="8" fill="#78350f"/>
          <path d="M26 4L34 6L26 8Z" fill="#1e1e1e"/>
          <circle cx="33" cy="18" r="2" fill="#1e1e1e"/>
          <path d="M31 16L35 20" stroke="#fff" strokeWidth=".8"/>
          <path d="M35 16L31 20" stroke="#fff" strokeWidth=".8"/>
          <path d="M4 38C8 36 16 36 24 38C32 36 40 36 44 38" stroke="#3b82f6" strokeWidth="1" fill="none" opacity=".3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "ninja-star",
    nameAr: "نجمة نينجا",
    nameEn: "Ninja Star",
    price: 400,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .ns{animation:ag-spin 1.5s linear infinite;transform-origin:24px 24px}`}</style>
        <defs>
          <linearGradient id="ns-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6b7280"/><stop offset="100%" stopColor="#1e1e1e"/></linearGradient>
        </defs>
        <g className="ns">
          <path d="M24 2L28 18L44 14L30 24L44 34L28 30L24 46L20 30L4 34L18 24L4 14L20 18Z" fill="url(#ns-g)"/>
          <circle cx="24" cy="24" r="5" fill="#374151"/>
          <circle cx="24" cy="24" r="3" fill="#1e1e1e"/>
          <circle cx="24" cy="24" r="1" fill="#6b7280"/>
          <path d="M14 10L12 8" stroke="#9ca3af" strokeWidth=".5" opacity=".3"/>
          <path d="M36 10L38 8" stroke="#9ca3af" strokeWidth=".5" opacity=".3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "lightning-bolt",
    nameAr: "صاعقة",
    nameEn: "Lightning Bolt",
    price: 500,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .lb2{animation:ag-sparkle 0.8s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="lb2-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fef08a"/><stop offset="100%" stopColor="#f59e0b"/></linearGradient>
        </defs>
        <g className="lb2">
          <path d="M28 2L12 24H22L18 46L38 20H28Z" fill="url(#lb2-g)"/>
          <path d="M28 2L20 14H26L18 46" stroke="#fde68a" strokeWidth="1" fill="none" opacity=".4"/>
          <path d="M14 24H22L20 30" stroke="#fbbf24" strokeWidth=".5" fill="none" opacity=".3"/>
          <circle cx="26" cy="10" r="1" fill="#fff" opacity=".6"/>
          <circle cx="22" cy="38" r="1.5" fill="#fef3c7" opacity=".4"/>
          <path d="M6 18L4 16M8 12L6 10" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" opacity=".3"/>
          <path d="M40 30L42 28M38 36L40 34" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" opacity=".3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "ufo",
    nameAr: "طبق طائر",
    nameEn: "UFO",
    price: 300,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .ufo{animation:ag-float 1.5s ease-in-out infinite;transform-origin:center}.ufo-beam{animation:ag-pulse 2s ease-in-out infinite .5s}`}</style>
        <defs>
          <linearGradient id="ufo-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#94a3b8"/><stop offset="100%" stopColor="#475569"/></linearGradient>
          <radialGradient id="ufo-dome" cx=".4" cy=".3" r=".5"><stop offset="0%" stopColor="#bfdbfe"/><stop offset="100%" stopColor="#3b82f6"/></radialGradient>
        </defs>
        <g className="ufo">
          <ellipse cx="24" cy="20" rx="18" ry="6" fill="url(#ufo-g)"/>
          <ellipse cx="24" cy="19" rx="18" ry="6" fill="#64748b" opacity=".3"/>
          <ellipse cx="24" cy="16" rx="8" ry="8" fill="url(#ufo-dome)"/>
          <ellipse cx="22" cy="14" rx="3" ry="2" fill="#fff" opacity=".3"/>
          <circle cx="12" cy="20" r="2" fill="#fbbf24" opacity=".8"/>
          <circle cx="20" cy="21" r="1.5" fill="#22c55e" opacity=".8"/>
          <circle cx="28" cy="21" r="1.5" fill="#e11d48" opacity=".8"/>
          <circle cx="36" cy="20" r="2" fill="#fbbf24" opacity=".8"/>
        </g>
        <g className="ufo-beam">
          <path d="M16 26L10 44L38 44L32 26Z" fill="#fef08a" opacity=".15"/>
        </g>
      </svg>
    ),
  },
  {
    id: "pirate-flag",
    nameAr: "علم قراصنة",
    nameEn: "Pirate Flag",
    price: 120,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .pf{animation:ag-shake 2s ease-in-out infinite;transform-origin:top center}`}</style>
        <defs>
          <linearGradient id="pf-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1e1e1e"/><stop offset="100%" stopColor="#374151"/></linearGradient>
        </defs>
        <g className="pf">
          <rect x="8" y="4" width="3" height="40" rx="1" fill="#78350f"/>
          <circle cx="9.5" cy="4" r="2" fill="#92400e"/>
          <path d="M11 8L38 8L38 28L11 28Z" fill="url(#pf-g)"/>
          <circle cx="24" cy="16" r="5" fill="#f1f5f9"/>
          <path d="M21 13L27 19M27 13L21 19" stroke="#1e1e1e" strokeWidth="2"/>
          <ellipse cx="24" cy="22" rx="2" ry="1" fill="#f1f5f9"/>
          <path d="M11 28C14 26 18 28 22 26C26 28 30 26 34 28C36 28 38 26 38 28" stroke="#1e1e1e" strokeWidth=".5" opacity=".3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "superhero-cape",
    nameAr: "عباءة بطل خارق",
    nameEn: "Superhero Cape",
    price: 250,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .shc{animation:ag-float 1.8s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="shc-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#dc2626"/><stop offset="100%" stopColor="#991b1b"/></linearGradient>
        </defs>
        <g className="shc">
          <path d="M18 6L30 6L32 10L36 44L24 40L12 44L16 10Z" fill="url(#shc-g)"/>
          <path d="M20 6L28 6L30 8L18 8Z" fill="#fbbf24"/>
          <circle cx="24" cy="12" r="3" fill="#fbbf24"/>
          <path d="M22 12L24 9L26 12L24 15Z" fill="#dc2626"/>
          <path d="M18 10C18 10 14 12 14 16" stroke="#991b1b" strokeWidth=".5" fill="none" opacity=".4"/>
          <path d="M30 10C30 10 34 12 34 16" stroke="#991b1b" strokeWidth=".5" fill="none" opacity=".4"/>
          <path d="M16 20L20 22M32 20L28 22" stroke="#fbbf24" strokeWidth=".5" opacity=".4"/>
        </g>
      </svg>
    ),
  },
  {
    id: "dinosaur",
    nameAr: "ديناصور",
    nameEn: "Dinosaur",
    price: 180,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .dino{animation:ag-bounce 1.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="dino-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#15803d"/></linearGradient>
        </defs>
        <g className="dino">
          <ellipse cx="30" cy="28" rx="10" ry="8" fill="url(#dino-g)"/>
          <ellipse cx="20" cy="18" rx="6" ry="8" fill="url(#dino-g)"/>
          <path d="M14 14L10 12L14 10" fill="#22c55e"/>
          <circle cx="18" cy="14" r="2" fill="#fff"/>
          <circle cx="17" cy="14" r="1" fill="#1e1e1e"/>
          <path d="M14 20L8 24L8 28" stroke="#15803d" strokeWidth="3" strokeLinecap="round"/>
          <path d="M34 34L34 40" stroke="#15803d" strokeWidth="3" strokeLinecap="round"/>
          <path d="M28 34L28 40" stroke="#15803d" strokeWidth="3" strokeLinecap="round"/>
          <path d="M38 26L42 30L42 34" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/>
          <path d="M24 10L22 6M26 10L26 6M28 10L30 7" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="22" cy="5.5" r="1" fill="#86efac"/>
          <circle cx="26" cy="5.5" r="1" fill="#86efac"/>
          <circle cx="30" cy="6.5" r="1" fill="#86efac"/>
        </g>
      </svg>
    ),
  },
  {
    id: "time-machine",
    nameAr: "آلة الزمن",
    nameEn: "Time Machine",
    price: 500,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .tm{animation:ag-spin 3s linear infinite;transform-origin:24px 24px}.tm-needle{animation:ag-spin 1s linear infinite;transform-origin:24px 24px}`}</style>
        <defs>
          <linearGradient id="tm-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c084fc"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient>
        </defs>
        <g className="tm">
          <circle cx="24" cy="24" r="18" fill="url(#tm-g)" opacity=".3"/>
          <circle cx="24" cy="24" r="14" fill="#1e1e1e"/>
          <circle cx="24" cy="24" r="12" fill="#0f172a"/>
          <circle cx="24" cy="24" r="10" stroke="#a78bfa" strokeWidth=".5" fill="none" strokeDasharray="2 2"/>
          <g className="tm-needle">
            <line x1="24" y1="24" x2="24" y2="14" stroke="#c084fc" strokeWidth="2" strokeLinecap="round"/>
          </g>
          <line x1="24" y1="24" x2="32" y2="20" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="24" cy="24" r="2" fill="#a78bfa"/>
          <text x="24" y="16" textAnchor="middle" fontSize="4" fill="#a78bfa" opacity=".6">IV</text>
          <text x="24" y="35" textAnchor="middle" fontSize="4" fill="#a78bfa" opacity=".6">XII</text>
          <text x="33" y="25" textAnchor="middle" fontSize="4" fill="#a78bfa" opacity=".6">III</text>
          <text x="15" y="25" textAnchor="middle" fontSize="4" fill="#a78bfa" opacity=".6">IX</text>
        </g>
      </svg>
    ),
  },
  {
    id: "wizard-hat",
    nameAr: "قبعة ساحر",
    nameEn: "Wizard Hat",
    price: 140,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .wz{animation:ag-wiggle 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="wz-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#3b0764"/></linearGradient>
        </defs>
        <g className="wz">
          <path d="M24 4L14 34H34Z" fill="url(#wz-g)"/>
          <ellipse cx="24" cy="34" rx="16" ry="5" fill="#6d28d9"/>
          <ellipse cx="24" cy="34" rx="14" ry="3" fill="#5b21b6" opacity=".5"/>
          <path d="M18 24L20 20L22 24L24 18L26 22L28 18L30 24" stroke="#fbbf24" strokeWidth="1.5" fill="none"/>
          <circle cx="24" cy="4" r="2" fill="#fbbf24"/>
          <circle cx="20" cy="30" r="1" fill="#fbbf24" opacity=".5"/>
          <circle cx="28" cy="30" r="1" fill="#fbbf24" opacity=".5"/>
          <path d="M16 32L12 30" stroke="#7c3aed" strokeWidth="1.5" opacity=".3"/>
          <path d="M32 32L36 30" stroke="#7c3aed" strokeWidth="1.5" opacity=".3"/>
        </g>
      </svg>
    ),
  },
  {
    id: "ghost",
    nameAr: "شبح",
    nameEn: "Ghost",
    price: 160,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .gh{animation:ag-float 2s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <radialGradient id="gh-g" cx=".5" cy=".3" r=".6"><stop offset="0%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#cbd5e1"/></radialGradient>
        </defs>
        <g className="gh">
          <path d="M12 20C12 10 16 4 24 4C32 4 36 10 36 20V38L32 34L28 38L24 34L20 38L16 34L12 38Z" fill="url(#gh-g)"/>
          <circle cx="19" cy="18" r="3" fill="#1e1e1e"/>
          <circle cx="29" cy="18" r="3" fill="#1e1e1e"/>
          <circle cx="20" cy="17" r="1" fill="#fff" opacity=".7"/>
          <circle cx="30" cy="17" r="1" fill="#fff" opacity=".7"/>
          <ellipse cx="24" cy="26" rx="3" ry="2" fill="#94a3b8" opacity=".5"/>
          <path d="M22 26L26 26" stroke="#64748b" strokeWidth=".8" strokeLinecap="round"/>
        </g>
      </svg>
    ),
  },
  {
    id: "treasure-chest",
    nameAr: "صندوق كنز",
    nameEn: "Treasure Chest",
    price: 220,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .tc2{animation:ag-bounce 1.8s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <linearGradient id="tc2-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a16207"/><stop offset="100%" stopColor="#78350f"/></linearGradient>
        </defs>
        <g className="tc2">
          <rect x="6" y="22" width="36" height="18" rx="2" fill="url(#tc2-g)"/>
          <path d="M6 22C6 22 6 18 24 18C42 18 42 22 42 22Z" fill="#92400e"/>
          <rect x="6" y="22" width="36" height="3" fill="#d97706"/>
          <rect x="6" y="20" width="36" height="4" fill="#b45309"/>
          <rect x="20" y="20" width="8" height="6" rx="1" fill="#fbbf24"/>
          <circle cx="24" cy="23" r="2" fill="#92400e"/>
          <line x1="12" y1="28" x2="12" y2="36" stroke="#6b7280" strokeWidth=".8" opacity=".5"/>
          <line x1="36" y1="28" x2="36" y2="36" stroke="#6b7280" strokeWidth=".8" opacity=".5"/>
          <circle cx="16" cy="14" r="1.5" fill="#fde68a" opacity=".6"/>
          <circle cx="30" cy="12" r="1" fill="#fbbf24" opacity=".5"/>
          <circle cx="22" cy="10" r="1.5" fill="#fef9c3" opacity=".7"/>
        </g>
      </svg>
    ),
  },
  {
    id: "voodoo-doll",
    nameAr: "دمية فوودو",
    nameEn: "Voodoo Doll",
    price: 170,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .vd{animation:ag-shake 1.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <radialGradient id="vd-g" cx=".5" cy=".4" r=".6"><stop offset="0%" stopColor="#d4a574"/><stop offset="100%" stopColor="#8b5e3c"/></radialGradient>
        </defs>
        <g className="vd">
          <line x1="24" y1="4" x2="24" y2="8" stroke="#92400e" strokeWidth="1.5"/>
          <ellipse cx="24" cy="16" rx="8" ry="10" fill="url(#vd-g)"/>
          <circle cx="21" cy="14" r="2" fill="#1e1e1e"/>
          <circle cx="27" cy="14" r="2" fill="#1e1e1e"/>
          <path d="M21 14L23 12" stroke="#e11d48" strokeWidth=".8"/>
          <path d="M27 14L25 12" stroke="#e11d48" strokeWidth=".8"/>
          <path d="M22 20L26 20" stroke="#92400e" strokeWidth="1" strokeLinecap="round"/>
          <line x1="16" y1="16" x2="8" y2="12" stroke="#8b5e3c" strokeWidth="2" strokeLinecap="round"/>
          <line x1="32" y1="16" x2="40" y2="12" stroke="#8b5e3c" strokeWidth="2" strokeLinecap="round"/>
          <line x1="20" y1="24" x2="16" y2="34" stroke="#8b5e3c" strokeWidth="2" strokeLinecap="round"/>
          <line x1="28" y1="24" x2="32" y2="34" stroke="#8b5e3c" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="24" cy="12" r=".8" fill="#e11d48"/>
        </g>
      </svg>
    ),
  },
  {
    id: "bubble-gum",
    nameAr: "علكة فقاعة",
    nameEn: "Bubble Gum",
    price: 35,
    category: "fun",
    svgRenderer: (s = 48) => (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`${KEYFRAMES} .bg2{animation:ag-pulse 1.5s ease-in-out infinite;transform-origin:center}`}</style>
        <defs>
          <radialGradient id="bg2-g" cx=".4" cy=".3" r=".5"><stop offset="0%" stopColor="#f9a8d4"/><stop offset="100%" stopColor="#ec4899"/></radialGradient>
          <radialGradient id="bg2-bubble" cx=".35" cy=".3" r=".5"><stop offset="0%" stopColor="#fda4af"/><stop offset="100%" stopColor="#f472b6"/></radialGradient>
        </defs>
        <g className="bg2">
          <rect x="16" y="28" width="16" height="8" rx="4" fill="url(#bg2-g)"/>
          <circle cx="24" cy="18" r="12" fill="url(#bg2-bubble)" opacity=".7"/>
          <circle cx="24" cy="18" r="10" fill="#fda4af" opacity=".3"/>
          <ellipse cx="20" cy="14" rx="3" ry="4" fill="#fff" opacity=".2"/>
          <circle cx="30" cy="16" r="1.5" fill="#fff" opacity=".15"/>
          <ellipse cx="24" cy="8" rx="2" ry="1" fill="#fce7f3" opacity=".4"/>
          <path d="M24 26L24 28" stroke="#ec4899" strokeWidth="2" strokeLinecap="round"/>
        </g>
      </svg>
    ),
  },
];

/* ══════════════════════════════════════════════════════════
   MASTER ARRAY
   ══════════════════════════════════════════════════════════ */

export const ANIMATED_GIFTS: AnimatedGift[] = [
  ...loveGifts,
  ...celebrationGifts,
  ...luxuryGifts,
  ...natureGifts,
  ...funGifts,
];

/* ══════════════════════════════════════════════════════════
   AnimatedGiftIcon Component
   ══════════════════════════════════════════════════════════ */

interface AnimatedGiftIconProps {
  gift: AnimatedGift;
  size?: number;
  className?: string;
}

export const AnimatedGiftIcon: React.FC<AnimatedGiftIconProps> = ({
  gift,
  size = 48,
  className = "",
}) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {gift.svgRenderer(size)}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   GiftShopGrid Component
   ══════════════════════════════════════════════════════════ */

interface GiftShopGridProps {
  onBuy?: (gift: AnimatedGift) => void;
  balance?: number;
  lang?: "ar" | "en";
}

export const GiftShopGrid: React.FC<GiftShopGridProps> = ({
  onBuy,
  balance = 0,
  lang = "ar",
}) => {
  const [activeCategory, setActiveCategory] = useState<GiftCategory | "all">("all");
  const [search, setSearch] = useState("");
  const isAr = lang === "ar";

  const filtered = useMemo(() => {
    let list = ANIMATED_GIFTS;
    if (activeCategory !== "all") {
      list = list.filter((g) => g.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (g) =>
          g.nameEn.toLowerCase().includes(q) ||
          g.nameAr.includes(q) ||
          g.id.includes(q)
      );
    }
    return list;
  }, [activeCategory, search]);

  const categories: (GiftCategory | "all")[] = ["all", "love", "celebration", "luxury", "nature", "fun"];

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="w-full max-w-4xl mx-auto bg-gradient-to-b from-gray-950 to-gray-900 rounded-2xl overflow-hidden"
    >
      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-1 p-3 border-b border-white/10 scrollbar-hide">
        {categories.map((cat) => {
          const meta = cat !== "all" ? CATEGORY_META[cat] : null;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                isActive
                  ? cat === "all"
                    ? "bg-white text-gray-900"
                    : `text-white ${meta?.gradient ? `bg-gradient-to-r ${meta.gradient}` : "bg-white"}`
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {cat === "all"
                ? isAr
                  ? "الكل"
                  : "All"
                : isAr
                ? meta?.labelAr
                : meta?.labelEn}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "ابحث عن هدية..." : "Search gifts..."}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm outline-none focus:border-white/30 transition-colors"
          />
          <svg
            className="absolute top-3 right-3 w-4 h-4 text-white/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      </div>

      {/* Balance */}
      {balance > 0 && (
        <div className="px-4 pb-2 flex items-center gap-2 text-xs text-yellow-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span>
            {isAr ? "رصيدك:" : "Balance:"} {balance.toLocaleString()}{" "}
            {isAr ? "عملة" : "coins"}
          </span>
        </div>
      )}

      {/* Gift Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        {filtered.map((gift) => {
          const canAfford = balance >= gift.price;
          return (
            <div
              key={gift.id}
              className="relative bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              {/* Category dot */}
              <div
                className="absolute top-2 left-2 w-2 h-2 rounded-full"
                style={{ backgroundColor: CATEGORY_META[gift.category].color }}
              />
              <AnimatedGiftIcon gift={gift} size={56} />
              <span className="text-white text-xs font-medium text-center leading-tight">
                {isAr ? gift.nameAr : gift.nameEn}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-yellow-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <span className="font-bold">{gift.price.toLocaleString()}</span>
              </div>
              <button
                onClick={() => onBuy?.(gift)}
                disabled={!canAfford && balance > 0}
                className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                  canAfford || balance === 0
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-300 hover:to-orange-400 active:scale-95"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                {isAr ? "إرسال" : "Send"}
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-white/30 text-sm">
            {isAr ? "لا توجد نتائج" : "No gifts found"}
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   GiftSendAnimation Component
   ══════════════════════════════════════════════════════════ */

interface GiftSendAnimationProps {
  gift: AnimatedGift | null;
  senderName?: string;
  visible: boolean;
  onComplete?: () => void;
  lang?: "ar" | "en";
}

/* Particle system */
const Particle: React.FC<{ delay: number; color: string; x: number }> = ({
  delay,
  color,
  x,
}) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full"
    style={{ backgroundColor: color, left: `${x}%`, top: "50%" }}
    initial={{ opacity: 1, scale: 0, y: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      scale: [0, 1.5, 1, 0],
      y: [0, -120, -200],
      x: [0, (Math.random() - 0.5) * 100],
    }}
    transition={{ duration: 1.5, delay, ease: "easeOut" }}
  />
);

export const GiftSendAnimation: React.FC<GiftSendAnimationProps> = ({
  gift,
  senderName,
  visible,
  onComplete,
  lang = "ar",
}) => {
  const isAr = lang === "ar";

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [visible, onComplete]);

  const particles = useMemo(() => {
    if (!gift) return [];
    const colors = [
      CATEGORY_META[gift.category].color,
      "#fbbf24",
      "#f472b6",
      "#60a5fa",
      "#34d399",
    ];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: i * 0.08,
      color: colors[i % colors.length],
      x: 30 + Math.random() * 40,
    }));
  }, [gift]);

  if (!gift) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Radial glow */}
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
              background: `radial-gradient(circle, ${CATEGORY_META[gift.category].color}33 0%, transparent 70%)`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1.2] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {/* Particles */}
          {particles.map((p) => (
            <Particle key={p.id} delay={p.delay} color={p.color} x={p.x} />
          ))}

          {/* Gift Icon */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: [0, 1.4, 1], rotate: [-30, 10, 0] }}
            transition={{ duration: 0.5, ease: "backOut" }}
          >
            <div className="drop-shadow-2xl">
              <AnimatedGiftIcon gift={gift} size={160} />
            </div>
          </motion.div>

          {/* Gift Name */}
          <motion.div
            className="absolute bottom-[30%] text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <p className="text-white text-xl font-bold drop-shadow-lg">
              {isAr ? gift.nameAr : gift.nameEn}
            </p>
            {senderName && (
              <p className="text-white/70 text-sm mt-1">
                {isAr ? `من ${senderName}` : `From ${senderName}`}
              </p>
            )}
          </motion.div>

          {/* Sparkle ring */}
          <motion.div
            className="absolute w-[250px] h-[250px] border-2 rounded-full"
            style={{ borderColor: `${CATEGORY_META[gift.category].color}44` }}
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: [0.5, 2, 2.5], opacity: [0.8, 0.3, 0] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <motion.div
            className="absolute w-[180px] h-[180px] border rounded-full"
            style={{ borderColor: `${CATEGORY_META[gift.category].color}66` }}
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: [0.3, 1.8, 2.2], opacity: [1, 0.4, 0] }}
            transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ══════════════════════════════════════════════════════════
   useGiftSend Hook (convenience)
   ══════════════════════════════════════════════════════════ */

export function useGiftSend() {
  const [activeGift, setActiveGift] = useState<AnimatedGift | null>(null);
  const [senderName, setSenderName] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);

  const sendGift = useCallback((gift: AnimatedGift, sender: string) => {
    setActiveGift(gift);
    setSenderName(sender);
    setShowAnimation(true);
  }, []);

  const complete = useCallback(() => {
    setShowAnimation(false);
    setTimeout(() => {
      setActiveGift(null);
      setSenderName("");
    }, 300);
  }, []);

  return { activeGift, senderName, showAnimation, sendGift, complete };
}

export default ANIMATED_GIFTS;
