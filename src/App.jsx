import React, { useState, useEffect, useLayoutEffect, useRef } from "react";

const variants = {
  waste: { img: "images/platforms/waste-data.png", video: "videos/waste-data-vd.mp4" },
  biodiv: { img: "images/platforms/bio-diversity.png", video: "videos/bio-diversity-vd.mp4" },
  marine: { img: "images/platforms/mwq.png", video: "videos/mwq-monitoring-vd.mp4" },
  air: { img: "images/platforms/aq-monitoring.png", video: "videos/aq-monitoring-vd.mp4" },
  soil: { img: "images/platforms/soil-monitoring.png", video: "videos/soil-monitoring-vd.mp4" },
  weather: { img: "images/platforms/weather-monitoring.png", video: "videos/weather-monitoring-vd.mp4" },
  underground: { img: "images/platforms/underground-monitoring.png", video: "videos/underground-monitoring-vd.mp4" },
  epermit: { img: "images/platforms/e-permit.png", video: "videos/e-permit-vd.mp4" },
};
const fallbackImage = "images/hero-bg.svg"; 

const nodeMeta = {
  soil: {
    label: "Soil Monitoring System",
    details: "Provides real-time soil health data to sustain agriculture and food security.",
    icon: "images/platforms/soil-monitoring-ico.svg",
    explore: "https://www.ecubesoftware.com/fea/soil/"
  },
  biodiv: {
    label: "Biodiversity",
    details: "Showcases Fujairah’s rich habitats and species to support conservation.",
    icon: "images/platforms/bio-diversity-ico.svg",
    explore: "https://www.ecubesoftware.com/fea/biodiversity/"
  },
  marine: {
    label: "Marine Water Quality ",
    details: "Monitors salinity, pH, and pollutants to protect marine ecosystems.",
    icon: "images/platforms/mwq-ico.svg",
    explore: "https://atlas.smartgeoapps.com/FEA/mwq"
  },
  air: {
    label: "Air Quality Monitoring System",
    details: "Tracks real-time air pollutants to ensure cleaner, healthier skies.",
    icon: "images/platforms/aq-monitoring-ico.svg",
    explore: "https://atlas.smartgeoapps.com/FEA/air-quality"
  },
  waste: {
    label: "Waste Management",
    details: "Tracks collection, recycling, and disposal for sustainable waste management.",
    icon: "images/platforms/waste-data-ico.svg",
    explore: "https://www.ecubesoftware.com/fea/wastemanagement/"
  },
  weather: {
    label: "Weather Monitoring System",
    details: "Delivers accurate weather insights for better planning and preparedness.",
    icon: "images/platforms/weather-monitoring-ico.svg",
    explore: "https://jawo.fea.gov.ae/"
  },
  underground: {
    label: "Underground Monitoring ",
    details: "Manages wells and tankers for efficient groundwater use and distribution.",
    icon: "images/platforms/underground-monitor-ico.svg",
    explore: "https://www.ecubesoftware.com/fea/underground/"
  },
  epermit: {
    label: "e-Services",
    details: "Offers citizens and businesses easy access to environmental services anytime.",
    icon: "images/platforms/e-permit-ico.svg",
    explore: "https://www.ecubesoftware.com/fea/e-services/"
  }
};

const allKeys = ["waste", "biodiv", "marine", "air", "soil", "weather", "underground", "epermit"];

