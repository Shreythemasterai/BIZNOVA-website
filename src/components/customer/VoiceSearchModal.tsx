'use client';

import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Search, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function VoiceSearchModal({ onApplySearch }: { onApplySearch: (query: string) => void }) {
  const { isVoiceSearchOpen, setIsVoiceSearchOpen } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if (!isVoiceSearchOpen) {
      setIsListening(false);
      setTranscript('');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
          if (event.results[current].isFinal) {
            setTimeout(() => {
              onApplySearch(text);
              setIsVoiceSearchOpen(false);
            }, 600);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();

        return () => {
          recognition.abort();
        };
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    } else {
      setSpeechSupported(false);
    }
  }, [isVoiceSearchOpen, onApplySearch, setIsVoiceSearchOpen]);

  if (!isVoiceSearchOpen) return null;

  const quickVoiceSearches = [
    'Aashirvaad Atta 5kg',
    'Amul Cow Ghee',
    'Tata Toor Dal',
    'Society Tea',
    'Fortune Sunflower Oil',
    'Maggi Noodles',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 text-center space-y-6">
        <button
          onClick={() => setIsVoiceSearchOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="pt-2">
          <div className="relative inline-flex items-center justify-center">
            {isListening && (
              <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 animate-ping" />
            )}
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${
                isListening
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white scale-105'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isListening ? <Mic className="w-9 h-9 animate-pulse" /> : <MicOff className="w-8 h-8" />}
            </div>
          </div>

          <h3 className="text-lg font-black text-slate-900 mt-4">
            {isListening ? 'Listening to your voice...' : 'Voice Product Search'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Speak the name of the grocery item you need (e.g. &quot;Aashirvaad Atta&quot; or &quot;Amul Milk&quot;).
          </p>
        </div>

        {transcript ? (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm font-bold text-emerald-900">
            &quot;{transcript}&quot;
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">Say something like &quot;Pure Cow Ghee&quot;</div>
        )}

        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Or tap to search popular staples
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {quickVoiceSearches.map((item) => (
              <button
                key={item}
                onClick={() => {
                  onApplySearch(item);
                  setIsVoiceSearchOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Search className="w-3 h-3 text-slate-400" />
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
