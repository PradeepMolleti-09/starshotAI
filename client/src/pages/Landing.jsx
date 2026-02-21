import { motion } from 'framer-motion';
import { Camera, Zap, Shield, ArrowRight, Star, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuroraBackground } from '../components/ui/aurora-background';

const Landing = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="bg-white">
            {/* Hero Section with Aurora */}
            <AuroraBackground>
                <div className="max-w-7xl mx-auto px-6 text-center z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-apple-gray/50 border border-gray-100 text-apple-blue mb-8 backdrop-blur-sm">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Next-Gen Event Photography</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-apple-black mb-8 leading-[0.9]">
                            Your Event Photos,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-apple-blue via-indigo-500 to-purple-600">Instantly Refined.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-apple-dark-gray max-w-2xl mx-auto mb-12 font-medium">
                            Experience the future of event photography. Ultra-fast AI delivery with studio-grade facial recognition.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link to="/login" className="apple-button-primary scale-110 group">
                                Create an Event
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </Link>
                            <button
                                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                                className="apple-button-secondary scale-110"
                            >
                                How it works
                            </button>
                        </div>
                    </motion.div>
                </div>
            </AuroraBackground>

            {/* Premium Features Grid */}
            <div className="max-w-7xl mx-auto px-6 mb-40 mt-20">
                <div className="text-center mb-24">
                    <span className="text-apple-blue font-black uppercase tracking-[0.3em] text-xs mb-4 block">Capabilities</span>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-apple-black mb-6">Engineered for Perfection.</h2>
                    <p className="text-xl text-apple-dark-gray max-w-2xl mx-auto font-medium">The most powerful suite of features ever built for professional event photographers.</p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {[
                        {
                            icon: <Zap className="w-8 h-8 text-yellow-500" />,
                            title: "Instant AI Matching",
                            desc: "Our neural networks process high-res photos the millisecond they're uploaded, finding faces with 99.9% accuracy."
                        },
                        {
                            icon: <Shield className="w-8 h-8 text-green-500" />,
                            title: "Privacy Guaranteed",
                            desc: "Biometric descriptors are encrypted and ephemeral. We deliver memories, not data points."
                        },
                        {
                            icon: <Camera className="w-8 h-8 text-apple-blue" />,
                            title: "Studio-Grade Gallery",
                            desc: "Beautifully responsive, high-fidelity galleries designed to showcase your work in the best possible light."
                        },
                        {
                            icon: <Sparkles className="w-8 h-8 text-purple-500" />,
                            title: "Auto-Face Discovery",
                            desc: "Guests never have to scroll. Our AI automatically populates their personal gallery as you keep shooting."
                        },
                        {
                            icon: <Users className="w-8 h-8 text-indigo-500" />,
                            title: "Unlimited Guests",
                            desc: "Whether it's a private wedding or a massive stadium concert, StarShot scales instantly to handle any crowd."
                        },
                        {
                            icon: <Star className="w-8 h-8 text-orange-500" />,
                            title: "Brand Integration",
                            desc: "Fully white-labeled experience that keeps your brand at the forefront of every guest interaction."
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className="group p-10 rounded-[48px] bg-apple-gray/30 border border-transparent hover:border-apple-blue/10 hover:bg-white hover:shadow-2xl transition-all duration-500 flex flex-col"
                        >
                            <div className="mb-8 p-6 bg-white rounded-3xl w-fit shadow-sm group-hover:shadow-lg transition-all group-hover:scale-110">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-black mb-4 text-apple-black">{feature.title}</h3>
                            <p className="text-apple-dark-gray leading-relaxed font-bold text-sm tracking-tight">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* How It Works with Premium Steps */}
            <div id="how-it-works" className="bg-apple-black py-40 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
                        <div className="max-w-xl">
                            <span className="text-blue-500 font-black uppercase tracking-[0.3em] text-xs mb-4 block">The Workflow</span>
                            <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tighter">Zero friction.<br />Pure magic.</h2>
                        </div>
                        <p className="text-zinc-400 text-xl max-w-sm font-medium">
                            Designed to be invisible. Guests get their photos without ever downloading an app.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { step: "01", title: "Scan & Sync", desc: "Guests scan a single QR code at your booth or around the venue." },
                            { step: "02", title: "The Snapshot", desc: "A simple selfie creates a unique AI descriptor for the engine." },
                            { step: "03", title: "Live Delivery", desc: "As you shoot, photos automatically appear on their customized gallery." }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="relative p-12 rounded-[48px] bg-zinc-900 border border-zinc-800"
                            >
                                <div className="text-7xl font-black text-zinc-800 absolute top-8 right-12 select-none">
                                    {step.step}
                                </div>
                                <div className="relative z-10 mt-12">
                                    <h3 className="text-3xl font-bold mb-6 text-white">{step.title}</h3>
                                    <p className="text-zinc-400 text-lg font-medium leading-relaxed">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white pt-32 pb-16 px-6 border-t border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start border-b border-gray-100 pb-20 mb-12 gap-12">
                        <div className="max-w-xs">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-apple-blue rounded-xl flex items-center justify-center text-white">
                                    <Camera className="w-6 h-6" />
                                </div>
                                <span className="font-black text-2xl tracking-tighter">StarShot AI</span>
                            </div>
                            <p className="text-apple-dark-gray font-medium leading-relaxed text-sm">
                                Empowering photographers to deliver experiences, not just files. Making every event unforgettable.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
                            <div>
                                <h4 className="font-black text-xs uppercase tracking-widest text-apple-black mb-6">Platform</h4>
                                <ul className="space-y-4 text-sm font-bold text-apple-dark-gray">
                                    <li><a href="#" className="hover:text-apple-blue transition-colors">How it works</a></li>
                                    <li><a href="#" className="hover:text-apple-blue transition-colors">Pricing</a></li>
                                    <li><a href="#" className="hover:text-apple-blue transition-colors">API</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-black text-xs uppercase tracking-widest text-apple-black mb-6">Company</h4>
                                <ul className="space-y-4 text-sm font-bold text-apple-dark-gray">
                                    <li><a href="#" className="hover:text-apple-blue transition-colors">About</a></li>
                                    <li><a href="#" className="hover:text-apple-blue transition-colors">Partners</a></li>
                                    <li><a href="#" className="hover:text-apple-blue transition-colors">Contact</a></li>
                                </ul>
                            </div>
                            <div className="hidden sm:block">
                                <h4 className="font-black text-xs uppercase tracking-widest text-apple-black mb-6">Legal</h4>
                                <ul className="space-y-4 text-sm font-bold text-apple-dark-gray">
                                    <li><a href="#" className="hover:text-apple-blue transition-colors">Privacy</a></li>
                                    <li><a href="#" className="hover:text-apple-blue transition-colors">Terms</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center text-apple-dark-gray text-xs font-black uppercase tracking-widest">
                        <div className="mb-4 md:mb-0">
                            © 2026 StarShot AI Global. All rights reserved.
                        </div>
                        <div className="flex space-x-12">
                            <span>Status: Operational</span>
                            <span>v2.4.0</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