// catmull-rom to bezier helper
function catmullRom2bezier(points, tension = 0.5) {
  if (points.length < 2) return "";
  let d = "";
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i === 0 ? points[i] : points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < points.length ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
    const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;
    const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
    const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;

    if (i === 0) {
      d += `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    } else {
      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
  }
  return d;
}

// arc positioning geometry calculation
function getArcPositions(keys, stageRect, svgRect) {
  if (!stageRect) return [];
  
  let baselineY = stageRect.height * 0.45;
  let arcDepth = stageRect.height * 0.2;

  const aspect = stageRect.width / stageRect.height;
  let halfWidth;

  if (stageRect.width < 767.98 || stageRect.height > stageRect.width) {
    baselineY = stageRect.height * 0.65;
    arcDepth = stageRect.height * 0.15;
    halfWidth = stageRect.width * 0.35; 
  } else if (stageRect.width < 1024 || stageRect.height > stageRect.width) {
    baselineY = stageRect.height * 0.6;
    arcDepth = stageRect.height * 0.12;
    halfWidth = stageRect.width * 0.35; 
  } else if (stageRect.width < 1080 && stageRect.height < stageRect.width) {
    baselineY = stageRect.height * 0.53;
    arcDepth = stageRect.height * 0.1;
    halfWidth = stageRect.width * 0.3; 
  } else if (aspect > 2) {
    baselineY = stageRect.height * 0.45;
    halfWidth = stageRect.width * 0.3; 
  } else if (aspect > 0.9 && aspect < 1.1) {
    baselineY = stageRect.height * 0.45;
    arcDepth = stageRect.height * 0.4;
    halfWidth = stageRect.width * 0.35;
  } else {
    halfWidth = stageRect.width * 0.27;
  }

  const svgWidth = svgRect ? svgRect.width : stageRect.width;
  const centerX = svgWidth / 2;
  const leftX = centerX - halfWidth;
  const rightX = centerX + halfWidth;
  const controlY = baselineY + arcDepth;

  const p0 = { x: leftX, y: baselineY };
  const p3 = { x: rightX, y: baselineY };
  const p1 = { x: leftX + (rightX - leftX) * 0.9, y: controlY };
  const p2 = { x: leftX + (rightX - leftX) * 0.1, y: controlY };

  const samples = 30;
  const pts = new Array(samples + 1);
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    pts[i] = {
      x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
      y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y
    };
  }

  const cum = [0];
  for (let i = 1; i <= samples; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    cum[i] = cum[i - 1] + Math.hypot(dx, dy);
  }
  const totalLen = cum[samples];

  function tAtLength(target) {
    if (target <= 0) return 0;
    if (target >= totalLen) return 1;
    let lo = 0, hi = samples;
    while (lo + 1 < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < target) lo = mid;
      else hi = mid;
    }
    const segLen = cum[hi] - cum[lo];
    const frac = segLen === 0 ? 0 : (target - cum[lo]) / segLen;
    return (lo + frac) / samples;
  }

  if (keys.length === 1) {
    return [{
      key: keys[0],
      x: svgWidth / 2,
      y: stageRect.height * 0.64
    }];
  }

  return keys.map((k, i) => {
    const target = (i / (keys.length - 1)) * totalLen;
    const t = tAtLength(target);
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    const p = {
      x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
      y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y
    };
    return { key: k, x: p.x, y: p.y };
  });
}

// ─── Translations ───────────────────────────────────────────────
const translations = {
  en: {
    headerTitle: "Dynamic Unified Data Platform",
    portraitTitle: "Fujairah Environment Authority Dynamic Unified Data Platform",
    login: "Login",
    comingSoon: "Coming Soon!",
    explorMore: "Explore More",
    footerOrg: "FUJAIRAH ENVIRONMENT AUTHORITY",
    footerCopy: "Copyright 2025 Fujairah Environment Authority. All rights reserved.",
    fujText: "Fujairah",
    langBtn: "عربي",
    menuItems: [
      "Biodiversity", "Marine Water Quality",
      "Air Quality Monitoring System", "Waste Management",
      "Weather Monitoring System", "Underground Monitoring",
      "e-Services", "Soil Monitoring System"
    ],
    nodes: {
      soil:       { label: "Soil Monitoring System",          details: "Provides real-time soil health data to sustain agriculture and food security." },
      biodiv:     { label: "Biodiversity",                    details: "Showcases Fujairah's rich habitats and species to support conservation." },
      marine:     { label: "Marine Water Quality",            details: "Monitors salinity, pH, and pollutants to protect marine ecosystems." },
      air:        { label: "Air Quality Monitoring System",   details: "Tracks real-time air pollutants to ensure cleaner, healthier skies." },
      waste:      { label: "Waste Management",                details: "Tracks collection, recycling, and disposal for sustainable waste management." },
      weather:    { label: "Weather Monitoring System",       details: "Delivers accurate weather insights for better planning and preparedness." },
      underground:{ label: "Underground Monitoring",          details: "Manages wells and tankers for efficient groundwater use and distribution." },
      epermit:    { label: "e-Services",                      details: "Offers citizens and businesses easy access to environmental services anytime." },
    }
  },
  ar: {
    headerTitle: "منصة البيانات الموحدة الديناميكية",
    portraitTitle: "هيئة بيئة الفجيرة - منصة البيانات الموحدة الديناميكية",
    login: "تسجيل الدخول",
    comingSoon: "قريباً!",
    explorMore: "استكشف المزيد",
    footerOrg: "هيئة بيئة الفجيرة",
    footerCopy: "حقوق النشر 2025 هيئة بيئة الفجيرة. جميع الحقوق محفوظة.",
    fujText: "Fujairah",
    langBtn: "English",
    menuItems: [
      "التنوع البيولوجي", "جودة مياه البحر",
      "نظام مراقبة جودة الهواء", "إدارة النفايات",
      "نظام مراقبة الطقس", "المراقبة تحت الأرض",
      "الخدمات الإلكترونية", "نظام مراقبة التربة"
    ],
    nodes: {
      soil:       { label: "نظام مراقبة التربة",              details: "يوفر بيانات صحة التربة في الوقت الفعلي لدعم الزراعة والأمن الغذائي." },
      biodiv:     { label: "التنوع البيولوجي",                details: "يعرض الموائل والأنواع الغنية في الفجيرة لدعم الحفاظ عليها." },
      marine:     { label: "جودة مياه البحر",                 details: "يرصد الملوحة ودرجة الحموضة والملوثات لحماية النظم البيئية البحرية." },
      air:        { label: "نظام مراقبة جودة الهواء",         details: "يتتبع ملوثات الهواء في الوقت الفعلي لضمان سماء أكثر نظافةً وصحة." },
      waste:      { label: "إدارة النفايات",                  details: "يتتبع جمع النفايات وإعادة تدويرها والتخلص منها بشكل مستدام." },
      weather:    { label: "نظام مراقبة الطقس",              details: "يقدم رؤى دقيقة للطقس لتحسين التخطيط والاستعداد." },
      underground:{ label: "المراقبة تحت الأرض",             details: "يدير الآبار والصهاريج لاستخدام المياه الجوفية وتوزيعها بكفاءة." },
      epermit:    { label: "الخدمات الإلكترونية",            details: "يتيح للمواطنين والشركات الوصول السهل إلى الخدمات البيئية في أي وقت." },
    }
  }
};

function App() {
  const [activeKey, setActiveKey] = useState("biodiv");
  const [lang, setLang] = useState("en");
  const t = translations[lang];
  const isAr = lang === "ar";
  const toggleLang = () => setLang(prev => prev === "en" ? "ar" : "en");

  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800
  });

  const [bgLayers, setBgLayers] = useState([
    {
      id: 1,
      key: "biodiv",
      bgUrl: variants.biodiv.img,
      opacity: 1,
      transform: "translate3d(0,0,0) scale(1)"
    }
  ]);

  const [subtitleHtml, setSubtitleHtml] = useState("");
  const [subtitleShow, setSubtitleShow] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const stageRef = useRef(null);
  const svgRef = useRef(null);
  const videoRef = useRef(null);
  const hamberBtnRef = useRef(null);
  const hamberMenuRef = useRef(null);
  const alertTimerRef = useRef(null);
  const touchStartXRef = useRef(0);
  const nodePositionsRef = useRef({});

  const SWIPE_THRESHOLD = 50;

  // Track window size for layout calculation
  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 120);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Close hamburger menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        hamberBtnRef.current && !hamberBtnRef.current.contains(e.target) &&
        hamberMenuRef.current && !hamberMenuRef.current.contains(e.target)
      ) {
        setHamburgerOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Compute layout values based on current dimensions
  const windowSize = dimensions.width <= 767.98 || dimensions.height <= 500 ? 1 : (dimensions.width <= 1024 ? 3 : 4);
  const focusIndex = dimensions.width <= 767.98 || dimensions.height <= 500 ? 0 : 1;

  // Deriving startIndex
  const activeKeyIndex = allKeys.indexOf(activeKey);
  const startIndex = (activeKeyIndex - focusIndex + allKeys.length) % allKeys.length;

  const getVisibleKeys = () => {
    const arr = [];
    for (let i = 0; i < windowSize; i++) {
      arr.push(allKeys[(startIndex + i) % allKeys.length]);
    }
    return isAr ? arr.reverse() : arr;
  };
  const visibleKeys = getVisibleKeys();

  // Measure stage and SVG rects inside useLayoutEffect to prevent jitter
  const [stageRect, setStageRect] = useState(null);
  const [svgRect, setSvgRect] = useState(null);

  useLayoutEffect(() => {
    if (stageRef.current) {
      setStageRect(stageRef.current.getBoundingClientRect());
    }
    if (svgRef.current) {
      setSvgRect(svgRef.current.getBoundingClientRect());
    }
  }, [dimensions]);

  const positions = stageRect ? getArcPositions(visibleKeys, stageRect, svgRect) : [];

  // Update last known positions for all visible nodes
  useEffect(() => {
    positions.forEach(pos => {
      nodePositionsRef.current[pos.key] = { x: pos.x, y: pos.y };
    });
  }, [positions]);

  // Handle subtitle transitions
  useEffect(() => {
    setSubtitleShow(false);
    const timer = setTimeout(() => {
      const meta = t.nodes[activeKey];
      if (meta) {
        const parts = meta.label.split(" ");
        const html = parts.length > 1
          ? `${parts[0]} <span>${parts.slice(1).join(" ")}</span>`
          : meta.label;
        setSubtitleHtml(html);
        setSubtitleShow(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [activeKey, lang]);

  // Manage video loading and playback
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const variant = variants[activeKey];
    if (variant && variant.video) {
      const currentSource = videoEl.querySelector("source")?.src || "";
      if (!currentSource || !currentSource.endsWith(variant.video)) {
        let srcEl = videoEl.querySelector("source");
        if (!srcEl) {
          srcEl = document.createElement("source");
          srcEl.type = "video/mp4";
          videoEl.appendChild(srcEl);
        }
        srcEl.setAttribute("src", variant.video);
        videoEl.load();
        videoEl.play().catch(err => {
          if (err.name !== "AbortError") {
            console.error(err);
          }
        });
      }
    } else {
      const srcEl = videoEl.querySelector("source");
      if (srcEl) {
        srcEl.remove();
        try {
          videoEl.load();
        } catch (e) {}
      }
    }
  }, [activeKey]);

  // Temporary transition state to trigger node details fade out/in
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [activeKey]);

  const triggerBgTransition = (newKey, direction) => {
    const bgUrl = variants[newKey]?.img || fallbackImage;
    const newId = Date.now();

    const initialNewLayer = {
      id: newId,
      key: newKey,
      bgUrl: bgUrl,
      opacity: 0,
      transform: direction === "right"
        ? "translate3d(5rem,5rem,0) scale(1)"
        : "translate3d(0,5rem,0) scale(1)"
    };

    setBgLayers(prev => {
      const activeLayers = prev.filter(l => l.opacity > 0);
      return [...activeLayers, initialNewLayer];
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setBgLayers(prev => {
          return prev.map(layer => {
            if (layer.id === newId) {
              return {
                ...layer,
                opacity: 1,
                transform: "translate3d(0,0,0) scale(1)"
              };
            } else {
              return {
                ...layer,
                opacity: 0,
                transform: direction === "right"
                  ? "translate3d(-25rem,-25rem,0) scale(0.3)"
                  : "translate3d(25rem,-25rem,0) scale(0.3)"
              };
            }
          });
        });
      });
    });

    setTimeout(() => {
      setBgLayers(prev => prev.filter(l => l.id === newId));
    }, 500);
  };

  const rotateTo = (key) => {
    if (key === activeKey) return;

    const idx = visibleKeys.indexOf(key);
    let direction = "right";

    if (idx === -1) {
      direction = allKeys.indexOf(key) > allKeys.indexOf(activeKey) ? "right" : "left";
    } else {
      const delta = idx - focusIndex;
      if (delta < 0) direction = "left";
    }

    setActiveKey(key);
    triggerBgTransition(key, direction);
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartXRef.current;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) {
        const nextIndex = (allKeys.indexOf(activeKey) + 1) % allKeys.length;
        rotateTo(allKeys[nextIndex]);
      } else {
        const prevIndex = (allKeys.indexOf(activeKey) - 1 + allKeys.length) % allKeys.length;
        rotateTo(allKeys[prevIndex]);
      }
    }
  };

  // Mobile navigation button handlers
  const handlePrevClick = () => {
    if (windowSize === 1) {
      const prevIndex = (allKeys.indexOf(activeKey) - 1 + allKeys.length) % allKeys.length;
      rotateTo(allKeys[prevIndex]);
    }
  };

  const handleNextClick = () => {
    if (windowSize === 1) {
      const nextIndex = (allKeys.indexOf(activeKey) + 1) % allKeys.length;
      rotateTo(allKeys[nextIndex]);
    }
  };

  // Explore button click handler
  const handleExploreClick = (e) => {
    e.stopPropagation();
    const exploreLink = nodeMeta[activeKey]?.explore;
    if (exploreLink && exploreLink !== "#") {
      window.open(exploreLink, "_blank");
    }
  };

  // Login click handlers
  const handleLoginClick = () => {
    setAlertVisible(true);
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    alertTimerRef.current = setTimeout(() => {
      setAlertVisible(false);
    }, 5000);
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
  };

  // Clean alert timer on unmount
  useEffect(() => {
    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, []);

  // SVG lines math
  const first = positions[0];
  const second = positions[1];
  const startLine = first && second ? {
    x1: first.x,
    y1: first.y,
    x2: first.x + (first.x - second.x) * 0.2,
    y2: first.y + (first.y - second.y) * 0.2
  } : null;

  const last = positions[positions.length - 1];
  const prev = positions[positions.length - 2];
  const endLine = last && prev ? {
    x1: last.x,
    y1: last.y,
    x2: last.x + (last.x - prev.x) * 0.2,
    y2: last.y + (last.y - prev.y) * 0.2
  } : null;

  const pathD = positions.length >= 2 ? catmullRom2bezier(positions, 0.6) : "";

  return (
    <main dir={isAr ? "rtl" : "ltr"} lang={lang}>
      <div className="fea-hero" id="hero" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        
        {/* Dynamic Video Element */}
        <video id="background-video" ref={videoRef} autoPlay loop muted preload="none" />
        <div className="video-overlay"></div>

        {/* Dynamic Background Image Layers */}
        {bgLayers.map(layer => (
          <div
            key={layer.id}
            className={`fea-bg-layer --${layer.key}`}
            style={{
              backgroundImage: `url('${layer.bgUrl}')`,
              opacity: layer.opacity,
              transform: layer.transform,
            }}
          />
        ))}

        {/* Header Section */}
        <header className="fea-head">
          <div className="fea-logo">
            <img src="images/fea-logo.svg" alt="FEA" loading="lazy" decoding="async" />
          </div>
          <div className="fea-title --landscape">{t.headerTitle}</div>
          <div className="head-nav">
            {/* Language Toggle Pill */}
            <div
              className="lang-toggle"
              id="langToggle"
              onClick={toggleLang}
              role="button"
              aria-label="Toggle language"
              tabIndex={0}
              onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") toggleLang(); }}
            >
              <span className={`lang-opt ${lang === "en" ? "active" : ""}`}>EN</span>
              <span className="lang-divider">|</span>
              <span dir="rtl" className={`lang-opt ${lang === "ar" ? "active" : ""}`}>عربي</span>
            </div>

            <div className="fea-dropdown">
              <button
                type="button"
                className="hamberBtn"
                id="hamberBtn"
                ref={hamberBtnRef}
                onClick={() => setHamburgerOpen(prev => !prev)}
              >
                <img
                  src={hamburgerOpen ? "images/menu/hamber-close.svg" : "images/menu/menu-hamber.svg"}
                  alt="Menu"
                />
              </button>
              <ul
                className={`fea-dropdown-menu ${hamburgerOpen ? "show" : ""}`}
                id="hamberMenu"
                ref={hamberMenuRef}
              >
                <li><a href="https://www.ecubesoftware.com/fea/biodiversity/" target="_blank" rel="noopener noreferrer"><img src="images/menu/biodiversity-ico.svg" alt="" /> {t.menuItems[0]}</a></li>
                <li><a href="https://atlas.smartgeoapps.com/FEA/mwq" target="_blank" rel="noopener noreferrer"><img src="images/menu/mwq-ico.svg" alt="" /> {t.menuItems[1]}</a></li>
                <li><a href="https://atlas.smartgeoapps.com/FEA/air-quality" target="_blank" rel="noopener noreferrer"><img src="images/menu/aqms-ico.svg" alt="" /> {t.menuItems[2]}</a></li>
                <li><a href="https://www.ecubesoftware.com/fea/wastemanagement/" target="_blank" rel="noopener noreferrer"><img src="images/menu/waste-m-ico.svg" alt="" /> {t.menuItems[3]}</a></li>
                <li><a href="https://jawo.fea.gov.ae/" target="_blank" rel="noopener noreferrer"><img src="images/menu/wms-ico.svg" alt="" /> {t.menuItems[4]}</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}><img src="images/menu/underground-m-ico.svg" alt="" /> {t.menuItems[5]}</a></li>
                <li><a href="https://www.ecubesoftware.com/fea/e-services/" target="_blank" rel="noopener noreferrer"><img src="images/menu/e-services-ico.svg" alt="" /> {t.menuItems[6]}</a></li>
                <li><a href="https://www.ecubesoftware.com/fea/soil/" target="_blank" rel="noopener noreferrer"><img src="images/menu/soil-ico.svg" alt="" /> {t.menuItems[7]}</a></li>
              </ul>
            </div>

            <button type="button" id="loginBtn" className="loginBtn" onClick={handleLoginClick}>
              <label style={{ cursor: "pointer" }}>{t.login}</label>
            </button>

            <div id="customAlert" className="custom-alert" style={{ display: alertVisible ? "block" : "none" }}>
              <span id="customAlertMsg">{t.comingSoon}</span>
              <button id="closeAlert" className="close-btn" onClick={handleCloseAlert}>&times;</button>
            </div>
          </div>
        </header>

        {/* Fujairah Text Elements */}
        <div className="heroDecoImgBlk">
          <h3 className="fujText">{t.fujText}</h3>
          <h3 dir="rtl" lang="ar" className="fujArabic">الفجيرة</h3>
        </div>

        {/* Map Icon Indicator */}
        <div className="imgMapBlk">
          <img className="imgMap" loading="lazy" decoding="async" alt="map" src="images/map-ico.gif" />
        </div>

        {/* Main Stage & Carousel Content */}
        <div className="fea-content">
          <div className="fea-title --portrait">{t.portraitTitle}</div>
          <div className="fea-stage" id="stage" ref={stageRef}>
            <div
              className={`fea-subtitle ${subtitleShow ? "show" : ""}`}
              dangerouslySetInnerHTML={{ __html: subtitleHtml }}
            />

            {/* SVG Connector Lines */}
            <svg className="fea-connections" id="connections" ref={svgRef} preserveAspectRatio="none">
              <defs>
                {startLine && (
                  <linearGradient id="fadeGradientStart" gradientUnits="userSpaceOnUse"
                    x1={startLine.x1} y1={startLine.y1} x2={startLine.x2} y2={startLine.y2}>
                    <stop offset="0%" stopColor="#008695" stopOpacity="1" />
                    <stop offset="100%" stopColor="#008695" stopOpacity="0" />
                  </linearGradient>
                )}
                {endLine && (
                  <linearGradient id="fadeGradientEnd" gradientUnits="userSpaceOnUse"
                    x1={endLine.x1} y1={endLine.y1} x2={endLine.x2} y2={endLine.y2}>
                    <stop offset="0%" stopColor="#008695" stopOpacity="1" />
                    <stop offset="100%" stopColor="#008695" stopOpacity="0" />
                  </linearGradient>
                )}
              </defs>

              {startLine && (
                <line x1={startLine.x1} y1={startLine.y1} x2={startLine.x2} y2={startLine.y2}
                  stroke="url(#fadeGradientStart)" strokeWidth="5" strokeLinecap="round" />
              )}
              {endLine && (
                <line x1={endLine.x1} y1={endLine.y1} x2={endLine.x2} y2={endLine.y2}
                  stroke="url(#fadeGradientEnd)" strokeWidth="5" strokeLinecap="round" />
              )}

              {pathD && (
                <path d={pathD} className="main-path" />
              )}

              {positions.map((p) => (
                <circle
                  key={p.key}
                  className="connector-dot"
                  cx={p.x}
                  cy={p.y}
                  r={10}
                />
              ))}
            </svg>

            {/* Dynamic Carousel Nodes */}
            <div className="fea-nodes" id="nodes">
              {allKeys.map(key => {
                const pos = positions.find(p => p.key === key);
                const isVisible = !!pos;
                const meta = nodeMeta[key] || {};
                const isActive = key === activeKey;

                const nodeStyle = isVisible ? {
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  zIndex: 200 + Math.round(pos.y),
                  opacity: 1,
                  pointerEvents: "auto"
                } : {
                  position: "absolute",
                  left: nodePositionsRef.current[key] ? `${nodePositionsRef.current[key].x}px` : "-30rem",
                  top: nodePositionsRef.current[key] ? `${nodePositionsRef.current[key].y}px` : "50%",
                  zIndex: 200,
                  opacity: 0,
                  pointerEvents: "none"
                };

                const nodeClass = `fea-node ${key} ${isActive ? "active" : ""} ${isTransitioning || !isVisible ? "fade-hidden" : ""}`;

                return (
                  <div
                    key={key}
                    className={nodeClass}
                    style={nodeStyle}
                    tabIndex={0}
                    onClick={() => rotateTo(key)}
                    onKeyUp={(e) => {
                      if (e.key === "Enter" || e.key === " ") rotateTo(key);
                    }}
                  >
                    <div className={`fea-dot ${isActive ? "active" : ""}`}>
                      <img src={meta.icon} alt={key} loading="lazy" decoding="async" />
                    </div>
                    <div className="fea-nodeBlk">
                      <h5 className="fea-nodeName">{t.nodes[key]?.label || meta.label}</h5>
                      <p className="fea-details">{t.nodes[key]?.details || meta.details}</p>
                    </div>
                    {isActive && (
                      <button className="fea-explore" id="explore" onClick={handleExploreClick}>
                        <span className="fea-circle">
                          <img src="images/btn-arrow.gif" alt="" />
                        </span>
                        <span className="text">{t.explorMore}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Navigation Dots Indicator */}
        <div className="fea-right-nav" id="rightNav">
          {allKeys.map(key => {
            const meta = nodeMeta[key] || {};
            return (
              <div
                key={key}
                className={`fea-small ${key === activeKey ? "active" : ""}`}
                title={meta.label}
                style={{ "--dot-color": meta.color }}
                tabIndex={0}
                onClick={() => rotateTo(key)}
                onKeyUp={(e) => {
                  if (e.key === "Enter" || e.key === " ") rotateTo(key);
                }}
              />
            );
          })}
        </div>

        {/* Mobile-Only Arrow Controls */}
        <div className="mobile-arrows" style={{ display: windowSize === 1 ? "flex" : "none" }}>
          <button id="prevArrow" className="arrow-btn" onClick={handlePrevClick}>&larr;</button>
          <button id="nextArrow" className="arrow-btn" onClick={handleNextClick}>&rarr;</button>
        </div>

      </div>

      {/* Footer Section */}
      <footer className="fea-footer">
        <div className="fea-logo">
          <img src="images/fea-logo.svg" alt="FEA" loading="lazy" decoding="async" />
        </div>
        <div className="copyBlk">
          <h5>{t.footerOrg}</h5>
          <p>{t.footerCopy}</p>
        </div>
        <div className="socialBlk">
          <a href="https://x.com/fuj_environment" target="_blank" rel="noopener noreferrer"><img alt="twitter" src="images/footer/twitter.svg" /></a>
          <a href="https://www.instagram.com/fujenvironment?igsh=MXA0dnE4cTFlZjlyaQ==" target="_blank" rel="noopener noreferrer"><img alt="Insta" src="images/footer/insta.svg" /></a>
          <a href="https://www.linkedin.com/company/fujairah-environment-authority/" target="_blank" rel="noopener noreferrer"><img alt="linkedin" src="images/footer/linkedin.svg" /></a>
          <a href="https://t.me/Fuj_Environment" target="_blank" rel="noopener noreferrer"><img alt="telegram" src="images/footer/telegram.svg" /></a>
          <a href="https://www.threads.com/@fujenvironment" target="_blank" rel="noopener noreferrer"><img alt="Thread" src="images/footer/thread.svg" /></a>
          <a href="https://www.youtube.com/@FEA.Natural/videos" target="_blank" rel="noopener noreferrer"><img alt="Youtube" src="images/footer/youtube.svg" /></a>
          <a href="https://www.facebook.com/FujEnvironmentAuthority/" target="_blank" rel="noopener noreferrer"><img alt="facebook" src="images/footer/facebook.svg" /></a>
        </div>
      </footer>
    </main>
  );
}

export default App;
