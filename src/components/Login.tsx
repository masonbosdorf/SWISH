import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, Loader2 } from 'lucide-react';
import courtsideLogo from '../assets/CourtSide_CS_Monogram_Negative.png';
import nikeLogo from '../assets/002_nike-logos-swoosh-white.png';
import jordanLogo from '../assets/006_nike-logos-jordan-white.png';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
            <div className="w-full flex flex-col items-center gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* Logos Row - Horizontal & Larger */}
                <div className="flex flex-row items-center justify-center gap-8">
                    <div className="w-40 flex justify-center">
                        <img
                            src={nikeLogo}
                            alt="Nike"
                            className="h-28 object-contain opacity-90"
                        />
                    </div>

                    <div className="w-px h-32 bg-zinc-800"></div>

                    <div className="w-40 flex justify-center">
                        <img
                            src={courtsideLogo}
                            alt="Courtside Melbourne"
                            className="h-24 object-contain opacity-100"
                        />
                    </div>

                    <div className="w-px h-32 bg-zinc-800"></div>

                    <div className="w-40 flex justify-center">
                        <img
                            src={jordanLogo}
                            alt="Jordan"
                            className="h-32 object-contain opacity-90"
                        />
                    </div>
                </div>

                {/* Login Form - Constrained Width */}
                <div className="w-full max-w-md bg-[#111112] border border-zinc-800 p-8 rounded-3xl shadow-xl shadow-black/50">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Internal Access</h2>
                        <p className="text-zinc-500 text-sm">Sign in to SWISH Inventory System</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                placeholder="mason@courtsidemelbourne.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-zinc-600 text-xs">
                    Authorized Personnel Only • &copy; 2024 Courtside Melbourne
                </p>
            </div>
        </div>
    );
};

export default Login;
