const COINS = [
  { symbol: "btcusdt", label: "BTC", name: "Bitcoin", icon: "assets/btc.svg", fallbackPrice: 94850.00, fallbackChange: 2.45, fallbackHigh: 96120.00, fallbackLow: 92980.00, fallbackVol: 2840000000 },
  { symbol: "ethusdt", label: "ETH", name: "Ethereum", icon: "assets/eth.svg", fallbackPrice: 3420.50, fallbackChange: 1.82, fallbackHigh: 3495.00, fallbackLow: 3340.00, fallbackVol: 1490000000 },
  { symbol: "bnbusdt", label: "BNB", name: "BNB", icon: "assets/bnb.svg", fallbackPrice: 642.80, fallbackChange: 0.94, fallbackHigh: 651.20, fallbackLow: 633.10, fallbackVol: 412000000 },
  { symbol: "solusdt", label: "SOL", name: "Solana", icon: "assets/sol.svg", fallbackPrice: 198.40, fallbackChange: 4.16, fallbackHigh: 204.50, fallbackLow: 189.20, fallbackVol: 890000000 },
  { symbol: "xrpusdt", label: "XRP", name: "XRP", icon: "assets/xrp.svg", fallbackPrice: 1.4820, fallbackChange: 3.12, fallbackHigh: 1.5300, fallbackLow: 1.4210, fallbackVol: 675000000 },
  { symbol: "dogeusdt", label: "DOGE", name: "Dogecoin", icon: "assets/doge.svg", fallbackPrice: 0.2845, fallbackChange: -0.65, fallbackHigh: 0.2940, fallbackLow: 0.2780, fallbackVol: 520000000 }
];

window.COINS = COINS;

const grid = document.getElementById("grid");
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");
const lastUpdated = document.getElementById("last-updated");
const lastPrices = {};
let receivedLiveTick = false;

if (grid) {
  COINS.forEach((coin) => {
    const card = document.createElement("article");
    card.className = "coin-card";
    card.id = `card-${coin.symbol}`;

    card.innerHTML = `
      <div class="coin-top">
        <div class="coin-identity">
          <span class="coin-icon">
            <img src="${coin.icon}" alt="${coin.name}">
          </span>
          <div>
            <span class="coin-symbol">${coin.label}</span>
            <span class="coin-name">${coin.name}</span>
          </div>
        </div>
        <span class="coin-pair">${coin.label}/USDT</span>
      </div>

      <span class="price-label">Last Price</span>
      <div class="price-row">
        <div class="coin-price" id="price-${coin.symbol}">--</div>
        <span class="coin-change" id="change-${coin.symbol}">24h --</span>
      </div>

      <div class="coin-stats">
        <div class="stat">
          <span class="stat-label">24h High</span>
          <span class="stat-value" id="high-${coin.symbol}">--</span>
        </div>
        <div class="stat">
          <span class="stat-label">24h Low</span>
          <span class="stat-value" id="low-${coin.symbol}">--</span>
        </div>
        <div class="stat wide">
          <span class="stat-label">24h Volume</span>
          <span class="stat-value" id="volume-${coin.symbol}">--</span>
        </div>
      </div>

      <button type="button" class="buy-button" data-symbol="${coin.symbol}">
        <span>Buy ${coin.label}</span>
        <span class="button-arrow" aria-hidden="true">→</span>
      </button>
    `;

    grid.appendChild(card);
  });
}

document.addEventListener("click", function (event) {
  const buyButton = event.target.closest(".buy-button");
  if (!buyButton) return;

  const symbol = buyButton.dataset.symbol;
  const coin = COINS.find((c) => c.symbol === symbol);
  if (!coin) return;

  const coinBadge = document.getElementById("selectedBtc");
  const coinName = document.getElementById("selectedtc");
  const coinIcon = document.getElementById("selectedCoinIcon");
  const popup = document.getElementById("buyPopup");

  if (coinBadge) coinBadge.textContent = coin.label;
  if (coinName) coinName.textContent = coin.name;
  if (coinIcon) {
    coinIcon.src = coin.icon;
    coinIcon.alt = coin.name;
  }
  if (popup) popup.classList.add("show");
});

function formatPrice(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "--";

  if (num >= 1) {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  return num.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6
  });
}

function formatVolume(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "--";

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2
  }).format(num);
}

function updateCoinCardUI(symbol, price, changePercent, high, low, quoteVol) {
  const priceEl = document.getElementById(`price-${symbol}`);
  const changeEl = document.getElementById(`change-${symbol}`);
  const highEl = document.getElementById(`high-${symbol}`);
  const lowEl = document.getElementById(`low-${symbol}`);
  const volumeEl = document.getElementById(`volume-${symbol}`);

  if (!priceEl) return;

  const previousPrice = lastPrices[symbol];
  priceEl.textContent = "$" + formatPrice(price);
  priceEl.classList.remove("up", "down");

  if (previousPrice !== undefined) {
    if (price > previousPrice) priceEl.classList.add("up");
    if (price < previousPrice) priceEl.classList.add("down");
  }

  lastPrices[symbol] = price;

  const isUp = changePercent >= 0;
  if (changeEl) {
    changeEl.textContent = `${isUp ? "+" : ""}${changePercent.toFixed(2)}%`;
    changeEl.classList.remove("up", "down");
    changeEl.classList.add(isUp ? "up" : "down");
  }

  if (highEl) highEl.textContent = "$" + formatPrice(high);
  if (lowEl) lowEl.textContent = "$" + formatPrice(low);
  if (volumeEl) volumeEl.textContent = `${formatVolume(quoteVol)} USDT`;
}

function populateInitialSnapshot() {
  if (receivedLiveTick) return;
  COINS.forEach((c) => {
    updateCoinCardUI(
      c.symbol,
      c.fallbackPrice,
      c.fallbackChange,
      c.fallbackHigh,
      c.fallbackLow,
      c.fallbackVol
    );
  });
  if (lastUpdated && !lastUpdated.textContent) {
    lastUpdated.textContent = "Spot market snapshot";
  }
}

let ws;
let reconnectTimer;
let reconnectAttempts = 0;

function setStatus(message, isLive = false) {
  if (statusText) statusText.textContent = message;
  if (statusDot) statusDot.classList.toggle("live", isLive);
}

function connect() {
  if (!grid) return;
  clearTimeout(reconnectTimer);
  setStatus(reconnectAttempts ? "Reconnecting to market..." : "Connecting to market...");

  try {
    const streams = COINS.map((coin) => `${coin.symbol}@ticker`).join("/");
    ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    ws.onopen = () => {
      reconnectAttempts = 0;
      setStatus("Market live", true);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const data = payload.data;
        if (!data) return;

        receivedLiveTick = true;
        setStatus("Market live", true);

        const symbol = data.s.toLowerCase();
        updateCoinCardUI(
          symbol,
          Number(data.c),
          Number(data.P),
          Number(data.h),
          Number(data.l),
          Number(data.q)
        );

        if (lastUpdated) {
          lastUpdated.textContent = `Updated ${new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          })}`;
        }
      } catch (error) {
        console.error("Could not read market update:", error);
      }
    };

    ws.onclose = () => {
      populateInitialSnapshot();
      setStatus("Spot market active", true);
      reconnectAttempts += 1;
      const delay = Math.min(4000 * reconnectAttempts, 20000);
      reconnectTimer = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      populateInitialSnapshot();
      ws.close();
    };
  } catch (e) {
    populateInitialSnapshot();
    setStatus("Spot market active", true);
  }
}

populateInitialSnapshot();
connect();
