import { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (forgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({ title: "Email terkirim", description: "Cek email Anda untuk reset password" });
        setForgotPassword(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: "Registrasi berhasil", description: "Silakan login dengan akun Anda" });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Droplets className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">CuciKu</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin Panel</p>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {forgotPassword ? "Lupa Password" : isLogin ? "Login" : "Daftar"}
          </h2>

          <form onSubmit={handleAuth} className="space-y-3">
            {!isLogin && !forgotPassword && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nama lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  required={!isLogin}
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            {!forgotPassword && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50"
            >
              {loading ? "Memproses..." : forgotPassword ? "Kirim Link Reset" : isLogin ? "Login" : "Daftar"}
            </button>
          </form>

          <div className="mt-4 text-center space-y-2">
            {isLogin && !forgotPassword && (
              <button
                onClick={() => setForgotPassword(true)}
                className="text-xs text-primary font-medium"
              >
                Lupa password?
              </button>
            )}
            <p className="text-xs text-muted-foreground">
              {forgotPassword ? (
                <button onClick={() => setForgotPassword(false)} className="text-primary font-medium">
                  Kembali ke login
                </button>
              ) : isLogin ? (
                <>Belum punya akun?{" "}
                  <button onClick={() => setIsLogin(false)} className="text-primary font-medium">Daftar</button>
                </>
              ) : (
                <>Sudah punya akun?{" "}
                  <button onClick={() => setIsLogin(true)} className="text-primary font-medium">Login</button>
                </>
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
