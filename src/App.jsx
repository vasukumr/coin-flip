import React, { useEffect, useMemo, useRef, useState } from "react";
import { APP_CONFIG } from "./config";

const START_BALANCE = APP_CONFIG.totalBalance;
const TARGET_BALANCE = 250;
const GAME_DURATION = APP_CONFIG.timeMinutes * 60;
const CURRENCY_SYMBOL = APP_CONFIG.currencySymbol;
const DEFAULT_THEME = APP_CONFIG.defaultTheme === "dark" ? "dark" : "light";
const FLIP_ANIMATION_MS = APP_CONFIG.flipAnimationMs;
const RESULT_REVEAL_MS = APP_CONFIG.resultRevealMs;
const MIN_BET = 1;

const SAFE_BIAS_PERCENT = Math.min(100, Math.max(0, Number(APP_CONFIG.biasPercent ?? 60)));
const BIAS_RATE = SAFE_BIAS_PERCENT / 100;
const CONFIG_BIAS_SIDE = String(APP_CONFIG.biasSide ?? "heads").toLowerCase();
const BIAS_SIDE = CONFIG_BIAS_SIDE === "tails" ? "tails" : "heads";
const NON_BIAS_SIDE = BIAS_SIDE === "heads" ? "tails" : "heads";
const BIAS_SIDE_LABEL = BIAS_SIDE.charAt(0).toUpperCase() + BIAS_SIDE.slice(1);
const BIAS_PERCENT_LABEL = Number.isInteger(SAFE_BIAS_PERCENT)
  ? String(SAFE_BIAS_PERCENT)
  : String(toMoneyPrecision(SAFE_BIAS_PERCENT));

function toMoneyPrecision(value) {
  return Math.round(value * 100) / 100;
}

