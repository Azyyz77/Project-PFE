"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  Button,
  Card,
  Chip,
  Separator,
} from "@heroui/react";
import {
  CalendarClock,
  CarFront,
  ShieldCheck,
  Wrench,
  Sparkles,
  CheckCircle2,
  Mail,
  Phone,
  MapPinIcon,
  Clock3,
  MapPin,
  MonitorSmartphone,
  ArrowRight,
} from "lucide-react";

const heroSlides = [
  {
    nom: "Chery Tiggo 8 Pro",
    slogan: "SUV familial premium",
    details: "Confort, sécurité et technologie au quotidien.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chery_Tiggo_8_Pro_009.jpg",
  },
  {
    nom: "Chery Tiggo 7 Plus",
    slogan: "Design moderne, esprit urbain",
    details: "Un SUV intelligent pour vos trajets en ville et au-delà.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chery_Tiggo_7_Plus_2023_facelift_001.jpg",
  },
  {
    nom: "Chery Arrizo 8",
    slogan: "Berline élégante et puissante",
    details: "Expérience premium et conduite dynamique.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chery_Arrizo_8_004.jpg",
  },
];

const modeles = [
  "TIGGO 7 PRO",
  "TIGGO 9X GVA",
  "TIGGO 9X UVM",
  "ARRIZO 8 SVA LUXURY",
  "ARRIZO 8 UVM COMFORT",
  "ARRIZO 8 LUXURY",
  "TIGGO 1X",];

const services = [
  {
    titre: "Prise de rendez-vous SAV",
    texte: "Sélectionnez votre date et votre atelier en quelques secondes.",    href: "/login",
    icon: CalendarClock,
    className: "md:col-span-2 bg-muted/30 border-none",
  },
  {
    titre: "Suivi de véhicule",
    texte: "Consultez l'historique et le statut de vos interventions.",    href: "/login",
    icon: CarFront,
    className: "bg-white border-border/50 shadow-sm",
  },
  {
    titre: "Assistance & sécurité",
    texte: "Un accompagnement complet par nos équipes techniques.",    href: "/login",
    icon: ShieldCheck,
    className: "bg-white border-border/50 shadow-sm",
  },
];

