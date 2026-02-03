"use client";

import { useState, useRef } from "react";
import { fileToDataUrl, compressImage } from "@/lib/storage";

interface AddMomentFormProps {
  onAdd: (text: string, photoDataUrl?: string) => void;
  disabled?: boolean;
}

export function AddMomentForm({ onAdd, disabled = false }: AddMomentFormProps) {
  const [text, setText] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const compressed = await compressImage(dataUrl, 1200, 0.7);
      setPhotoPreview(compressed);
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAdd(text.trim(), photoPreview || undefined);
    setText("");
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearPhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (disabled) return null;

  return (
    <form onSubmit={handleSubmit} className="book-card p-4 space-y-4">
      <p className="text-sm text-midnight-soft font-body italic mb-2">
        A moment I want to keep...
      </p>

      {/* Photo upload */}
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          ref={fileInputRef}
          className="hidden"
          id="photo-upload"
        />

        {photoPreview ? (
          <div className="relative">
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-40 object-cover rounded"
            />
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute top-2 right-2 w-6 h-6 bg-midnight/70 text-parchment rounded-full text-xs hover:bg-midnight transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <label
            htmlFor="photo-upload"
            className="flex items-center justify-center h-24 border-2 border-dashed border-parchment-dark rounded cursor-pointer hover:border-gold transition-colors"
          >
            <span className="text-sm text-midnight-soft">
              {isUploading ? "Processing..." : "📷 Add a photo (optional)"}
            </span>
          </label>
        )}
      </div>

      {/* Text input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What do you want to remember?"
        className="textarea-field text-sm"
        rows={2}
      />

      {/* Submit button */}
      <button
        type="submit"
        disabled={!text.trim()}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add moment
      </button>
    </form>
  );
}
