"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";

export default function ProfilePage() {
  // Placeholder user data
  const [name, setName] = useState("Rohan Sathisha");
  const [email, setEmail] = useState("rohan@example.com");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setMessage("Profile updated!");
      setTimeout(() => setMessage(""), 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-1 px-8 pt-24">
        <div className="max-w-[600px] mx-auto">
          <Card className="bg-[#1A1A1A] border-zinc-800/50 p-8">
            <h1 className="text-2xl font-bold text-white mb-6">Edit Profile</h1>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-white mb-2">Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} className="bg-[#111111] border-zinc-800 text-white" />
              </div>
              <div>
                <label className="block text-white mb-2">Email</label>
                <Input value={email} onChange={e => setEmail(e.target.value)} className="bg-[#111111] border-zinc-800 text-white" />
              </div>
              <Button type="submit" className="bg-zinc-800 text-white" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
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