const metrics = [
  { label: "Disponibilité en ligne", value: "24/7", icon: Clock3 },
  { label: "Points de service", value: "+10", icon: MapPin },
  { label: "Parcours digitalisé", value: "100%", icon: MonitorSmartphone },
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    // Observe all sections
    const sections = document.querySelectorAll("[data-animate]");
    sections.forEach((section) => {
      if (observerRef.current) {
        observerRef.current.observe(section);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/90 backdrop-blur-xl shadow-sm">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              {/* Official Chery Logo - Bigger size to match title */}
              <img 
                src="/chery-logo-clean.png" 
                alt="Chery Logo" 
                className="h-20 w-auto object-contain mix-blend-darken sm:h-24"
              />
              <div>
                <p className="text-sm font-bold tracking-[0.18em] text-slate-900">CHERY SERVICE</p>
                <p className="text-[0.66rem] uppercase tracking-[0.2em] text-slate-500">Plateforme officielle SAV</p>
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#services" className="group relative py-2 transition hover:text-red-600">
              Prise de rendez-vous
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-600 transition-all duration-300 ease-out group-hover:w-full"></span>
            </a>
            <a href="#modeles" className="group relative py-2 transition hover:text-red-600">
              Top modèles Chery
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-600 transition-all duration-300 ease-out group-hover:w-full"></span>
            </a>
            <a href="#contact" className="group relative py-2 transition hover:text-red-600">
              Assistance client
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-600 transition-all duration-300 ease-out group-hover:w-full"></span>
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:border-red-600 hover:text-red-600 sm:text-sm"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-red-700 sm:text-sm"
            >
              Inscription
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section - Full Screen Background Carousel */}
      <section className="relative h-screen min-h-[700px] overflow-hidden">
        {/* Background Images */}
        {heroSlides.map((slide, index) => (
          <div
            key={slide.nom}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.nom}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-transparent" />
          </div>
        ))}

        {/* Content Overlay */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Chery Tunisia Service Experience
            </span>

            <h1 className="mt-6 text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
              Le SAV automobile
              <span className="block bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                pense pour la vitesse
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">
              Planifiez vos interventions, suivez vos dossiers et échangez avec vos équipes techniques
              depuis une interface moderne, claire et accessible sur tous vos écrans.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-red-700"
              >
                Prendre rendez-vous
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white bg-white/10 px-6 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Créer mon compte
              </Link>
            </div>

            {/* Metrics */}
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-md"
                  >
                    <Icon className="h-5 w-5 text-red-400" />
                    <p className="mt-2 text-3xl font-bold text-white">{metric.value}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-white/80">{metric.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-32 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 sm:bottom-40">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.nom}
              type="button"
              onClick={() => setActiveSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeSlide ? "w-12 bg-red-500" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Afficher ${slide.nom}`}
            />
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section 
        id="services" 
        data-animate="true"
        className={`border-y border-slate-200/80 bg-gradient-to-br from-white via-blue-50/20 to-white py-16 lg:py-20 transition-all duration-700 ease-out ${
          visibleSections.has("services") 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-12"
        }`}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-600">Services digitaux</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
            Tout votre SAV dans une expérience unifiée
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <Link
                  key={service.titre}
                  href={service.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:border-red-200 hover:shadow-xl"
                >
                  <div className="inline-flex rounded-xl bg-red-50 p-3">
                    <Icon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">{service.titre}</h3>
                  <p className="mt-2 text-sm text-slate-600">{service.texte}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-600">
                    En savoir plus
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 rounded-3xl border border-red-200 bg-gradient-to-r from-red-600 to-red-700 p-8 text-white shadow-xl">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-semibold">Besoin d&apos;une intervention rapide ?</h3>
                <p className="mt-2 text-sm text-red-100 sm:text-base">
                  Connectez-vous et programmez votre visite atelier en moins de 2 minutes.                </p>
              </div>

              <div className="hidden md:flex items-center gap-8">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Wrench className="h-5 w-5" />
                  Commencer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Models Section */}
      <section 
        id="modeles" 
        data-animate="true"
        className={`mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20 transition-all duration-700 ease-out ${
          visibleSections.has("modeles") 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-12"
        }`}
      >
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-600">Sélection commerciale</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">Top 3 des modèles les plus vendus</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
            Ces modèles représentent les meilleures ventes Chery actuellement. D&apos;autres modèles
            sont également disponibles selon le stock et le réseau.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {heroSlides.map((modele) => (
            <article
              key={modele.nom}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="relative overflow-hidden">
                <img
                  src={modele.image}
                  alt={modele.nom}
                  className="h-64 w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <span className="absolute left-4 top-4 inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-lg">
                  Top ventes
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-slate-900">{modele.nom}</h3>
                <p className="mt-2 text-sm text-slate-600">{modele.slogan}</p>
                <p className="mt-1 text-sm text-slate-500">{modele.details}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section 
        id="how-it-works"
        data-animate="true"
        className={`mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${
          visibleSections.has("how-it-works") 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-12"
        }`}
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-600">Parcours client</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Comment prendre rendez-vous ?</h3>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Créer un compte",
              "Saisir la demande",
              "Validation admin",
              "Notification & suivi",
            ].map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-red-100 bg-red-50/50 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">
                  Étape {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{step}</p>              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900 sm:grid-cols-3">
            <div className="inline-flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-5 w-5" />
              Réservation simple
            </div>
            <div className="inline-flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-5 w-5" />
              Suivi transparent
            </div>
            <div className="inline-flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-5 w-5" />
              Assistance rapide
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        id="contact" 
        data-animate="true"
        className={`border-t border-slate-200 bg-slate-900 text-white transition-all duration-700 ease-out ${
          visibleSections.has("contact") 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-12"
        }`}
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {/* Chery Tunisia */}
            <div>
              <div className="flex items-center gap-3">
                {/* Official Chery Logo - Slightly bigger */}
                <img 
                  src="/chery-logo-clean.png" 
                  alt="Chery Logo" 
                  className="h-12 w-auto object-contain mix-blend-lighten sm:h-14"
                />
                <h3 className="whitespace-nowrap text-lg font-bold tracking-wide sm:text-xl">CHERY TUNISIE</h3>
              </div>
              <p className="mt-4 text-sm text-slate-400">
                Plateforme officielle de service après-vente pour les véhicules Chery en Tunisie.
              </p>
              
              {/* Social Media */}
              <div className="mt-6 flex items-center gap-4">
                <a
                  href="https://www.facebook.com/cherytunisia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-slate-800 p-2 transition hover:bg-red-600"
                  aria-label="Facebook"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/cherytunisie/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-slate-800 p-2 transition hover:bg-red-600"
                  aria-label="Instagram"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@CMchery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-slate-800 p-2 transition hover:bg-red-600"
                  aria-label="YouTube"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/chery-tunisie-sta/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-slate-800 p-2 transition hover:bg-red-600"
                  aria-label="LinkedIn"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@chery.tunisie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-slate-800 p-2 transition hover:bg-red-600"
                  aria-label="TikTok"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>

              {/* Contact Info */}
              <div className="mt-6 space-y-3 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+216 31 390 280</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>contact@chery.tn</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPinIcon className="h-4 w-4 mt-0.5" />
                  <span>Tunis, Tunisie</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Services</h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li>
                  <a href="#services" className="transition hover:text-red-400">Prise de rendez-vous</a>
                </li>
                <li>
                  <a href="#services" className="transition hover:text-red-400">Suivi de véhicule</a>
                </li>
                <li>
                  <a href="#services" className="transition hover:text-red-400">Assistance client</a>
                </li>
                <li>
                  <Link href="/login" className="transition hover:text-red-400">Espace client</Link>
                </li>
                <li>
                  <Link href="/register" className="transition hover:text-red-400">Créer un compte</Link>
                </li>
              </ul>
            </div>

            {/* Nos Modèles */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Nos Modèles</h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                {modeles.map((modele) => (
                  <li key={modele}>
                    <a href="#modeles" className="transition hover:text-red-400">{modele}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Restez Informés */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Restez Informés</h4>
              <p className="mt-4 text-sm text-slate-400">
                Inscrivez-vous et soyez informé de nos nouveautés et promotions
              </p>
              <div className="mt-4 flex gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                />
                <button type="button" className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700" aria-label="S'inscrire à la newsletter">
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>&copy; 2026 Chery Tunisie. Tous droits réservés.</p>
            <div className="mt-2 flex flex-wrap justify-center gap-4">
              <a href="#" className="transition hover:text-red-400">Mentions légales</a>
              <a href="#" className="transition hover:text-red-400">Politique de confidentialité</a>
              <a href="#" className="transition hover:text-red-400">Conditions d&apos;utilisation</a>            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
