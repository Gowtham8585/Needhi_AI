import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Scale, Loader2, ArrowRight, User, Phone, MapPin, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setStateName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const navigate = useNavigate();

  // Automatic Pincode Lookup
  useEffect(() => {
    if (pincode.length === 6) {
      const lookupPincode = async () => {
        setFetchingPincode(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
          const data = await res.json();
          if (data[0].Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            setCity(postOffice.Block || postOffice.Name);
            setDistrict(postOffice.District);
            setStateName(postOffice.State);
            toast.success("Location identified!");
          } else {
            toast.error("Invalid Pincode");
          }
        } catch (err) {
          console.error("Pincode error:", err);
        } finally {
          setFetchingPincode(false);
        }
      };
      lookupPincode();
    }
  }, [pincode]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: fullName,
            phone: phone,
            gender: gender,
            city,
            district,
            state,
            pincode
          }
        }
      });

      if (error) {
        toast.error(error.message || "Signup failed");
      } else if (data.user) {
        if (data.session) {
          toast.success("Account created and logged in!");
          navigate({ to: "/dashboard" });
        } else {
          toast.success("Verification email sent! Please check your inbox.");
          navigate({ to: "/login" });
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from)_0%,_transparent_50%),radial-gradient(circle_at_bottom_left,_var(--tw-gradient-to)_0%,_transparent_50%)] from-aurora/10 to-transparent relative overflow-y-auto">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-aurora flex items-center justify-center shadow-[var(--shadow-glow)] mb-4">
            <Scale className="w-6 h-6 text-[oklch(0.15_0.04_270)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm text-center">Enter your details to personalize your Needhi_AI experience</p>
        </div>

        <div className="glass-strong rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-aurora/80 mb-2">Basic Information</h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-aurora/50 focus:ring-2 focus:ring-aurora/20 outline-none transition text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-aurora/50 focus:ring-2 focus:ring-aurora/20 outline-none transition text-sm"
                    placeholder="name@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-aurora/50 focus:ring-2 focus:ring-aurora/20 outline-none transition text-sm"
                    placeholder="••••••••"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-aurora/50 focus:ring-2 focus:ring-aurora/20 outline-none transition text-sm"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground ml-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-aurora/50 focus:ring-2 focus:ring-aurora/20 outline-none transition text-sm appearance-none"
                    >
                      <option value="" className="bg-background">Select</option>
                      <option value="Male" className="bg-background">Male</option>
                      <option value="Female" className="bg-background">Female</option>
                      <option value="Other" className="bg-background">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-aurora/80 mb-2">Location (Auto-fetch)</h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Pincode</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-aurora/50 focus:ring-2 focus:ring-aurora/20 outline-none transition text-sm font-mono tracking-widest"
                      placeholder="600001"
                    />
                    {fetchingPincode && <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-aurora" />}
                    {!fetchingPincode && pincode.length === 6 && <Search className="absolute right-3 top-3 w-4 h-4 text-aurora" />}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">City / Area</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    readOnly={!!city && pincode.length === 6}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-aurora/50 focus:ring-2 focus:ring-aurora/20 outline-none transition text-sm disabled:opacity-50"
                    placeholder="Chennai"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                    readOnly={!!district && pincode.length === 6}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-aurora/50 focus:ring-2 focus:ring-aurora/20 outline-none transition text-sm disabled:opacity-50"
                    placeholder="Chennai District"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setStateName(e.target.value)}
                    required
                    readOnly={!!state && pincode.length === 6}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-aurora/50 focus:ring-2 focus:ring-aurora/20 outline-none transition text-sm disabled:opacity-50"
                    placeholder="Tamil Nadu"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 rounded-xl bg-aurora text-[oklch(0.15_0.04_270)] font-bold flex items-center justify-center gap-2 shadow-[var(--shadow-glow)] hover:scale-[1.01] transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-aurora font-medium hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
