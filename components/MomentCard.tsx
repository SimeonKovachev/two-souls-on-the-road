"use client";

import { useState } from "react";
import { Moment, Author } from "@/lib/types";
import { Flower2, Moon, Star, Edit, Trash2 } from "lucide-react";
import { Button } from "./ui";

interface MomentCardProps {
  moment: Moment;
  onDelete?: () => void;
  onUpdate?: (text: string) => void;
  onToggleFavorite?: () => void;
  disabled?: boolean;
}

function AuthorIcon({ author }: { author: Author }) {
  const Icon = author === "ива" ? Flower2 : Moon;
  return <Icon className="w-3 h-3" />;
}

export function MomentCard({ moment, onDelete, onUpdate, onToggleFavorite, disabled = false }: MomentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(moment.text);

  const handleSave = () => {
    if (editText.trim() && onUpdate) {
      onUpdate(editText.trim());
    }
    setIsEditing(false);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="book-card book-spine p-4 pl-6 animate-fade-in">
      {moment.photoDataUrl && (
        <div className="mb-3 -mx-2">
          <img
            src={moment.photoDataUrl}
            alt="Moment"
            className="w-full h-48 object-cover rounded"
            style={{
              boxShadow: "inset 0 0 20px rgba(0,0,0,0.1)",
            }}
          />
        </div>
      )}

      {isEditing && !disabled ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="textarea-field text-sm"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditText(moment.text);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="font-body text-midnight leading-relaxed italic">
          &ldquo;{moment.text}&rdquo;
        </p>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-parchment-dark">
        <div className="flex items-center gap-2">
          <span className="text-xs text-midnight-soft">
            {formatTime(moment.createdAt)}
          </span>
          {moment.author && (
            <span className="text-xs bg-parchment-dark px-1.5 py-0.5 rounded inline-flex items-center">
              <AuthorIcon author={moment.author} />
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className={`transition-all hover:scale-110 ${
                moment.isFavorite ? "text-yellow-500" : "text-silver-light hover:text-yellow-400"
              }`}
              title={moment.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={`w-4 h-4 ${moment.isFavorite ? "fill-current" : ""}`} />
            </button>
          )}

          {!disabled && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-plum hover:text-plum-light transition-colors p-1"
              >
                <Edit className="w-4 h-4" />
              </button>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="text-red-700 hover:text-red-800 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
