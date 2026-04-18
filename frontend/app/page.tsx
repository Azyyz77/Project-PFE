"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CarFront,
  ShieldCheck,
  Wrench,
  Clock3,
  MapPin,
  MonitorSmartphone,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const heroSlides = [
  {
    nom: "Chery Tiggo 8 Pro",
    slogan: "SUV familial premium",
    details: "Confort, securite et technologie au quotidien.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chery_Tiggo_8_Pro_009.jpg",
  },
  {
    nom: "Chery Tiggo 7 Plus",
    slogan: "Design moderne, esprit urbain",
    details: "Un SUV intelligent pour vos trajets en ville et au-dela.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chery_Tiggo_7_Plus_2023_facelift_001.jpg",
  },
  {
    nom: "Chery Arrizo 8",
    slogan: "Berline elegante et puissante",
    details: "Experience premium et conduite dynamique.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chery_Arrizo_8_004.jpg",
  },
];

const modeles = [
  {
    nom: "Tiggo 8 Pro",
    description: "SUV familial premium, ideal pour les longs trajets et la vie quotidienne.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chery_Tiggo_8_Pro_005.jpg",
  },
  {
    nom: "Tiggo 7 Plus",
    description: "Confort intelligent, design moderne et technologie embarquee avancee.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chery_Tiggo_7_Plus_2023_facelift_001.jpg",
  },
  {
    nom: "Arrizo 8",
    description: "Berline elegante orientee performance, securite et experience premium.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chery_Arrizo_8_004.jpg",
  },
];

const services = [
  {
    titre: "Prise de rendez-vous SAV",
    texte: "Selectionnez votre date et votre atelier en quelques secondes.",
    href: "/login",
    icon: CalendarClock,
  },
  {
    titre: "Suivi de vehicule",
    texte: "Consultez l'historique et le statut de vos interventions.",
    href: "/login",
    icon: CarFront,
  },
  {
    titre: "Assistance & securite",
    texte: "Un accompagnement complet par nos equipes techniques.",
    href: "/login",
    icon: ShieldCheck,
  },
];

const metrics = [
  { label: "Disponibilite en ligne", value: "24/7", icon: Clock3 },
  { label: "Points de service", value: "+10", icon: MapPin },
  { label: "Parcours digitalise", value: "100%", icon: MonitorSmartphone },
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:46px_46px]" />

      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.55)]" />
            <div>
              <p className="text-sm font-bold tracking-[0.18em] text-slate-900">CHERY SERVICE</p>
              <p className="text-[0.66rem] uppercase tracking-[0.2em] text-slate-500">Plateforme officielle SAV</p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#services" className="transition hover:text-slate-900">Prise de rendez-vous</a>
            <a href="#modeles" className="transition hover:text-slate-900">Top modeles Chery</a>
            <a href="#contact" className="transition hover:text-slate-900">Assistance client</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 sm:text-sm"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-slate-800 sm:text-sm"
            >
              Inscription
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:px-8 lg:pb-16 lg:pt-14">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-rose-600">
            <Sparkles className="h-3.5 w-3.5" />
            Chery Tunisia Service Experience
          </span>

          <h1 className="mt-5 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Le SAV automobile
            <span className="block bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              pense pour la vitesse
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Planifiez vos interventions, suivez vos dossiers et echangez avec vos equipes techniques
            depuis une interface moderne, claire et accessible sur tous vos ecrans.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Prendre rendez-vous
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            >
              Creer mon compte
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]"
                >
                  <Icon className="h-4 w-4 text-rose-500" />
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{metric.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            {heroSlides.map((slide, index) => (
              <img
                key={slide.nom}
                src={slide.image}
                alt={slide.nom}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                  index === activeSlide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/25 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-white/75">Modele phare</p>
              <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">{heroSlides[activeSlide].nom}</h2>
              <p className="mt-1 text-sm text-white/80">{heroSlides[activeSlide].slogan}</p>
              <p className="mt-2 text-sm text-white/85">{heroSlides[activeSlide].details}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 px-1">
            <div className="flex items-center gap-2">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.nom}
                  onClick={() => setActiveSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === activeSlide ? "w-8 bg-rose-500" : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Afficher ${slide.nom}`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-slate-500">Slide {activeSlide + 1}/3</span>
          </div>
        </div>
      </section>

      <section id="services" className="border-y border-slate-200/80 bg-white py-14 lg:py-18">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Services digitaux</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
            Tout votre SAV dans une experience unifiee
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <Link
                  key={service.titre}
                  href={service.href}
                  className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-6 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
                >
                  <Icon className="h-6 w-6 text-rose-500" />
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">{service.titre}</h3>
                  <p className="mt-2 text-sm text-slate-600">{service.texte}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                    En savoir plus
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-semibold">Besoin d&apos;une intervention rapide ?</h3>
                <p className="mt-2 text-sm text-slate-300 sm:text-base">
                  Connectez-vous et programmez votre visite atelier en moins de 2 minutes.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                <Wrench className="h-4 w-4" />
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="modeles" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Selection commerciale</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">Top 3 des modeles les plus vendus</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Ces modeles representent les meilleures ventes Chery actuellement. D&apos;autres modeles
              sont egalement disponibles selon le stock et le reseau.
            </p>
          </div>
          <Link
            href="/register"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
          >
            Creer un compte
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {modeles.map((modele) => (
            <article
              key={modele.nom}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.07)]"
            >
              <div className="relative overflow-hidden">
                <img
                  src={modele.image}
                  alt={modele.nom}
                  className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 inline-flex rounded-full bg-slate-950/85 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-white">
                  Top ventes
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-2xl font-semibold text-slate-900">{modele.nom}</h3>
                <p className="mt-2 text-sm text-slate-600">{modele.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Parcours client</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Comment prendre rendez-vous ?</h3>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Creer un compte",
              "Saisir la demande",
              "Validation admin",
              "Notification & suivi",
            ].map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-rose-600">
                  Etape {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 sm:grid-cols-3 sm:items-center">
            <div className="inline-flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              Reservation simple
            </div>
            <div className="inline-flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              Suivi transparent
            </div>
            <div className="inline-flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              Assistance rapide
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="border-t border-slate-200 bg-white/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="text-lg font-semibold text-slate-900">CHERY TUNISIE - Service Client</p>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              Plateforme de reservation et de suivi des rendez-vous SAV pour nos clients.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
            <Link href="/login" className="transition hover:text-slate-900">Connexion</Link>
            <Link href="/register" className="transition hover:text-slate-900">Inscription</Link>
            <Link href="/forgot-password" className="transition hover:text-slate-900">Mot de passe oublie</Link>
            <a href="#" className="transition hover:text-slate-900">Mentions legales</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
