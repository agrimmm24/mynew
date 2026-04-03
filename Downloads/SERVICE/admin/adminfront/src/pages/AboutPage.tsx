import {
    Wrench,
    Shield,
    Clock,
    Users,
    Award,
    Target,
    Heart,
    Car
} from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-transparent text-white font-sans overflow-x-hidden selection:bg-red-600/30">
            <div className="max-w-7xl mx-auto px-6 py-20 divide-y divide-gray-800/50 space-y-32">

                {/* Section 1: Introduction */}
                <section className="text-center animate-slide-up-fade">
                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter hover:scale-[1.02] transition-transform duration-500 cursor-default uppercase">
                        ABOUT <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.3)] animate-pulse-soft">SERVSYNC</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed max-w-3xl mx-auto italic opacity-0 animate-slide-up-fade [animation-delay:200ms]">
                        At ServSync, we believe that vehicle servicing and roadside assistance should be simple, transparent, and stress-free.
                        Our startup was born out of a common problem — the hassle people face when their vehicle breaks down or when they simply don't have the time to visit a service center.
                    </p>
                </section>

                {/* Section 2: Our Story & Stats */}
                <section className="pt-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="opacity-0 animate-slide-up-fade [animation-delay:400ms]">
                        <h2 className="text-4xl font-black mb-8 border-l-4 border-red-600 pl-6 uppercase tracking-tight">Our Story</h2>
                        <div className="space-y-6 text-gray-400 font-medium leading-relaxed">
                            <p>
                                Whether you're stranded on a highway with a damaged vehicle or caught up in a busy workday with no time for servicing, we're here to help.
                                We act as a reliable bridge between vehicle owners and verified service providers, offering everything from emergency towing to routine maintenance.
                            </p>
                            <p>
                                By combining technology with a network of reliable service partners, we ensure that your vehicle gets the attention it needs—when you need it.
                                With ServSync, you'll never miss a service again.
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mt-12">
                            <StatCard value="24/7" label="Emergency Support" delay="[animation-delay:600ms]" />
                            <StatCard value="500+" label="Certified Providers" delay="[animation-delay:700ms]" />
                            <StatCard value="10K+" label="Happy Customers" delay="[animation-delay:800ms]" />
                            <StatCard value="15min" label="Avg Response Time" delay="[animation-delay:900ms]" />
                        </div>
                    </div>

                    <div className="relative opacity-0 animate-slide-up-fade [animation-delay:500ms]">
                        <div className="bg-gradient-to-br from-red-600/20 to-transparent p-1 rounded-[3rem] animate-float">
                            <div className="bg-gray-900/60 backdrop-blur-2xl rounded-[2.8rem] p-10 border border-gray-800 shadow-2xl overflow-hidden relative group glass-glow">
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-gray-800 group-hover:border-red-600/30 transition-all hover-lift">
                                        <Car className="text-red-600 animate-pulse-soft" size={32} />
                                        <div>
                                            <h4 className="font-bold text-white">Engine Service</h4>
                                            <p className="text-xs text-gray-500 uppercase font-black">Performance Tuned</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-gray-800 group-hover:border-red-600/30 transition-all self-end w-4/5 hover-lift">
                                        <Wrench className="text-red-500" size={32} />
                                        <div>
                                            <h4 className="font-bold text-white">Quick Fix</h4>
                                            <p className="text-xs text-gray-500 uppercase font-black">Under 30 Mins</p>
                                        </div>
                                    </div>
                                    <div className="bg-red-600/10 border border-red-600/20 py-4 px-6 rounded-2xl text-center group-hover:bg-red-600/20 transition-colors">
                                        <span className="text-red-500 font-black text-sm uppercase tracking-widest animate-pulse">24/7 Service Available</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Our Values */}
                <section className="pt-32 text-center">
                    <div className="opacity-0 animate-slide-up-fade [animation-delay:600ms]">
                        <h2 className="text-4xl font-black mb-6 uppercase tracking-widest">Our Values</h2>
                        <p className="text-gray-500 font-medium max-w-2xl mx-auto mb-16 leading-relaxed capitalize">
                            These core principles guide everything we do, from service delivery to customer support and technology development.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ValueCard icon={<Shield />} title="Safety First" desc="Every service prioritizes your safety and vehicle security" delay="[animation-delay:100ms]" />
                        <ValueCard icon={<Users />} title="Expert Team" desc="Certified professionals with years of experience" active delay="[animation-delay:200ms]" />
                        <ValueCard icon={<Clock />} title="Reliability" desc="24/7 availability when you need us most" delay="[animation-delay:300ms]" />
                        <ValueCard icon={<Award />} title="Quality Service" desc="Commitment to excellence in every interaction" delay="[animation-delay:400ms]" />
                        <ValueCard icon={<Target />} title="Precision" desc="Accurate diagnostics and efficient solutions" delay="[animation-delay:500ms]" />
                        <ValueCard icon={<Heart />} title="Customer Care" desc="Your satisfaction is our top priority" delay="[animation-delay:600ms]" />
                    </div>
                </section>

                {/* Section 4: Teams Section */}
                <section className="pt-32 text-center opacity-0 animate-slide-up-fade [animation-delay:800ms]">
                    <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">Built for Convenience, Delivered with Trust</h2>
                    <p className="text-gray-400 font-medium max-w-3xl mx-auto mb-20 leading-loose lowercase italic first-letter:uppercase">
                        Our team combines automotive industry expertise with cutting-edge technology to create a seamless experience.
                        We understand the urgency of roadside assistance and the importance of reliable vehicle servicing in your busy life.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
                        <TeamCard
                            title="Engineering Team"
                            desc="Building robust, scalable solutions that work when you need them most"
                        />
                        <TeamCard
                            title="Operations Team"
                            desc="Ensuring quality service delivery and provider certification"
                        />
                        <TeamCard
                            title="Support Team"
                            desc="24/7 customer care to assist you every step of the way"
                        />
                    </div>
                </section>

            </div>

            {/* Footer Decoration */}
            <footer className="py-20 text-center border-t border-gray-900 mt-20">
                <div className="flex items-center justify-center gap-3 opacity-30 animate-pulse-soft">
                    <div className="w-10 h-0.5 bg-red-600 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">ServSync Systems 2026</span>
                    <div className="w-10 h-0.5 bg-red-600 rounded-full"></div>
                </div>
            </footer>
        </div>
    );
}

