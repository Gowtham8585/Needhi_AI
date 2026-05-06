import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { User, Phone, MapPin, Mail, Calendar, ShieldCheck, Briefcase, Loader2, Save, X, Edit3, Search } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingPincode, setFetchingPincode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    gender: "",
    pincode: "",
    city: "",
    district: "",
    state: ""
  });

  // Sync form state with user metadata when user loads or editing starts
  useEffect(() => {
    if (user?.user_metadata) {
      setFormData({
        full_name: user.user_metadata.full_name || "",
        phone: user.user_metadata.phone || "",
        gender: user.user_metadata.gender || "",
        pincode: user.user_metadata.pincode || "",
        city: user.user_metadata.city || "",
        district: user.user_metadata.district || "",
        state: user.user_metadata.state || ""
      });
    }
  }, [user, isEditing]);

  // Pincode Lookup logic
  useEffect(() => {
    if (isEditing && formData.pincode.length === 6) {
      const lookup = async () => {
        setFetchingPincode(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
          const data = await res.json();
          if (data[0].Status === "Success") {
            const po = data[0].PostOffice[0];
            setFormData(prev => ({
              ...prev,
              city: po.Block || po.Name,
              district: po.District,
              state: po.State
            }));
            toast.success("Location updated!");
          }
        } catch (err) {
          console.error(err);
        } finally {
          setFetchingPincode(false);
        }
      };
      lookup();
    }
  }, [formData.pincode, isEditing]);

  if (!user) return null;

  const initials = user.email ? user.email.substring(0, 2).toUpperCase() : "U";

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: formData
      });

      if (error) throw error;
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row items-center gap-8 glass-strong p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-aurora/10 blur-[100px] rounded-full -mr-32 -mt-32" />
          
          <div className="w-32 h-32 rounded-3xl bg-aurora flex items-center justify-center text-4xl font-black text-[oklch(0.15_0.04_270)] shadow-[var(--shadow-glow)] shrink-0 z-10">
            {initials}
          </div>

          <div className="text-center md:text-left z-10 space-y-2 flex-1">
            {isEditing ? (
              <input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="text-4xl font-bold tracking-tight bg-white/5 border border-white/10 rounded-xl px-4 py-1 w-full outline-none focus:border-aurora"
                placeholder="Full Name"
              />
            ) : (
              <h1 className="text-4xl font-bold tracking-tight">{user.user_metadata.full_name || "User Profile"}</h1>
            )}
            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4" /> {user.email}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
              <span className="px-3 py-1 rounded-full bg-aurora/20 text-aurora text-xs font-bold uppercase tracking-wider border border-aurora/30">
                Premium Member
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-muted-foreground text-xs font-medium border border-white/10">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* PERSONAL DETAILS */}
          <section className="glass rounded-3xl p-8 border border-white/5 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-aurora">
              <User className="w-5 h-5" /> Personal Information
            </h2>
            
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <EditField label="Phone" icon={Phone} value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} />
                  <div className="space-y-1.5 px-4 py-3 rounded-2xl bg-white/5 border border-white/5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Gender</label>
                    <select 
                      value={formData.gender} 
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full bg-transparent outline-none text-sm font-semibold"
                    >
                      <option value="Male" className="bg-background">Male</option>
                      <option value="Female" className="bg-background">Female</option>
                      <option value="Other" className="bg-background">Other</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <InfoItem icon={User} label="Gender" value={user.user_metadata.gender || "Not specified"} />
                  <InfoItem icon={Phone} label="Phone Number" value={user.user_metadata.phone || "Not specified"} />
                </>
              )}
              <InfoItem icon={Calendar} label="Last Login" value={new Date(user.last_sign_in_at || "").toLocaleString()} />
            </div>
          </section>

          {/* LOCATION DETAILS */}
          <section className="glass rounded-3xl p-8 border border-white/5 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-aurora">
              <MapPin className="w-5 h-5" /> Location Details
            </h2>
            
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div className="relative">
                    <EditField label="Pincode" icon={MapPin} value={formData.pincode} onChange={(v) => setFormData({...formData, pincode: v.replace(/\D/g, '')})} />
                    {fetchingPincode && <Loader2 className="absolute right-4 top-10 w-4 h-4 animate-spin text-aurora" />}
                  </div>
                  <EditField label="City" icon={Briefcase} value={formData.city} onChange={(v) => setFormData({...formData, city: v})} />
                  <EditField label="District" icon={ShieldCheck} value={formData.district} onChange={(v) => setFormData({...formData, district: v})} />
                  <EditField label="State" icon={MapPin} value={formData.state} onChange={(v) => setFormData({...formData, state: v})} />
                </>
              ) : (
                <>
                  <InfoItem icon={MapPin} label="Pincode" value={user.user_metadata.pincode || "Not specified"} />
                  <InfoItem icon={Briefcase} label="City / Area" value={user.user_metadata.city || "Not specified"} />
                  <InfoItem icon={ShieldCheck} label="District" value={user.user_metadata.district || "Not specified"} />
                  <InfoItem icon={MapPin} label="State" value={user.user_metadata.state || "Not specified"} />
                </>
              )}
            </div>
          </section>
        </div>

        {/* ACCOUNT STATUS / ACTIONS */}
        <footer className="glass-strong p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-lg">Account Management</h3>
            <p className="text-sm text-muted-foreground mt-1">Updates are synchronized across your devices immediately.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition font-medium text-sm flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 md:flex-none px-8 py-2.5 rounded-xl bg-aurora text-[oklch(0.15_0.04_270)] font-bold shadow-[var(--shadow-glow)] hover:scale-105 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full md:w-auto px-8 py-2.5 rounded-xl bg-aurora text-[oklch(0.15_0.04_270)] font-bold shadow-[var(--shadow-glow)] hover:scale-105 transition flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
        </footer>
      </div>
    </AppShell>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-aurora/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-aurora" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</p>
        <p className="font-semibold text-foreground/90 truncate">{value}</p>
      </div>
    </div>
  );
}

function EditField({ label, icon: Icon, value, onChange }) {
  return (
    <div className="space-y-1.5 px-4 py-3 rounded-2xl bg-white/10 border border-white/10 focus-within:border-aurora/50 transition">
      <label className="text-[10px] uppercase font-bold text-aurora/80 flex items-center gap-1.5">
        <Icon className="w-3 h-3" /> {label}
      </label>
      <input 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent outline-none text-sm font-semibold placeholder:text-muted-foreground/30"
        placeholder={`Enter ${label}`}
      />
    </div>
  );
}