function formatMoney(value) {
  return `${CURRENCY_SYMBOL}${value.toFixed(2)}`;
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(safe % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function getInsight({ balance, rounds, totalBet, hitTarget }) {
  const avgBet = rounds ? totalBet / rounds : 0;
  const avgBetRatio = avgBet / START_BALANCE;

  if (!hitTarget && balance <= 0 && avgBetRatio >= 0.25) {
    return "You lost with a winning edge because your bet sizing was too aggressive.";
  }
  if (!hitTarget && balance <= 0 && avgBetRatio < 0.15) {
    return "You played safer, but short-term variance still beat you this run.";
  }
  if (hitTarget && avgBetRatio < 0.14) {
    return "Disciplined risk management helped you compound to the target.";
  }
  if (hitTarget && avgBetRatio >= 0.2) {
    return "You reached the target, but your approach had high drawdown risk.";
  }

  return "The edge matters less than position sizing over many rounds.";
}

export default function App() {
  const [view, setView] = useState("landing");
  const [viewBeforeAbout, setViewBeforeAbout] = useState("landing");
  const [theme, setTheme] = useState(() => localStorage.getItem("trap-theme") || DEFAULT_THEME);

  const [balance, setBalance] = useState(START_BALANCE);
  const [bet, setBet] = useState("");
  const [rounds, setRounds] = useState(0);
  const [lastBet, setLastBet] = useState(0);
  const [selectedSide, setSelectedSide] = useState("");
  const [status, setStatus] = useState("Pick a side and place your bet.");
  const [statusType, setStatusType] = useState("neutral");
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState([]);
  const [timer, setTimer] = useState(GAME_DURATION);
  const [gameTickSeed, setGameTickSeed] = useState(0);

  const [peakBalance, setPeakBalance] = useState(START_BALANCE);
  const [winStreak, setWinStreak] = useState(0);
  const [lossStreak, setLossStreak] = useState(0);
  const [maxWinStreak, setMaxWinStreak] = useState(0);
  const [maxLossStreak, setMaxLossStreak] = useState(0);
  const [totalBet, setTotalBet] = useState(0);

  const [showRoundModal, setShowRoundModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("Flipping your coin...");
  const [shareFeedback, setShareFeedback] = useState("");
  const timerRef = useRef(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("trap-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (view !== "game") {
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [view, gameTickSeed]);

  useEffect(() => {
    if (view === "game" && timer === 0) {
      finishGame(false);
    }
  }, [timer, view]);

  const betAmount = useMemo(() => {
    const parsed = Number(bet);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [bet]);

  const canFlip = useMemo(
    () => view === "game" && !isFlipping && Boolean(selectedSide) && betAmount >= MIN_BET && betAmount <= balance,
    [view, isFlipping, selectedSide, betAmount, balance]
  );

  function resetGame() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setBalance(START_BALANCE);
    setBet("");
    setLastBet(0);
    setRounds(0);
    setSelectedSide("");
    setStatus("Pick a side and place your bet.");
    setStatusType("neutral");
    setHistory([]);
    setTimer(GAME_DURATION);
    setPeakBalance(START_BALANCE);
    setWinStreak(0);
    setLossStreak(0);
    setMaxWinStreak(0);
    setMaxLossStreak(0);
    setTotalBet(0);
    setIsFlipping(false);
    setShowRoundModal(false);
    setShareFeedback("");
    setTimer(GAME_DURATION);
    setGameTickSeed((prev) => prev + 1);
    setView("game");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function adjustBet(next) {
    const clamped = Math.max(MIN_BET, Math.min(next, balance));
    const normalized = toMoneyPrecision(clamped);
    if (!Number.isFinite(normalized)) {
      return;
    }
    setBet(String(normalized));
    setLastBet(normalized);
  }

  function finishGame(hitTarget) {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsFlipping(false);
    setShowRoundModal(false);
    setShareFeedback("");
    setView("result");
    setStatusType(hitTarget ? "win" : "loss");
    setStatus(hitTarget ? "You hit the target." : "You did not reach the target.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function flipCoin() {
    if (!selectedSide) {
      setStatus("Select heads or tails first.");
      setStatusType("loss");
      return;
    }

    if (betAmount < MIN_BET) {
      setStatus("Enter your bet amount first.");
      setStatusType("loss");
      return;
    }

    if (betAmount > balance) {
      setStatus("Bet cannot exceed your balance.");
      setStatusType("loss");
      return;
    }

    if (!canFlip) {
      return;
    }

    const roundBet = toMoneyPrecision(betAmount);

    setIsFlipping(true);
    setShowRoundModal(true);
    setModalMessage("Flipping your coin...");

    window.setTimeout(() => {
      const resultSide = Math.random() < BIAS_RATE ? BIAS_SIDE : NON_BIAS_SIDE;
      const didWin = selectedSide === resultSide;
      const nextBalance = toMoneyPrecision(didWin ? balance + roundBet : balance - roundBet);
      const nextRounds = rounds + 1;

      setBalance(nextBalance);
      setRounds(nextRounds);
      setPeakBalance((prev) => Math.max(prev, nextBalance));
      setTotalBet((prev) => prev + roundBet);
      setHistory((prev) => [
        {
          id: nextRounds,
          pick: selectedSide,
          amount: roundBet,
          result: resultSide,
          won: didWin,
          ending: nextBalance,
        },
        ...prev,
      ]);

      if (didWin) {
        const nextWinStreak = winStreak + 1;
        setWinStreak(nextWinStreak);
        setLossStreak(0);
        setMaxWinStreak((prev) => Math.max(prev, nextWinStreak));
        setStatus(`You won ${formatMoney(roundBet)}.`);
        setStatusType("win");
        setModalMessage("Nice flip, you won.");
      } else {
        const nextLossStreak = lossStreak + 1;
        setLossStreak(nextLossStreak);
        setWinStreak(0);
        setMaxLossStreak((prev) => Math.max(prev, nextLossStreak));
        setStatus(`Sorry, you lose. It was ${resultSide}.`);
        setStatusType("loss");
        setModalMessage(`Sorry, you lose. It was ${resultSide}.`);
      }

      setIsFlipping(false);

      window.setTimeout(() => {
        setShowRoundModal(false);

        if (nextBalance <= 0) {
          finishGame(false);
          return;
        }

        if (nextBalance >= TARGET_BALANCE) {
          finishGame(true);
          return;
        }

        const nextBet = toMoneyPrecision(Math.min(roundBet, Math.max(MIN_BET, nextBalance)));
        setBet(String(nextBet));
      }, RESULT_REVEAL_MS);
    }, FLIP_ANIMATION_MS);
  }

  const insight = useMemo(
    () => getInsight({ balance, rounds, totalBet, hitTarget: balance >= TARGET_BALANCE }),
    [balance, rounds, totalBet]
  );

  const shareText = useMemo(() => {
    if (balance >= TARGET_BALANCE) {
      return `I reached ${formatMoney(balance)} in TrueOdds (${BIAS_PERCENT_LABEL}% ${BIAS_SIDE_LABEL} bias). Can you do better?`;
    }
    return `I lost in a ${BIAS_PERCENT_LABEL}% ${BIAS_SIDE_LABEL} biased coin game with ${formatMoney(balance)} left. Try TrueOdds.`;
  }, [balance]);

  async function copyShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "TrueOdds 60% Trap",
          text: shareText,
        });
        setShareFeedback("Shared successfully.");
        return;
      } catch (error) {
        if (error?.name === "AbortError") {
          setShareFeedback("Share canceled.");
          return;
        }
      }
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    const whatsappWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (whatsappWindow) {
      setShareFeedback("Opening WhatsApp...");
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setShareFeedback("Share text copied.");
        return;
      }

      throw new Error("Clipboard API unavailable");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareText;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();

      const didCopy = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (didCopy) {
        setShareFeedback("Share text copied.");
      } else {
        setShareFeedback(`Copy failed. Text: ${shareText}`);
      }
    }
  }

  function toggleAboutView() {
    if (view === "about") {
      setView(viewBeforeAbout || "landing");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setViewBeforeAbout(view);
    setView("about");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBackFromAbout() {
    setView(viewBeforeAbout || "landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <div className="app-bg" />
      <main className="app-shell">
        <header className="topbar card">
          <div className="brand-wrap">
            <h1>TrueOdds</h1>
            <p>60% Trap</p>
          </div>
          <div className="top-actions">
            <button
              type="button"
              className="icon-btn theme-icon-btn"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "☀" : "🌙"}
            </button>
            <button
              type="button"
              className="icon-btn menu-icon-btn"
              aria-label={view === "about" ? "Close about" : "Open about"}
              onClick={toggleAboutView}
            >
              {view === "about" ? "×" : "≡"}
            </button>
          </div>
        </header>

        {view === "landing" && (
          <section className="card panel landing landing-panel">
            <p className="eyebrow">Probability Simulation</p>
            <h2>One side wins {BIAS_PERCENT_LABEL}% of flips. Can you make money?</h2>
            <p className="muted">Play fast. Learn why bet sizing can destroy a good edge.</p>
            <p className="start-note">
              Note: {BIAS_SIDE_LABEL} has a fixed {BIAS_PERCENT_LABEL}% chance on every flip, regardless of your selection.
            </p>
            <button className="primary-btn" type="button" onClick={resetGame}>
              Start Playing
            </button>
            <p className="copyright">© {currentYear} Vasu Kumar</p>
          </section>
        )}

        {view === "about" && (
          <section className="card panel about-panel">
            <p className="eyebrow">About</p>
            <h2>Game Rules</h2>
            <ol className="rules-list">
              <li>Starting balance is {formatMoney(START_BALANCE)}.</li>
              <li>{BIAS_SIDE_LABEL} lands {BIAS_PERCENT_LABEL}% of the time on every flip.</li>
              <li>You choose Heads or Tails before each bet.</li>
              <li>You can enter decimal bets, minimum {formatMoney(MIN_BET)}.</li>
              <li>If your pick matches the flip result, you win your bet amount.</li>
              <li>If your pick is wrong, you lose your bet amount.</li>
              <li>Game ends at {formatMoney(0)}, target {formatMoney(TARGET_BALANCE)}, or when time runs out.</li>
            </ol>
            <button type="button" className="primary-btn" onClick={goBackFromAbout}>
              Back
            </button>
            <p className="copyright">© {currentYear} Vasu Kumar</p>
          </section>
        )}

        {view === "game" && (
          <section className="card panel game-panel">
            <h2 className="timer">Time Remaining: {formatTime(timer)}</h2>

            <div className="game-card">
              <h3>Place your bet and flip the coin!</h3>

              <div className="coin-grid">
                {[
                  { id: "heads", label: "Heads" },
                  { id: "tails", label: "Tails" },
                ].map((coin) => (
                  <button
                    key={coin.id}
                    type="button"
                    className={`coin-btn ${selectedSide === coin.id ? "active" : ""}`}
                    onClick={() => setSelectedSide(coin.id)}
                  >
                    <span className="coin-face">{coin.id === "heads" ? "H" : "T"}</span>
                    <span>{coin.label.toUpperCase()}</span>
                  </button>
                ))}
              </div>

              <label htmlFor="betInput" className="bet-label">
                Your bet:
              </label>
              <div className="bet-input-row">
                <button type="button" className="step-btn" onClick={() => adjustBet(betAmount - 1)}>
                  -
                </button>
                <input
                  id="betInput"
                  className="bet-input"
                  type="number"
                  min={MIN_BET}
                  max={toMoneyPrecision(balance)}
                  step="0.1"
                  inputMode="decimal"
                  value={bet}
                  placeholder="Type bet"
                  onChange={(e) => {
                    const raw = e.target.value.replace(",", ".");
                    if (raw === "") {
                      setBet("");
                      return;
                    }

                    if (!/^\d*\.?\d{0,2}$/.test(raw)) {
                      return;
                    }

                    const next = Number(raw);
                    if (!Number.isFinite(next)) {
                      return;
                    }

                    setBet(raw);
                  }}
                />
                <button type="button" className="step-btn" onClick={() => adjustBet(betAmount + 1)}>
                  +
                </button>
              </div>

              <div className="balance-inline">
                <h4 className="balance-label">Balance:</h4>
                <p className="balance-amount">{formatMoney(balance)}</p>
              </div>

              <div className="game-actions">
                <button type="button" className="cta-btn" disabled={!canFlip} onClick={flipCoin}>
                  BET
                </button>
                <button
                  type="button"
                  className="outline-btn"
                  onClick={() => finishGame(balance >= TARGET_BALANCE)}
                >
                  FINISH GAME
                </button>
              </div>

              <p className={`status ${statusType}`}>{status}</p>
              <p className="mini">Rounds: {rounds} | Last bet: {lastBet > 0 ? formatMoney(lastBet) : "-"}</p>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Your Bet</th>
                      <th>Bet Amount</th>
                      <th>Result</th>
                      <th>Ending Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(0, 8).map((row) => (
                      <tr key={row.id + row.pick + row.amount}>
                        <td>{row.pick}</td>
                        <td>{formatMoney(row.amount)}</td>
                        <td>{row.result}</td>
                        <td>{formatMoney(row.ending)}</td>
                      </tr>
                    ))}
                    {!history.length && (
                      <tr>
                        <td colSpan="4" className="empty">
                          No rounds yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {view === "result" && (
          <section className="card panel result-panel">
            <h2>Your Results</h2>
            <p className="muted">{balance >= TARGET_BALANCE ? "You reached the target." : "You were trapped."}</p>

            <div className="metrics-compact">
              <div className="metric-row">
                <span>Final Balance</span>
                <strong>{formatMoney(balance)}</strong>
              </div>
              <div className="metric-row">
                <span>Total Rounds</span>
                <strong>{rounds}</strong>
              </div>
              <div className="metric-row">
                <span>Peak Balance</span>
                <strong>{formatMoney(peakBalance)}</strong>
              </div>
              <div className="metric-row">
                <span>Max Win Streak</span>
                <strong>{maxWinStreak}</strong>
              </div>
              <div className="metric-row">
                <span>Max Loss Streak</span>
                <strong>{maxLossStreak}</strong>
              </div>
            </div>

            <p className="insight">{insight}</p>

            <div className="result-actions">
              <button type="button" className="primary-btn" onClick={resetGame}>
                Play Again
              </button>
              <button type="button" className="outline-btn" onClick={copyShare}>
                Share Result
              </button>
            </div>
            {shareFeedback && <p className="share-feedback">{shareFeedback}</p>}
            <p className="copyright">© {currentYear} Vasu Kumar</p>
          </section>
        )}
      </main>

      {showRoundModal && (
        <div className="overlay">
          <div className="overlay-card">
            <div className="spinner" />
            <h3>{isFlipping ? "Flipping your coin..." : modalMessage}</h3>
          </div>
        </div>
      )}
    </>
  );
}