function StatCard({ value, label, delay }: { value: string, label: string, delay?: string }) {
    return (
        <div className={`bg-gray-900/40 p-6 rounded-2xl border border-gray-800 hover:border-red-600/30 transition-all group hover-lift opacity-0 animate-slide-up-fade ${delay}`}>
            <h3 className="text-3xl font-black text-red-600 mb-1 group-hover:scale-110 transition-transform origin-left">{value}</h3>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-tight">{label}</p>
        </div>
    );
}

function ValueCard({ icon, title, desc, active, delay }: { icon: any, title: string, desc: string, active?: boolean, delay?: string }) {
    return (
        <div className={`p-10 rounded-[2.5rem] text-left border transition-all duration-500 group flex flex-col items-start gap-6 h-full glass-glow hover-lift opacity-0 animate-slide-up-fade ${delay} ${active ? 'bg-gray-900 border-red-600/50 shadow-[0_0_30px_rgba(220,38,38,0.1)]' : 'bg-gray-900/40 border-gray-800 hover:border-red-600/30 shadow-2xl'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-red-600 text-white animate-float' : 'bg-red-600/10 text-red-600 group-hover:bg-red-600 group-hover:text-white shadow-inner animate-float-delayed'}`}>
                {icon}
            </div>
            <div>
                <h4 className="text-white text-xl font-bold mb-3 tracking-tight group-hover:text-red-500 transition-colors uppercase italic">{title}</h4>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function TeamCard({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="bg-gray-900/40 p-10 rounded-[2.5rem] border border-gray-800 hover:border-red-600/30 transition-all group shadow-2xl h-full flex flex-col items-center text-center hover-lift glass-glow">
            <h4 className="text-white text-lg font-bold mb-4 tracking-wider uppercase group-hover:text-red-600 transition-colors">{title}</h4>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">{desc}</p>
        </div>
    );
}
