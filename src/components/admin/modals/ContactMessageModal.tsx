"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ContactMessageModalProps {
  message: any | null; // expects fields: fullName, schoolName, email, phone, message, createdAt
  open: boolean;
  onClose: () => void;
}

export default function ContactMessageModal({ message, open, onClose }: ContactMessageModalProps) {
  if (!message) return null;

  const initials = message.fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}> {/* close on outside click */}
      <DialogContent className="max-w-2xl rounded-2xl border-0 p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-violet-100 via-purple-50 to-blue-100 p-6">
          <DialogTitle className="flex items-center gap-4 text-xl font-bold text-[#1E293B]">
            <Avatar className="h-10 w-10 bg-[#3B82F6]/10 text-[#3B82F6] font-bold">
              {initials}
            </Avatar>
            {message.fullName}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#64748B]">
            {message.schoolName && (
              <span className="text-[#1B9EE0] font-medium mr-2">{message.schoolName}</span>
            )}
            <span className="text-xs">Received: {new Date(message.createdAt).toLocaleString()}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <span className="font-medium text-slate-400">Email:</span>{" "}
              <a href={`mailto:${message.email}`} className="text-[#1B9EE0] hover:underline font-mono">
                {message.email}
              </a>
            </div>
            {message.phone && (
              <div>
                <span className="font-medium text-slate-400">Phone:</span>{" "}
                <span className="font-mono">{message.phone}</span>
              </div>
            )}
          </div>
          <div className="p-4 bg-white border border-slate-100 rounded-lg text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {message.message}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button
              variant="default"
              onClick={() => window.location.href = `mailto:${message.email}`}
            >
              <Mail className="h-4 w-4 mr-1" /> Reply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
