"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setMessage("Settings updated!");
      setTimeout(() => setMessage(""), 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-1 px-8 pt-24">
        <div className="max-w-[600px] mx-auto">
          <Card className="bg-[#1A1A1A] border-zinc-800/50 p-8">
            <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={notifications}
                  onChange={e => setNotifications(e.target.checked)}
                  className="w-5 h-5 accent-zinc-800"
                />
                <label htmlFor="notifications" className="text-white">Enable Email Notifications</label>
              </div>
              <Button type="submit" className="bg-zinc-800 text-white" disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
              {message && <div className="text-green-400 mt-2">{message}</div>}
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
} 