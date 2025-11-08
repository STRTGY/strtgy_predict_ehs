/**
 * STRTGY Brand Components
 * Componentes de marca y hero sections con el ADN de STRTGY
 */

/**
 * Hero section con pillares de valor STRTGY
 */
export function heroSTRTGY({
  title,
  subtitle,
  context,
  showPillars = true
}) {
  const hero = document.createElement("div");
  hero.className = "hero-strtgy";
  hero.style.cssText = `
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: white;
    padding: 3rem 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  `;

  // Title
  const h1 = document.createElement("h1");
  h1.textContent = title;
  h1.style.cssText = "margin: 0 0 1rem 0; font-size: 2.5rem; font-weight: 700; line-height: 1.2; color: rgba(255, 255, 255, 0.95);";
  hero.appendChild(h1);

  // Subtitle
  if (subtitle) {
    const sub = document.createElement("p");
    sub.textContent = subtitle;
    sub.style.cssText = "font-size: 1.25rem; margin: 0 0 1.5rem 0; opacity: 0.9; font-weight: 300; color: rgba(255, 255, 255, 0.95);";
    hero.appendChild(sub);
  }

  // Context
  if (context) {
    const ctx = document.createElement("p");
    ctx.textContent = context;
    ctx.style.cssText = "font-size: 1rem; margin: 0 0 1.5rem 0; opacity: 0.8; max-width: 800px; color: rgba(255, 255, 255, 0.95);";
    hero.appendChild(ctx);
  }

  // STRTGY Pillars
  if (showPillars) {
    const pillarsDiv = document.createElement("div");
    pillarsDiv.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255,255,255,0.2);
    `;

    const pillars = [
      { icon: "🎯", label: "Certeza", desc: "Claridad y dirección" },
      { icon: "💰", label: "ROI", desc: "Impacto medible" },
      { icon: "🤝", label: "Socios", desc: "Extensión de tu equipo" },
      { icon: "🔬", label: "Abstracción", desc: "Simplificamos lo complejo" },
      { icon: "⚡", label: "Innovación", desc: "Pragmática y probada" }
    ];

    pillars.forEach(pillar => {
      const card = document.createElement("div");
      card.style.cssText = `
        text-align: center;
        padding: 1rem;
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
        transition: background 0.3s;
      `;
      card.onmouseenter = () => card.style.background = "rgba(255,255,255,0.1)";
      card.onmouseleave = () => card.style.background = "rgba(255,255,255,0.05)";

      const icon = document.createElement("div");
      icon.textContent = pillar.icon;
      icon.style.cssText = "font-size: 2rem; margin-bottom: 0.5rem;";

      const label = document.createElement("div");
      label.textContent = pillar.label;
      label.style.cssText = "font-weight: 600; margin-bottom: 0.25rem;";

      const desc = document.createElement("div");
      desc.textContent = pillar.desc;
      desc.style.cssText = "font-size: 0.875rem; opacity: 0.7;";

      card.append(icon, label, desc);
      pillarsDiv.appendChild(card);
    });

    hero.appendChild(pillarsDiv);
  }

  return hero;
}

/**
 * Decision callout - para destacar decisiones clave
 */
export function decisionCallout({
  title = "¿Qué decidir aquí?",
  items = []
}) {
  const callout = document.createElement("div");
  callout.className = "callout callout-decision";
  callout.style.cssText = `
    background: #fff3e0;
    border-left: 4px solid #ff9800;
    padding: 1.5rem;
    margin: 2rem 0;
    border-radius: 4px;
  `;

  const h3 = document.createElement("h3");
  h3.textContent = title;
  h3.style.cssText = "margin: 0 0 1rem 0; color: #e65100; font-size: 1.25rem;";
  callout.appendChild(h3);

  const ul = document.createElement("ul");
  ul.style.cssText = "margin: 0; padding-left: 1.5rem; color: #333;";
  
  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.style.marginBottom = "0.5rem";
    ul.appendChild(li);
  });

  callout.appendChild(ul);
  return callout;
}

/**
 * Implications callout - para cerrar secciones con implicaciones
 */
export function implicationsCallout({
  title = "Implicaciones y Acciones",
  items = []
}) {
  const callout = document.createElement("div");
  callout.className = "callout callout-implications";
  callout.style.cssText = `
    background: #e8f5e9;
    border-left: 4px solid #4caf50;
    padding: 1.5rem;
    margin: 2rem 0;
    border-radius: 4px;
  `;

  const h3 = document.createElement("h3");
  h3.textContent = title;
  h3.style.cssText = "margin: 0 0 1rem 0; color: #2e7d32; font-size: 1.25rem;";
  callout.appendChild(h3);

  const ul = document.createElement("ul");
  ul.style.cssText = "margin: 0; padding-left: 1.5rem; color: #333;";
  
  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.style.marginBottom = "0.5rem";
    ul.appendChild(li);
  });

  callout.appendChild(ul);
  return callout;
}

/**
 * ROI Metric Card - destacar métricas de impacto
 */
export function roiMetric({
  value,
  label,
  impact,
  trend
}) {
  const card = document.createElement("div");
  card.className = "card roi-card";
  card.style.cssText = `
    background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
    color: white;
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(30,136,229,0.3);
  `;

  const valueDiv = document.createElement("div");
  valueDiv.textContent = value;
  valueDiv.style.cssText = "font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;";
  card.appendChild(valueDiv);

  const labelDiv = document.createElement("div");
  labelDiv.textContent = label;
  labelDiv.style.cssText = "font-size: 1rem; opacity: 0.9; margin-bottom: 0.75rem;";
  card.appendChild(labelDiv);

  if (impact) {
    const impactDiv = document.createElement("div");
    impactDiv.textContent = `💡 ${impact}`;
    impactDiv.style.cssText = "font-size: 0.875rem; opacity: 0.8; margin-top: 0.5rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.2);";
    card.appendChild(impactDiv);
  }

  if (trend) {
    const trendDiv = document.createElement("div");
    trendDiv.textContent = trend;
    trendDiv.style.cssText = `font-size: 0.875rem; margin-top: 0.5rem; color: ${trend.startsWith('+') ? '#81c784' : '#e57373'};`;
    card.appendChild(trendDiv);
  }

  return card;
}

/**
 * Certainty badge - para indicar nivel de confianza
 */
export function certaintyBadge(level) {
  const badge = document.createElement("span");
  badge.style.cssText = `
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    margin-left: 0.5rem;
  `;

  if (level === "high") {
    badge.textContent = "Alta certeza";
    badge.style.background = "#c8e6c9";
    badge.style.color = "#2e7d32";
  } else if (level === "medium") {
    badge.textContent = "Certeza media";
    badge.style.background = "#fff9c4";
    badge.style.color = "#f57f17";
  } else {
    badge.textContent = "Validar";
    badge.style.background = "#ffccbc";
    badge.style.color = "#d84315";
  }

  return badge;
}

/**
 * Section header con estilo STRTGY
 */
export function sectionHeader({
  title,
  subtitle,
  certainty
}) {
  const header = document.createElement("div");
  header.style.cssText = "margin: 3rem 0 1.5rem 0; padding-bottom: 1rem; border-bottom: 2px solid #e0e0e0;";

  const titleLine = document.createElement("div");
  titleLine.style.cssText = "display: flex; align-items: center; margin-bottom: 0.5rem;";

  const h2 = document.createElement("h2");
  h2.textContent = title;
  h2.style.cssText = "margin: 0; font-size: 1.75rem; font-weight: 600;";
  titleLine.appendChild(h2);

  if (certainty) {
    titleLine.appendChild(certaintyBadge(certainty));
  }

  header.appendChild(titleLine);

  if (subtitle) {
    const sub = document.createElement("p");
    sub.textContent = subtitle;
    sub.style.cssText = "margin: 0; color: #666; font-size: 1rem;";
    header.appendChild(sub);
  }

  return header;
}

