/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  ShoppingBag, 
  Ruler, 
  ChevronRight, 
  ShieldCheck, 
  Heart, 
  Search, 
  Compass, 
  HelpCircle, 
  Instagram, 
  Facebook, 
  MapPin, 
  ArrowUpRight,
  Sparkles,
  Info,
  Check,
  Mail,
  Menu,
  X
} from "lucide-react";

import { Logo, MiniLogo } from "./components/Logo";
import { SizeGuideModal } from "./components/SizeGuideModal";
import { CartDrawer } from "./components/CartDrawer";
import { ProductDetailDrawer } from "./components/ProductDetailDrawer";
import { CheckoutSection } from "./components/CheckoutSection";
import { OrderSuccessState } from "./components/OrderSuccessState";
import { OrderTracking } from "./components/OrderTracking";
import { NewsletterSection } from "./components/NewsletterSection";

import { PRODUCTS, BRAND_VALUES, IMAGES, SIZE_TABLE, formatPrice } from "./data";
import { Product, CartItem, ProductColor, Order } from "./types";
import { 
  initMetaPixel, 
  trackPageView, 
  trackAddToCart, 
  trackViewContent,
  trackInitiateCheckout,
  trackPurchase
} from "./lib/metaPixel";

export default function App() {
  // Navigation & Cart States
  const [view, setView] = useState<"home" | "checkout" | "success" | "tracking">("home");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Single product home-customization states
  const singleProduct = PRODUCTS[0];
  const [homeColor, setHomeColor] = useState<ProductColor>(PRODUCTS[0].colors[0]);
  const [homeActiveImageIndex, setHomeActiveImageIndex] = useState(0);
  const [homeSize, setHomeSize] = useState<string>("");
  const [homeActiveTab, setHomeActiveTab] = useState<"details" | "fabric" | "shipping">("details");
  const [homeAdded, setHomeAdded] = useState(false);
  const [homeSizeError, setHomeSizeError] = useState(false);
  const [homeQty, setHomeQty] = useState<number>(1);

  // Selected Product detail drawer state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Initialize Meta Pixel on mount
  useEffect(() => {
    initMetaPixel();
  }, []);

  // Track ViewContent on view change or detail drawer opening
  useEffect(() => {
    if (view === "home") {
      trackViewContent(singleProduct.name, singleProduct.id, 15990, "AOA");
    }
  }, [view]);

  useEffect(() => {
    if (isDetailOpen && selectedProduct) {
      trackViewContent(selectedProduct.name, selectedProduct.id, 15990, "AOA");
    }
  }, [isDetailOpen, selectedProduct]);

  useEffect(() => {
    setHomeActiveImageIndex(0);
  }, [homeColor]);

  // Successfully placed order reference
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Track scroll position to transition the header from transparent overlay to sticky white
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % IMAGES.heroImages.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Reference for scrolling to tracking or catalog
  const catalogRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const trackingSectionRef = useRef<HTMLDivElement>(null);

  // Quick helper to scroll
  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Sync URL hash with the view state (Client-side Routing)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#/checkout") {
        setView("checkout");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (hash === "#/rastrear" || hash === "#/rastrear-pedido") {
        setView("tracking");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (hash === "#/sucesso" || hash === "#/success") {
        setView("success");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (hash === "#/camiseta") {
        setView("home");
        setTimeout(() => {
          scrollTo(catalogRef);
        }, 150);
      } else if (hash === "#/filosofia") {
        setView("home");
        setTimeout(() => {
          scrollTo(infoRef);
        }, 150);
      } else if (hash === "#/" || hash === "" || hash === "#") {
        setView("home");
      }
      trackPageView();
    };

    window.addEventListener("hashchange", handleHashChange);
    // Initial sync
    handleHashChange();

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Update URL hash when state view changes
  useEffect(() => {
    const currentHash = window.location.hash;
    if (view === "checkout" && currentHash !== "#/checkout") {
      window.location.hash = "/checkout";
    } else if (view === "tracking" && currentHash !== "#/rastrear" && currentHash !== "#/rastrear-pedido") {
      window.location.hash = "/rastrear";
    } else if (view === "success" && currentHash !== "#/sucesso" && currentHash !== "#/success") {
      window.location.hash = "/sucesso";
    } else if (view === "home") {
      if (
        currentHash !== "#/camiseta" && 
        currentHash !== "#/filosofia" && 
        currentHash !== "#/" && 
        currentHash !== ""
      ) {
        window.location.hash = "/";
      }
    }
  }, [view]);

  // Cart Handlers
  const handleAddToCart = (product: Product, color: ProductColor, size: string, quantity: number = 1) => {
    const itemId = `${product.id}-${color.id}-${size}`;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { id: itemId, product, selectedColor: color, selectedSize: size, quantity }];
    });
    trackAddToCart(product.name, product.id, 15990 * quantity, "AOA");
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Favorite toggle helper
  const toggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleOrderComplete = (order: Order) => {
    setCompletedOrder(order);
    // Track purchase with Meta Pixel before clearing the cart
    trackPurchase(order.total, "AOA", order.id, order.items.length, order.customerInfo);
    setCartItems([]); // flush cart
    setView("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col justify-between" id="nuva-app-root">
      
      {/* 2. Fixed Transparent/Solid Header Navbar / Signature Block */}
      <header 
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 ease-in-out ${
          view === "home" && !isScrolled
            ? "bg-transparent border-transparent py-4 text-white"
            : "bg-white border-b border-neutral-100 shadow-md py-2 text-black"
        }`} 
        id="main-header"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex md:grid md:grid-cols-3 items-center justify-between">
          
          {/* Logo Signature - Left Corner */}
          <div className="cursor-pointer flex justify-start" onClick={() => { window.location.hash = "/"; }} id="brand-logo-container">
            <Logo className={`h-7 sm:h-8 transition-all duration-500 ${view === "home" && !isScrolled ? "invert brightness-200" : "text-black"}`} />
          </div>

          {/* Menu links - Centered */}
          <nav className={`hidden md:flex items-center justify-center space-x-8 text-[11px] lowercase tracking-[0.2em] font-medium transition-colors duration-500 ${
            view === "home" && !isScrolled ? "text-white" : "text-black/80 hover:text-black"
          }`}>
            <button 
              type="button" 
              onClick={() => { window.location.hash = "/camiseta"; }} 
              className="hover:opacity-70 transition-all font-semibold cursor-pointer"
            >
              a camiseta
            </button>
            <button 
              type="button" 
              onClick={() => { window.location.hash = "/filosofia"; }} 
              className="hover:opacity-70 transition-all font-semibold cursor-pointer"
            >
              filosofia
            </button>
            <button 
              type="button" 
              onClick={() => { window.location.hash = "/rastrear"; }} 
              className="hover:opacity-70 transition-all font-semibold cursor-pointer"
            >
              rastrear pedido
            </button>
          </nav>

          {/* Actions & Utilities - Right */}
          <div className="flex items-center justify-end space-x-1 sm:space-x-2 md:space-x-6">
            {/* Sizing Link for Mobile removed or handled */}

            {/* Shopping cart trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative p-2 transition-all duration-300 flex items-center gap-2 ${
                view === "home" && !isScrolled ? "text-white hover:opacity-60" : "text-black hover:bg-neutral-50 rounded"
              }`}
              id="header-cart-trigger"
            >
              <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
              {cartItems.length > 0 && (
                <span className={`absolute -top-1 -right-1 text-[9px] font-mono font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse transition-colors duration-500 ${
                  view === "home" && !isScrolled ? "bg-white text-black" : "bg-black text-white"
                }`}>
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Hamburger menu for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 transition-all duration-300 rounded ${
                view === "home" && !isScrolled ? "text-white hover:opacity-60" : "text-black hover:bg-neutral-50"
              }`}
              aria-label="Menu"
              id="mobile-hamburger-trigger"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5 stroke-[1.5]" /> : <Menu className="h-5 w-5 stroke-[1.5]" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white flex flex-col justify-center items-center text-center p-6 animate-fade-in md:hidden" id="mobile-menu-overlay">
          <div className="space-y-8 flex flex-col items-center">
            <button 
              onClick={() => {
                window.location.hash = "/camiseta";
                setIsMobileMenuOpen(false);
              }}
              className="text-lg lowercase tracking-[0.2em] font-medium text-black hover:opacity-70 transition-all font-semibold"
            >
              a camiseta
            </button>
            <button 
              onClick={() => {
                window.location.hash = "/filosofia";
                setIsMobileMenuOpen(false);
              }}
              className="text-lg lowercase tracking-[0.2em] font-medium text-black hover:opacity-70 transition-all font-semibold"
            >
              filosofia
            </button>
            <button 
              onClick={() => {
                window.location.hash = "/rastrear";
                setIsMobileMenuOpen(false);
              }}
              className="text-lg lowercase tracking-[0.2em] font-medium text-black hover:opacity-70 transition-all font-semibold"
            >
              rastrear pedido
            </button>
            
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsCartOpen(true);
              }}
              className="mt-4 flex items-center gap-2 text-xs font-mono uppercase tracking-widest bg-black text-white px-6 py-3"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Ver Carrinho ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Application Workspace Area */}
      <main className={`flex-grow ${view !== "home" ? "pt-24 sm:pt-28" : ""}`}>
        
        {/* VIEW: HOME (The Landing, Manifesto, and Catalog View) */}
        {view === "home" && (
          <div className="pb-20 animate-fade-in" id="home-view-container">
            
            {/* Full Screen Hero Block */}
            <section className="w-full select-none relative overflow-hidden bg-neutral-100" id="hero-section">
              {/* Invisible spacer image to force the container's responsive height naturally, matching the video section */}
              <img 
                src={IMAGES.heroImages[0]} 
                className="w-full object-cover max-h-[80vh] md:max-h-[90vh] lg:max-h-screen opacity-0 pointer-events-none"
                alt="spacer"
              />
              {IMAGES.heroImages.map((src, idx) => (
                <img
                  key={src}
                  src={src}
                  alt={`NUVA Editorial Presentation ${idx + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover object-[center_center] md:object-[80%_center] transition-opacity duration-[1500ms] ease-in-out ${
                    idx === heroImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                  referrerPolicy="no-referrer"
                />
              ))}
              {/* Subtle top gradient overlay for reading floating text with elite contrast */}
              <div className="absolute inset-x-0 top-0 h-32 md:h-40 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-20" />
            </section>

            {/* Subtle Brand Ethos banner quote */}
            <section className="bg-white flex items-center justify-center border-y border-neutral-200 py-6 min-h-[140px] select-none">
              <div className="max-w-2xl mx-auto px-4 text-center flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center justify-center select-none">
                  <MiniLogo className="h-3.5 opacity-80" />
                </div>
                <p className="text-[13px] md:text-sm font-sans font-light text-neutral-700 leading-relaxed italic max-w-lg mx-auto">
                  "O verdadeiro luxo não precisa de ser anunciado. Ele sente-se no caimento equilibrado, no agasalho macio e na confiança silenciosa do minimalismo puro."
                </p>
              </div>
            </section>

            {/* Vitrine / Showcase Grid */}
            <section className="max-w-[90rem] mx-auto px-4 sm:px-6 mt-16 md:mt-24 select-none">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
                {singleProduct.colors.map((color) => (
                  <div 
                    key={color.id} 
                    className="flex flex-col cursor-pointer group"
                    onClick={() => {
                      setHomeColor(color);
                      setHomeActiveImageIndex(0);
                      setTimeout(() => scrollTo(catalogRef), 100);
                    }}
                  >
                    <div className="aspect-[3/4] bg-neutral-50 overflow-hidden mb-5 relative border border-transparent group-hover:border-neutral-200 transition-colors duration-500">
                      <img 
                        src={color.image} 
                        alt={color.name}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-center space-y-2">
                      <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono font-medium block">
                        nuva {color.isPreOrder && <span className="bg-black text-white px-1.5 py-0.5 ml-1 inline-block">BREVEMENTE</span>}
                      </span>
                      <h3 className="text-[15px] font-normal text-neutral-900 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis px-2">
                        {singleProduct.name}, {color.name}
                      </h3>
                      <p className="text-sm text-neutral-500 font-light">
                        {formatPrice(color.priceOverride || singleProduct.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Core Catalogue Section - Adapted to matches User's High-fidelity Clean Minimal Reference */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-20 md:mt-32 scroll-mt-24" ref={catalogRef} id="catalog-section">
              
              {/* Product Layout structure matching Reference exactly */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 bg-white">
                
                {/* 1. Left Gallery Showroom with Left Vertical Thumbnails */}
                <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-4 items-start w-full">
                  
                  {/* Vertical Showcase Thumbnail list */}
                  <div className="flex flex-row md:flex-col gap-3 w-full md:w-20 shrink-0 overflow-x-auto py-1 md:py-0 scrollbar-none select-none">
                    {(homeColor.images || [homeColor.image]).map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setHomeActiveImageIndex(idx)}
                        className={`aspect-3/4 border overflow-hidden relative cursor-pointer transition-all duration-300 w-14 sm:w-16 md:w-full shrink-0 ${homeActiveImageIndex === idx ? "border-black scale-[0.98] ring-1 ring-black/10" : "border-neutral-200 hover:border-black/50 opacity-85 hover:opacity-100"}`}
                        title={`${homeColor.name} - Ângulo ${idx + 1}`}
                      >
                        <img 
                          src={imgUrl} 
                          alt={`${homeColor.name} view ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Main Showcase Color Photo on Right */}
                  <div className="flex-grow w-full relative aspect-3/4 bg-brand-offwhite border border-neutral-100 overflow-hidden select-none">
                    <img
                      src={homeColor.images && homeColor.images[homeActiveImageIndex] ? homeColor.images[homeActiveImageIndex] : homeColor.image}
                      alt={`${singleProduct.name} - ${homeColor.name}`}
                      className="w-full h-full object-cover object-center transition-all duration-700 ease-out"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* 2. Right Selector Panel & Editorial Specs inline */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* Brand and name */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold block flex items-center gap-2">
                       NUVA
                       {homeColor.isPreOrder && (
                         <span className="bg-black text-white px-2 py-0.5 text-[8px]">BREVEMENTE</span>
                       )}
                    </span>
                    <h3 className="text-2xl font-light text-neutral-900 tracking-normal capitalize">
                      t-shirt essential, {homeColor.name.toLowerCase()} – nuva
                    </h3>
                    <div className="pt-1.5 pb-2 text-[15px] font-mono text-neutral-800">
                      {formatPrice(homeColor.priceOverride || singleProduct.price)}
                    </div>
                  </div>

                  {/* Interactive Color Selection */}
                  <div className="space-y-2 pt-2">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                      Cor:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {singleProduct.colors.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => {
                            setHomeColor(color);
                            setHomeSizeError(false);
                          }}
                          className={`px-3 py-1.5 text-[10px] font-mono border transition-all cursor-pointer ${homeColor.id === color.id ? "bg-black text-white border-black font-semibold" : "border-neutral-200 hover:border-black text-neutral-700 bg-white"}`}
                        >
                          {color.name.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clean separator */}
                  <div className="border-b border-neutral-200 pt-3" />

                  {/* Core description text block */}
                  <p className="text-[11px] text-neutral-600 font-sans leading-relaxed pt-2">
                    Com um caimento encorpado e modelagem regular atemporal, a T-Shirt Essential é a nossa peça de referência. É confeccionada com o melhor algodão penteado nacional direto de ateliers em Guimarães, garantindo uma estrutura pesada e toque incomparável.
                  </p>

                  {/* Minimal List Bullet specifications */}
                  <ul className="text-[11px] text-neutral-600 font-sans space-y-1 list-disc pl-4 leading-relaxed">
                    <li>Tecido: 100% Algodão Penteado Premium (Gramagem 220 GSM)</li>
                    <li>Cuidados: Lavar à máquina com água fria, ciclo delicado, secar à sombra</li>
                    <li>Ajuste: Modelagem Regular Estruturada Atemporal</li>
                    <li>O modelo mede 1,84m e veste tamanho M</li>
                    <li>Fabricado em Portugal (Guimarães)</li>
                  </ul>

                  {/* Interactive Size selector */}
                  <div className="space-y-2 pt-2">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                      Tamanho:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {singleProduct.sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setHomeSize(size);
                            setHomeSizeError(false);
                          }}
                          className={`w-10 h-10 text-[11px] flex items-center justify-center border transition-all cursor-pointer ${homeSize === size ? "bg-black text-white border-black font-semibold" : "border-neutral-200 hover:border-black text-neutral-700 bg-white"}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>

                    {homeSizeError && (
                      <p className="text-[10px] font-semibold text-red-500 animate-pulse mt-1 font-sans">
                        * Por favor, selecione o seu tamanho ideal de T-Shirt para adicionar.
                      </p>
                    )}
                  </div>

                  {/* Quantity selector */}
                  <div className="space-y-2">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                      Quantidade:
                    </span>
                    <div className="flex items-center w-28 border border-neutral-200 bg-white">
                      <button
                        type="button"
                        onClick={() => setHomeQty(q => Math.max(1, q - 1))}
                        className="px-3 py-1.5 text-neutral-500 hover:text-black transition-colors font-mono cursor-pointer"
                      >
                        —
                      </button>
                      <span className="flex-1 text-center text-xs font-mono font-medium">{homeQty}</span>
                      <button
                        type="button"
                        onClick={() => setHomeQty(q => q + 1)}
                        className="px-3 py-1.5 text-neutral-500 hover:text-black transition-colors font-mono cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Primary purchase actions */}
                  <div className="space-y-3 pt-2 flex flex-col">
                    <button
                      type="button"
                      onClick={() => {
                        if (!homeSize) {
                          setHomeSizeError(true);
                          return;
                        }
                        handleAddToCart(singleProduct, homeColor, homeSize, homeQty);
                        setView("checkout");
                      }}
                      className="w-full py-4 bg-black hover:bg-neutral-900 text-white text-[11px] uppercase tracking-widest font-mono font-medium transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Comprar Agora
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!homeSize) {
                          setHomeSizeError(true);
                          return;
                        }
                        handleAddToCart(singleProduct, homeColor, homeSize, homeQty);
                        setHomeAdded(true);
                        setIsCartOpen(true);
                        setTimeout(() => {
                          setHomeAdded(false);
                        }, 2000);
                      }}
                      disabled={homeAdded}
                      className="w-full py-4 bg-transparent border border-black hover:bg-neutral-50 text-black text-[11px] uppercase tracking-widest font-mono font-medium transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer"
                      id="add-to-cart-homepage-btn"
                    >
                      {homeAdded ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Adicionado</span>
                        </>
                      ) : (
                        <span>{homeColor.isPreOrder ? "Reservar (Stock Limitado)" : "Adicionar ao Carrinho"}</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!homeSize) {
                          setHomeSizeError(true);
                          return;
                        }
                        const price = homeColor.priceOverride || singleProduct.price;
                        const message = `Olá! Gostaria de fazer uma encomenda do produto:\n- ${homeQty}x ${singleProduct.name} (${homeColor.name}, Tam: ${homeSize})\n\nTotal estimado: ${formatPrice(price * homeQty)}`;
                        window.open(`https://wa.me/244941429171?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 text-[11px] uppercase tracking-widest font-mono font-medium transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                      <span>Enviar Pedido via WhatsApp</span>
                    </button>
                  </div>

                </div>

              </div>
            </section>

            {/* Immersive Video Banner */}
            <section className="w-full mt-16 md:mt-24 select-none bg-neutral-100">
              <video 
                src="/fica a par dar novidades (4).mp4" 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full object-cover max-h-[80vh] md:max-h-[90vh]"
              />
            </section>

            {/* About NUVA Text Block */}
            <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-16 md:mt-24 text-center space-y-6 text-[13px] md:text-sm font-sans font-light text-neutral-800 leading-relaxed">
              <h2 className="text-xl md:text-2xl font-light text-neutral-900 mb-8 uppercase tracking-widest">Sobre a NUVA</h2>
              
              <p>Vivemos num mundo cheio de excessos.</p>
              
              <p>Mais tendências. Mais opções. Mais ruído.</p>
              
              <p>A NUVA nasceu para seguir um caminho diferente.</p>
              
              <p>
                Acreditamos que as melhores peças são aquelas que permanecem. As que vestimos sem pensar duas vezes. 
                As que nos acompanham nas rotinas mais simples e nos momentos mais importantes. As que fazem parte de quem somos.
              </p>
              
              <p>Por isso, escolhemos começar pelo essencial.</p>
              
              <p>
                Criamos t-shirts básicas com uma abordagem premium: tecidos cuidadosamente selecionados, caimentos equilibrados, 
                acabamentos limpos e uma estética intemporal. Sem logótipos exagerados. Sem excessos. 
                Apenas peças bem feitas, desenhadas para durar e para serem usadas repetidamente.
              </p>
              
              <p>
                A nossa inspiração vem do luxo silencioso — aquele que não precisa de chamar atenção para ser reconhecido. 
                Valorizamos a qualidade acima da quantidade, a intenção acima da tendência e a confiança que nasce da simplicidade.
              </p>
              
              <p>A NUVA não acredita em coleções infinitas.</p>
              
              <p>Acredita em fazer menos, mas fazer melhor.</p>
              
              <p>
                Cada produto que lançamos é tratado como uma obsessão. Refinado até encontrar o equilíbrio entre conforto, 
                versatilidade e sofisticação discreta. Porque vestir-se bem não deve ser complicado. Deve ser natural.
              </p>
              
              <p>
                Estamos a construir uma marca para quem procura autenticidade. Para quem prefere investir em poucas 
                peças excecionais em vez de muitas descartáveis. Para quem entende que o verdadeiro luxo está nos 
                detalhes que se sentem, não nos que se exibem.
              </p>
              
              <p>A NUVA é mais do que roupa.</p>
              
              <p>É uma filosofia de viver com intenção.</p>
              
              <p>É escolher o essencial.</p>
              
              <p>É desacelerar.</p>
              
              <p>É valorizar o que realmente importa.</p>
              
              <p>Porque o verdadeiro luxo nunca foi sobre ter mais.</p>
              
              <p>Foi sempre sobre escolher melhor.</p>
              
              <div className="pt-12 pb-4 flex flex-col items-center justify-center space-y-4">
                <Logo className="h-4" />
                <span className="text-[10px] uppercase font-mono tracking-widest font-semibold text-neutral-400">Less. Better.</span>
              </div>
            </section>

            {/* brand guidelines values Grid Bento */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 md:mt-24 scroll-mt-24" ref={infoRef} id="story-section">
              <div className="space-y-1 mb-8">
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold block">
                  nuva
                </span>
                <h3 className="text-2xl font-light text-neutral-900 tracking-normal capitalize">
                  filosofia e valores fundamentais – nuva
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {BRAND_VALUES.map((val, idx) => (
                  <div key={val.id} className="border border-neutral-200 bg-white p-6 space-y-3">
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono block">
                      0{idx + 1} // {val.id}
                    </span>
                    <h4 className="text-xs uppercase font-semibold tracking-wider text-neutral-900">
                      {val.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Help desk & Sizing info FAQ Accordion */}
            <section className="max-w-3xl mx-auto px-4 mt-16 md:mt-24" id="faq-section">
              <div className="space-y-1 mb-8 text-center">
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold block">
                  suporte
                </span>
                <h3 className="text-2xl font-light text-neutral-900 tracking-normal capitalize">
                  manutenção & cuidados – nuva
                </h3>
              </div>

              <div className="divide-y divide-neutral-200 border-y border-neutral-200">
                
                <div className="py-5 space-y-2 select-text">
                  <h4 className="font-mono text-[10px] uppercase tracking-wide text-neutral-900 font-semibold">
                    Como devo lavar e cuidar da minha t-shirt NUVA?
                  </h4>
                  <p className="text-[11px] text-neutral-600 font-sans leading-relaxed">
                    As nossas t-shirts são pré-colhidas industrialmente na gola e costuras. No entanto, aconselhamos lavar do avesso no programa delicado em água fria (máximo 30°C) e secar ao ar livre sob a sombra. Nunca utilize secadora de roupa quente para manter o toque e a estrutura de 220 GSM íntegros por anos.
                  </p>
                </div>

                <div className="py-5 space-y-2 select-text">
                  <h4 className="font-mono text-[10px] uppercase tracking-wide text-neutral-900 font-semibold">
                    Onde são confecionadas as peças? É uma produção justa?
                  </h4>
                  <p className="text-[11px] text-neutral-600 font-sans leading-relaxed">
                    Confecionado integralmente no distrito de Guimarães, Portugal, em atelier especializado com certificação ambiental ISO 14001. A nossa fiação parceira garante remunerações acima do salário médio português têxtil e condições impecáveis de atelier de alfaiataria.
                  </p>
                </div>

                <div className="py-5 space-y-2 select-text">
                  <h4 className="font-mono text-[10px] uppercase tracking-wide text-neutral-900 font-semibold">
                    Qual o vosso posicionamento comparado ao Fast-Fashion?
                  </h4>
                  <p className="text-[11px] text-neutral-600 font-sans leading-relaxed">
                    A NUVA ocupa o posicionamento "Luxury Essentials". Vendemos peças sem marcas excessivas ao preço de custo justo têxtil europeu, distanciando-nos de materiais sintéticos descartáveis de fast-fashion ou de margens artificiais de luxo de marca de moda tradicional.
                  </p>
                </div>

              </div>
            </section>

            {/* Newsletter Subscription block */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 md:mt-24 mb-24 scroll-mt-24" id="newsletter-section">
              <NewsletterSection />
            </section>

          </div>
        )}

        {/* VIEW: SECURE CHECKOUT PAGE */}
        {view === "checkout" && (
          <div className="animate-fade-in" id="checkout-view-container">
            <CheckoutSection
              cartItems={cartItems}
              onBack={() => setView("home")}
              onOrderComplete={handleOrderComplete}
            />
          </div>
        )}

        {/* VIEW: ORDER SUCCESS AND RECEIPT PAGE */}
        {view === "success" && completedOrder && (
          <div className="animate-fade-in" id="success-view-container">
            <OrderSuccessState
              order={completedOrder}
              onContinueShopping={() => setView("home")}
              onTrackOrder={(trackNo) => {
                setView("home");
                setTimeout(() => {
                  scrollTo(trackingSectionRef);
                }, 100);
              }}
            />
          </div>
        )}

        {/* VIEW: ORDER TRACKING PAGE */}
        {view === "tracking" && (
          <div className="animate-fade-in py-12 md:py-24" id="tracking-view-container">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <button 
                onClick={() => setView("home")}
                className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 hover:text-black mb-8 flex items-center gap-2"
              >
                ← Voltar
              </button>
              <OrderTracking />
            </div>
          </div>
        )}

      </main>

      {/* 4. Elegant Editorial Site Footer */}
      {/* Main minimal, centered Footer */}
      <footer className="bg-neutral-50 text-neutral-800 pt-20 pb-16 select-none border-t border-neutral-200" id="main-footer">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center space-y-8">
          
          {/* Centered Logo */}
          <div className="flex justify-center mb-2">
            <Logo className="h-12 text-black" />
          </div>

          <p className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">
            © {new Date().getFullYear()} NUVA Labs Lda.
          </p>

          {/* Social Icons row */}
          <div className="flex items-center justify-center space-x-6 text-neutral-800">
            <a href="https://www.instagram.com/nuva.store_camisetabasica/" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-500 transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61590892667125" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-500 transition-colors">
              <Facebook className="h-4 w-4" />
            </a>
          </div>

          {/* Newsletter button */}
          <button className="border border-neutral-300 hover:bg-neutral-200/50 bg-white text-neutral-800 font-sans text-xs flex items-center gap-2 px-6 py-2.5 transition-colors">
            <Mail className="h-3.5 w-3.5 text-neutral-500" />
            Boletim informativo oficial
          </button>

          {/* Centered Contact Details */}
          <div className="text-[11px] font-sans text-neutral-600 space-y-1 pt-4">
            <p>Atelier NUVA Labs: Parque Industrial Guimarães, Bloco C, Portugal</p>
            <p>Email Corporativo: <a href="mailto:nuva2026@proton.me" className="text-black hover:underline">nuva2026@proton.me</a></p>
            <p>Apoio Directo: <span className="text-black">+244 941429171</span></p>
          </div>

          {/* Bottom small links / credits */}
          <div className="pt-8 flex flex-col space-y-4 items-center">
            <div className="flex items-center justify-center space-x-4 text-[10px] text-neutral-400 font-mono tracking-wide uppercase">
              <span>Produzido à Mão em Portugal</span>
            </div>
            
            <div className="flex space-x-4 text-[10px] font-sans text-neutral-400">
              <a href="#privacy" className="hover:underline">Privacidade Estrita</a>
              <span>•</span>
              <a href="#cookies" className="hover:underline">Cookies</a>
              <span>•</span>
              <a href="#terms" className="hover:underline">Termos Editoriais</a>
            </div>
          </div>

        </div>
      </footer>

      {/* Interactive Size Guide Advisor Modal overlay popup */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      {/* Cart lateral Drawer Overlay slide-out */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          const totalValue = cartItems.reduce((sum, item) => sum + (item.selectedColor.priceOverride || item.product.price) * item.quantity, 0);
          const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
          trackInitiateCheckout(totalValue, totalItems, "AOA");
          setView("checkout");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Core single interactive product detailed Modal Drawer overlay */}
      <ProductDetailDrawer
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={(prod, col, sz) => {
          handleAddToCart(prod, col, sz);
          setIsCartOpen(true); // Open actual sidecart immediately on positive interaction feedback!
        }}
        openSizeGuide={() => {
          setIsSizeGuideOpen(true);
        }}
      />

      {/* WhatsApp Floating Contact Button */}
      <a 
        href={(() => {
          let message = "";
          if (cartItems.length > 0) {
            const subtotal = cartItems.reduce((sum, item) => sum + (item.selectedColor.priceOverride || item.product.price) * item.quantity, 0);
            message = `Olá! Gostaria de fazer uma encomenda:\n\n` + 
                      cartItems.map(item => `- ${item.quantity}x ${item.product.name} (${item.selectedColor.name}, Tam: ${item.selectedSize}) - ${formatPrice((item.selectedColor.priceOverride || item.product.price) * item.quantity)}`).join('\n') +
                      `\n\nTotal estimado: ${formatPrice(subtotal)}`;
          } else {
            const sizeText = homeSize ? `, Tam: ${homeSize}` : '';
            message = `Olá! Gostaria de saber mais sobre o produto ${singleProduct.name} (${homeColor.name}${sizeText}).`;
          }
          return `https://wa.me/244941429171?text=${encodeURIComponent(message)}`;
        })()}
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 bg-[#25D366] text-white p-3.5 md:p-4 rounded-full shadow-lg hover:scale-110 hover:shadow-2xl hover:bg-[#20bd5a] transition-all duration-300 flex items-center justify-center animate-fade-in group"
        aria-label="Contactar pelo WhatsApp"
      >
        <svg className="w-7 h-7 md:w-8 md:h-8 fill-current drop-shadow-sm" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        
        {/* Tooltip on hover */}
        <span className="absolute right-full mr-4 bg-white text-black px-3 py-1.5 rounded text-xs font-semibold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap hidden md:block">
          Fale Connosco
        </span>
      </a>

    </div>
  );
}
