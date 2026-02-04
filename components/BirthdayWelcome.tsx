"use client";

import { useState, useEffect } from "react";
import { Ornament } from "./Ornament";
import { Sparkles, BookOpen } from "lucide-react";

interface BirthdayWelcomeProps {
  name: string;
  age: number;
  partnerName: string;
  onClose: () => void;
}

export function BirthdayWelcome({ name, age, partnerName, onClose }: BirthdayWelcomeProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 500);
    const timer2 = setTimeout(() => setStep(2), 1500);
    const timer3 = setTimeout(() => setStep(3), 2500);
    const timer4 = setTimeout(() => setStep(4), 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/90 backdrop-blur-md"
      style={{
        backgroundImage: 'url(/images/birthday-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="text-center px-6 max-w-md">
        {/* Stars animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <span
              key={i}
              className="absolute text-lavender animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                fontSize: `${Math.random() * 10 + 10}px`,
                opacity: Math.random() * 0.5 + 0.3,
              }}
            >
              ✦
            </span>
          ))}
        </div>

        {/* Content */}
        <div className="relative">
          {step >= 1 && (
            <div className="animate-fade-in mb-6">
              <Ornament />
            </div>
          )}

          {step >= 2 && (
            <h1 className="font-display text-3xl md:text-4xl text-parchment mb-4 animate-fade-in">
              Happy {age}th Birthday,
              <br />
              <span className="text-lavender">{name}!</span>
            </h1>
          )}

          {step >= 3 && (
            <p className="font-body text-parchment/80 italic text-lg mb-6 animate-fade-in">
              This book of memories is my gift to you...
              <br />
              <span className="text-lavender">— {partnerName}</span>
            </p>
          )}

          {step >= 4 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-parchment/70 text-sm">
                A place for us to keep our adventures,
                <br />
                our moments, our love story.
              </p>

              <button
                onClick={onClose}
                className="btn-primary bg-lavender hover:bg-lavender/80 text-midnight inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Open Our Book
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Check if today is someone's birthday
export function isBirthday(birthday: string): boolean {
  if (!birthday) return false;
  const today = new Date();
  const [month, day] = birthday.split("-").map(Number);
  return today.getMonth() + 1 === month && today.getDate() === day;
}

// Get age from birthdate
export function getAge(birthDate: string, birthday: string): number {
  const today = new Date();
  const [birthYear] = birthDate.split("-").map(Number);
  const [birthMonth, birthDay] = birthday.split("-").map(Number);

  let age = today.getFullYear() - birthYear;

  // If birthday hasn't happened this year yet, subtract 1
  if (today.getMonth() + 1 < birthMonth ||
      (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay)) {
    age--;
  }

  return age;
}
