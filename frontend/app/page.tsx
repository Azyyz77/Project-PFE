"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarClock, CarFront, ShieldCheck, Wrench, Clock3, MapPin, MonitorSmartphone } from "lucide-react";

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

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#070c14] text-white">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/15 bg-gradient-to-r from-[#081124]/96 via-[#09152a]/92 to-[#0a1221]/96 backdrop-blur-lg">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#f33e49] shadow-[0_0_12px_rgba(243,62,73,0.7)]" />
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-white">CHERY SERVICE</p>
              <p className="text-[0.66rem] uppercase tracking-[0.22em] text-white/65">Plateforme officielle de rendez-vous</p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-white/85 md:flex">
            <a href="#services" className="transition hover:text-white">
              Prise de rendez-vous
            </a>
            <a href="#modeles" className="transition hover:text-white">
              Top modeles Chery
            </a>
            <a href="#contact" className="transition hover:text-white">
              Assistance client
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/10 sm:text-sm"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#f33e49] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#ff5a65] sm:text-sm"
            >
              Inscription
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative min-h-screen overflow-hidden pt-16">
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

        <div className="absolute inset-0 bg-[#081423]/55" />

        <div className="relative z-20 mx-auto flex min-h-[68vh] w-full max-w-[1600px] items-end justify-center px-4 pb-10 text-center sm:px-6 lg:px-10">
          <div>
            <p className="text-5xl font-medium leading-tight text-white sm:text-6xl lg:text-7xl">
              {heroSlides[activeSlide].nom}
            </p>
            <p className="mt-3 text-3xl text-white/90 sm:text-4xl">{heroSlides[activeSlide].slogan}</p>
            <p className="mt-4 text-lg text-white/80 sm:text-2xl">{heroSlides[activeSlide].details}</p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-white px-6 py-3 text-xl font-medium text-black transition hover:bg-white/90"
              >
                Prendre rendez-vous
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.nom}
                  onClick={() => setActiveSlide(index)}
                  className={`h-1.5 w-10 transition ${
                    index === activeSlide ? "bg-white" : "bg-white/45 hover:bg-white/70"
                  }`}
                  aria-label={`Afficher ${slide.nom}`}
                />
              ))}
            </div>
          </div>
        </div>

      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#0c1424] via-[#101b31] to-[#0b1323] p-6 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full bg-[#1c4a9f]/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 -bottom-20 h-72 w-72 rounded-full bg-[#f33e49]/16 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">Disponibilite service</p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">Experience rendez-vous premium</h2>
              <p className="mt-3 text-sm text-white/75 sm:text-base">
                Reservation simple, reponse rapide et suivi digital complet pour chaque intervention.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="group rounded-2xl border border-white/15 bg-[#0a1323]/80 p-4 transition hover:-translate-y-0.5 hover:border-[#ff6b74]/60">
                  <Clock3 className="h-5 w-5 text-[#ff9098]" />
                  <p className="mt-2 text-3xl font-bold text-white">24/7</p>
                  <p className="mt-1 text-sm text-white/75">Rendez-vous en ligne</p>
                </div>
                <div className="group rounded-2xl border border-white/15 bg-[#0a1323]/80 p-4 transition hover:-translate-y-0.5 hover:border-[#ff6b74]/60">
                  <MapPin className="h-5 w-5 text-[#ff9098]" />
                  <p className="mt-2 text-3xl font-bold text-white">+10</p>
                  <p className="mt-1 text-sm text-white/75">Points de service</p>
                </div>
                <div className="group rounded-2xl border border-white/15 bg-[#0a1323]/80 p-4 transition hover:-translate-y-0.5 hover:border-[#ff6b74]/60">
                  <MonitorSmartphone className="h-5 w-5 text-[#ff9098]" />
                  <p className="mt-2 text-3xl font-bold text-white">100%</p>
                  <p className="mt-1 text-sm text-white/75">Suivi digitalise</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">Parcours client</p>
              <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">Comment prendre rendez-vous ?</h3>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/15 bg-[#0a1323]/75 p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#ff8f97]">Etape 01</p>
                  <p className="mt-1 text-base font-semibold">Creer un compte</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-[#0a1323]/75 p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#ff8f97]">Etape 02</p>
                  <p className="mt-1 text-base font-semibold">Saisir la demande</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-[#0a1323]/75 p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#ff8f97]">Etape 03</p>
                  <p className="mt-1 text-base font-semibold">Validation admin</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-[#0a1323]/75 p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#ff8f97]">Etape 04</p>
                  <p className="mt-1 text-base font-semibold">Notification & suivi</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-full bg-[#f33e49] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#ff5e68]"
                >
                  Creer mon compte
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/10"
                >
                  Deja inscrit ? Connexion
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="modeles" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Selection commerciale</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Top 3 des modeles les plus vendus</h2>
            <p className="mt-3 max-w-2xl text-sm text-white/75 sm:text-base">
              Ces trois vehicules representent les meilleures ventes Chery actuellement. D'autres modeles
              sont egalement disponibles selon le stock et le reseau.
            </p>
          </div>
          <Link
            href="/register"
            className="hidden rounded-full border border-white/30 px-5 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/10 md:inline-flex"
          >
            Creer un compte
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {modeles.map((modele) => (
            <article
              key={modele.nom}
              className="group relative overflow-hidden rounded-3xl border border-white/15 bg-[#0b121f]"
            >
              <img
                src={modele.image}
                alt={modele.nom}
                className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060a12] via-[#060a12]/45 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="mb-3 inline-flex rounded-full border border-white/30 bg-black/35 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-white/90">
                  Top ventes
                </span>
                <h3 className="text-2xl font-semibold">{modele.nom}</h3>
                <p className="mt-2 text-sm text-white/80">{modele.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="services" className="border-y border-white/10 bg-[#0a101b] py-16 lg:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Services digitaux</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Tout votre SAV sur une seule plateforme</h2>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <Link
                  key={service.titre}
                  href={service.href}
                  className="group rounded-2xl border border-white/15 bg-black/20 p-6 transition hover:border-[#f33e49]/70 hover:bg-[#111b2c]"
                >
                  <Icon className="h-6 w-6 text-[#ff8a92]" />
                  <h3 className="mt-4 text-xl font-semibold">{service.titre}</h3>
                  <p className="mt-2 text-sm text-white/75">{service.texte}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#ff9aa1]">
                    En savoir plus
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 rounded-3xl border border-white/15 bg-gradient-to-r from-[#111b2c] to-[#0f1524] p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-semibold">Besoin d'une intervention rapide ?</h3>
                <p className="mt-2 text-white/80">
                  Connectez-vous et programmez votre visite atelier en moins de 2 minutes.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f33e49] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#ff5e68]"
              >
                <Wrench className="h-4 w-4" />
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-7 border-t border-white/10 pt-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-lg font-semibold">CHERY TUNISIE - Service Client</p>
            <p className="mt-2 max-w-md text-sm text-white/70">
              Plateforme de reservation et de suivi des rendez-vous SAV pour nos clients.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/login" className="text-white/75 hover:text-white">
              Connexion
            </Link>
            <Link href="/register" className="text-white/75 hover:text-white">
              Inscription
            </Link>
            <Link href="/forgot-password" className="text-white/75 hover:text-white">
              Mot de passe oublie
            </Link>
            <a href="#" className="text-white/75 hover:text-white">
              Mentions legales
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
           