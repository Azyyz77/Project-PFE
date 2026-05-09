"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  ChevronRight,
  Menu,
} from "lucide-react";

const heroSlides = [
  {
    nom: "Tiggo 8 Pro",
    slogan: "SUV Familial Haut de Gamme",
    details:
      "Le confort raffiné rencontre la sécurité moderne pour chaque trajet.",
    image:
      "https://images.unsplash.com/photo-1621235189211-13180f970635?auto=format&fit=crop&q=80&w=2000",
  },
  {
    nom: "Arrizo 8",
    slogan: "L’Art de la Berline",
    details:
      "Des lignes élégantes et des performances dynamiques pour les conducteurs exigeants.",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=2000",
  },
];

const services = [
  {
    titre: "Planification Simplifiée",
    texte:
      "Choisissez l’horaire qui correspond à votre emploi du temps dans l’atelier de votre choix.",
    href: "/login",
    icon: CalendarClock,
    className: "md:col-span-2 bg-muted/30 border-none",
  },
  {
    titre: "Historique d’Entretien",
    texte:
      "Un suivi complet de toutes les opérations de maintenance de votre véhicule.",
    href: "/login",
    icon: CarFront,
    className: "bg-white border-border/50 shadow-sm",
  },
  {
    titre: "Assistance Experte",
    texte:
      "Notre équipe technique est à votre disposition pour garantir votre tranquillité.",
    href: "/login",
    icon: ShieldCheck,
    className: "bg-white border-border/50 shadow-sm",
  },
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              <div>
                <p className="text-sm font-semibold tracking-widest text-foreground uppercase">
                  Chery Service
                </p>
                <p className="text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">
                  Tunisie
                </p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#services"
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Services
              </Link>

              <Link
                href="#fleet"
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                La Gamme
              </Link>

              <Link
                href="#assistance"
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Assistance
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:flex items-center justify-center text-xs font-semibold uppercase tracking-widest text-foreground px-6 hover:bg-muted/50 transition-colors h-11"
            >
              Connexion
            </Link>

            <Link
              href="/register"
              className="bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold uppercase tracking-widest px-8 rounded-none h-11 transition-opacity hover:opacity-90"
            >
              Rejoindre
            </Link>

            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative px-6 py-20 md:py-32 lg:py-40 max-w-7xl mx-auto overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
              <Chip
                variant="soft"
                className="bg-primary/10 text-primary border-none font-medium px-3 mb-8 gap-2"
              >
                <Sparkles size={14} />
                <span>Une Expérience de Service Raffinée</span>
              </Chip>

              <h1 className="text-5xl md:text-7xl mb-8 leading-[1.1] text-foreground">
                L’art de <br />
                <span className="text-primary italic">
                  l’entretien automobile.
                </span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl mb-12 leading-relaxed font-light">
                Un service soigneusement conçu pour votre Chery. Gérez vos
                rendez-vous, suivez l’entretien de votre véhicule et échangez
                avec nos spécialistes via une interface pensée pour la
                simplicité et le confort.
              </p>

              <div className="flex flex-wrap gap-6">
                <Link
                  href="/login"
                  className="bg-foreground text-background flex items-center justify-center px-10 rounded-none h-14 text-sm font-semibold uppercase tracking-widest transition-opacity hover:opacity-90"
                >
                  Réserver un Rendez-vous
                </Link>

                <Link
                  href="/register"
                  className="border border-border flex items-center justify-center text-foreground px-10 rounded-none h-14 text-sm font-semibold uppercase tracking-widest hover:bg-muted/50 transition-colors"
                >
                  Créer un Compte
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/5] md:aspect-square group overflow-hidden bg-muted">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.nom}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === activeSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.nom}
                    className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <div className="absolute bottom-10 left-10 text-white z-20">
                    <p className="text-xs uppercase tracking-[0.3em] font-medium opacity-80 mb-2">
                      La Collection
                    </p>

                    <h2 className="text-3xl font-serif mb-1">
                      {slide.nom}
                    </h2>

                    <p className="text-sm font-light italic">
                      {slide.slogan}
                    </p>
                  </div>
                </div>
              ))}

              {/* Slide Indicators */}
              <div className="absolute top-10 right-10 z-20 flex gap-3">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`w-12 h-[1px] transition-all ${
                      index === activeSlide ? "bg-white" : "bg-white/30"
                    }`}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section
          id="services"
          className="bg-muted/20 py-32 md:py-48 border-y border-border/30"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20">
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-primary mb-4">
                Notre Engagement
              </p>

              <h2 className="text-4xl md:text-5xl text-foreground max-w-2xl leading-tight">
                Une expérience pensée pour votre temps et votre tranquillité.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service, i) => (
                <Card
                  key={i}
                  className={`rounded-none border-none shadow-none ${service.className}`}
                >
                  <Card.Content className="p-10">
                    <div className="w-12 h-12 flex items-center justify-center bg-primary/5 text-primary mb-8">
                      <service.icon size={24} strokeWidth={1.5} />
                    </div>

                    <h3 className="text-2xl font-serif mb-4 text-foreground">
                      {service.titre}
                    </h3>

                    <p className="text-muted-foreground mb-10 leading-relaxed font-light">
                      {service.texte}
                    </p>

                    <Link
                      href={service.href}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors"
                    >
                      Découvrir <ChevronRight size={14} />
                    </Link>
                  </Card.Content>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Assistance */}
        <section
          id="assistance"
          className="py-32 md:py-48 max-w-4xl mx-auto px-6 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-primary/20 bg-primary/5 text-primary mb-12">
            <Wrench size={32} strokeWidth={1} />
          </div>

          <h2 className="text-4xl md:text-6xl mb-8 leading-tight">
            Besoin d’une assistance immédiate ?
          </h2>

          <p className="text-lg text-muted-foreground mb-12 font-light leading-relaxed">
            Notre équipe technique est disponible pour répondre à toutes vos
            questions concernant votre véhicule ou le processus de service.
          </p>

          <Link
            href="/login"
            className="bg-primary text-primary-foreground flex items-center justify-center px-12 rounded-none h-16 text-sm font-semibold uppercase tracking-widest transition-opacity hover:opacity-90"
          >
            Contacter un Expert
          </Link>
        </section>

        <Separator className="max-w-7xl mx-auto opacity-40" />

        {/* Fleet */}
        <section
          id="fleet"
          className="py-32 md:py-48 max-w-7xl mx-auto px-6"
        >
          <div className="grid lg:grid-cols-2 gap-20 items-end mb-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-primary mb-4">
                La Gamme
              </p>

              <h2 className="text-4xl md:text-5xl leading-tight">
                L’Excellence Sélectionnée
              </h2>
            </div>

            <p className="text-muted-foreground font-light leading-relaxed">
              Nous sommes spécialisés dans l’entretien des derniers modèles
              Chery afin de garantir des performances optimales grâce à des
              pièces d’origine et un savoir-faire expert.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1px bg-border border border-border overflow-hidden">
            {[
              {
                name: "Tiggo 8 Pro",
                type: "SUV Exécutif",
                img:
                  "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000",
              },
              {
                name: "Tiggo 7 Plus",
                type: "SUV Urbain",
                img:
                  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000",
              },
              {
                name: "Arrizo 8",
                type: "Berline Premium",
                img:
                  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000",
              },
            ].map((car, i) => (
              <div
                key={i}
                className="group relative aspect-[3/4] bg-background overflow-hidden"
              >
                <img
                  src={car.img}
                  alt={car.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                <div className="absolute bottom-10 left-10 text-white transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
                  <h3 className="text-2xl font-serif mb-1">
                    {car.name}
                  </h3>

                  <p className="text-xs uppercase tracking-widest font-medium opacity-80">
                    {car.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/50 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <span className="w-1.5 h-6 bg-primary rounded-full" />

                <p className="text-sm font-semibold tracking-widest text-foreground uppercase">
                  Chery Tunisie
                </p>
              </div>

              <p className="text-muted-foreground font-light leading-relaxed max-w-sm">
                La plateforme officielle de service après-vente pour les
                propriétaires Chery en Tunisie. Engagés à offrir l’excellence à
                chaque interaction.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-8">
                Navigation
              </p>

              <ul className="space-y-4">
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-light"
                  >
                    Connexion
                  </Link>
                </li>

                <li>
                  <Link
                    href="/register"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-light"
                  >
                    Inscription
                  </Link>
                </li>

                <li>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-light"
                  >
                    Récupération
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-8">
                Support
              </p>

              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-light"
                  >
                    Mentions Légales
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-light"
                  >
                    Politique de Confidentialité
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-light"
                  >
                    Contactez-nous
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="opacity-40 mb-10" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">
              © 2026 Chery Tunisie. Tous droits réservés.
            </p>

            <div className="flex gap-10">
              <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground font-medium">
                Instagram
              </span>

              <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground font-medium">
                LinkedIn
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}