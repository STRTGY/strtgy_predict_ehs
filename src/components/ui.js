/**
 * UI Components for STRTGY Predict - Observable Framework
 * Pure functions that return DOM elements for interactive dashboards
 */

/**
 * KPI card grid display
 * @param {Array<{label: string, value: string|number, trend?: string, format?: function}>} items
 * @returns {HTMLElement}
 */
export function kpi(items) {
  const wrapper = document.createElement("div");
  wrapper.style.display = "grid";
  wrapper.style.gridTemplateColumns = "repeat(auto-fit, minmax(180px, 1fr))";
  wrapper.style.gap = "12px";

  for (const {label, value, trend, format} of items) {
    const card = document.createElement("div");
    card.className = "card kpi-card";
    
    const h2 = document.createElement("h2");
    const displayValue = format ? format(value) : value;
    h2.textContent = displayValue ?? "—";
    
    const p = document.createElement("p");
    p.textContent = label ?? "";
    p.style.color = "var(--theme-foreground-muted)";
    
    if (trend) {
      const trendSpan = document.createElement("span");
      trendSpan.textContent = ` ${trend}`;
      trendSpan.style.fontSize = "0.75rem";
      trendSpan.style.color = trend.startsWith("+") ? "var(--theme-green)" : "var(--theme-red)";
      p.appendChild(trendSpan);
    }
    
    card.append(h2, p);
    wrapper.append(card);
  }
  return wrapper;
}

/**
 * Generic card component
 * @param {Object} options
 * @param {string} options.title - Card title
 * @param {string|HTMLElement} options.content - Card content
 * @param {string} options.className - Additional CSS classes
 * @returns {HTMLElement}
 */
export function card({title, content, className = ""}) {
  const cardEl = document.createElement("div");
  cardEl.className = `card ${className}`;
  
  if (title) {
    const h3 = document.createElement("h3");
    h3.textContent = title;
    cardEl.appendChild(h3);
  }
  
  if (typeof content === "string") {
    const p = document.createElement("p");
    p.textContent = content;
    cardEl.appendChild(p);
  } else if (content instanceof HTMLElement) {
    cardEl.appendChild(content);
  }
  
  return cardEl;
}

/**
 * Responsive grid layout
 * @param {Array<HTMLElement>} items - Elements to display in grid
 * @param {number} cols - Number of columns (2, 3, or 4)
 * @returns {HTMLElement}
 */
export function grid(items, cols = 2) {
  const wrapper = document.createElement("div");
  wrapper.className = `grid grid-cols-${cols}`;
  
  for (const item of items) {
    wrapper.appendChild(item);
  }
  
  return wrapper;
}

/**
 * Badge component for status/priority indicators
 * @param {string} text - Badge text
 * @param {string} level - "high", "medium", or "low"
 * @returns {HTMLElement}
 */
export function badge(text, level = "medium") {
  const span = document.createElement("span");
  span.className = `badge badge-${level}`;
  span.textContent = text;
  return span;
}

/**
 * Sortable table with export functionality
 * @param {Array<Object>} data - Array of row objects
 * @param {Array<{key: string, label: string, format?: function}>} columns - Column definitions
 * @param {Object} options
 * @param {boolean} options.sortable - Enable sorting (default: true)
 * @param {boolean} options.exportable - Show export button (default: true)
 * @param {number} options.pageSize - Rows per page (0 = no pagination)
 * @returns {HTMLElement}
 */
export function table(data, columns, {sortable = true, exportable = true, pageSize = 0} = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";
  
  // Export button
  if (exportable && data.length > 0) {
    const exportBtn = document.createElement("button");
    exportBtn.textContent = "Exportar CSV";
    exportBtn.style.marginBottom = "8px";
    exportBtn.onclick = () => exportToCSV(data, columns);
    wrapper.appendChild(exportBtn);
  }
  
  // Table element
  const tableEl = document.createElement("table");
  if (sortable) tableEl.className = "sortable";
  
  // Header
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  
  let sortState = {column: null, direction: "asc"};
  let displayData = [...data];
  
  for (const col of columns) {
    const th = document.createElement("th");
    th.textContent = col.label;
    
    if (sortable) {
      th.style.cursor = "pointer";
      th.onclick = () => {
        // Toggle sort direction
        if (sortState.column === col.key) {
          sortState.direction = sortState.direction === "asc" ? "desc" : "asc";
        } else {
          sortState.column = col.key;
          sortState.direction = "asc";
        }
        
        // Sort data
        displayData.sort((a, b) => {
          const aVal = a[col.key];
          const bVal = b[col.key];
          const mult = sortState.direction === "asc" ? 1 : -1;
          
          if (typeof aVal === "number" && typeof bVal === "number") {
            return (aVal - bVal) * mult;
          }
          return String(aVal).localeCompare(String(bVal)) * mult;
        });
        
        // Update header indicators
        thead.querySelectorAll("th").forEach(h => {
          h.classList.remove("sorted-asc", "sorted-desc");
        });
        th.classList.add(`sorted-${sortState.direction}`);
        
        // Re-render tbody
        renderTableBody();
      };
    }
    
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  tableEl.appendChild(thead);
  
  // Body
  const tbody = document.createElement("tbody");
  tableEl.appendChild(tbody);
  
  const renderTableBody = () => {
    tbody.innerHTML = "";
    const dataToShow = pageSize > 0 ? displayData.slice(0, pageSize) : displayData;
    
    for (const row of dataToShow) {
      const tr = document.createElement("tr");
      for (const col of columns) {
        const td = document.createElement("td");
        const value = row[col.key];
        const displayValue = col.format ? col.format(value, row) : value;
        
        if (displayValue instanceof HTMLElement) {
          td.appendChild(displayValue);
        } else {
          td.textContent = displayValue ?? "—";
        }
        
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
  };
  
  renderTableBody();
  wrapper.appendChild(tableEl);
  
  return wrapper;
}

/**
 * Export data to CSV
 * @param {Array<Object>} data 
 * @param {Array<{key: string, label: string}>} columns 
 */
function exportToCSV(data, columns) {
  const headers = columns.map(c => c.label).join(",");
  const rows = data.map(row => 
    columns.map(col => {
      const val = row[col.key];
      const str = String(val ?? "");
      return str.includes(",") ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(",")
  );
  
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `export_${Date.now()}.csv`;
  link.click();
}

/**
 * Map legend component
 * @param {Array<{color: string, label: string}>} items 
 * @param {string} title 
 * @returns {HTMLElement}
 */
export function legend(items, title = "Leyenda") {
  const wrapper = document.createElement("div");
  wrapper.className = "map-legend";
  
  const h4 = document.createElement("h4");
  h4.textContent = title;
  wrapper.appendChild(h4);
  
  for (const {color, label} of items) {
    const item = document.createElement("div");
    item.className = "map-legend-item";
    
    const colorBox = document.createElement("div");
    colorBox.className = "map-legend-color";
    colorBox.style.backgroundColor = color;
    
    const labelSpan = document.createElement("span");
    labelSpan.textContent = label;
    
    item.append(colorBox, labelSpan);
    wrapper.appendChild(item);
  }
  
  return wrapper;
}

/**
 * Format number as locale string
 * @param {number} num 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatNumber(num, decimals = 0) {
  if (num == null || isNaN(num)) return "—";
  return num.toLocaleString("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format number as percentage
 * @param {number} num 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatPercent(num, decimals = 1) {
  if (num == null || isNaN(num)) return "—";
  return `${(num * 100).toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export function truncate(text, maxLength = 50) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}
