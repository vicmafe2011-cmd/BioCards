import { useEffect, useMemo, useState } from "react";
import { categories, getPower, figures, statMeta } from "./data/figures";
import "./App.css";

const views = [
  { id: "collection", label: "Colección", icon: "▦" },
  { id: "duel", label: "Arena de duelo", icon: "⚔" },
  { id: "ranking", label: "Ranking", icon: "♛" },
  { id: "rules", label: "Cómo jugar", icon: "?" },
];

const storageKeys = {
  owned: "biocards-owned",
  wins: "biocards-wins",
  challenges: "biocards-challenges",
};

function loadStoredArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function loadStoredObject(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function Logo({ compact = false }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`}>
      <span className="brand__mark" aria-hidden="true">
        <span>B</span>
      </span>
      <span className="brand__copy">
        <b><em>MIMOA PAPER</em> BioCards</b>
        <small>Descifradores de la vida</small>
      </span>
    </div>
  );
}

function StatOrb({ stat, value, active = false }) {
  const meta = statMeta[stat];
  return (
    <span
      className={`stat-orb ${active ? "is-active" : ""}`}
      style={{ "--stat-color": meta.color }}
    >
      <small>{meta.short}</small>
      <b>{value}</b>
    </span>
  );
}

function CardTile({
  figure,
  owned,
  selected,
  onOpen,
  onToggleOwned,
}) {
  return (
    <article
      className={`card-tile ${selected ? "is-selected" : ""}`}
      style={{ "--card-accent": figure.color }}
    >
      <button
        className="card-tile__art"
        type="button"
        onClick={onOpen}
        aria-label={`Abrir la ficha de ${figure.name}`}
      >
        <img src={figure.image} alt={`BioCard de ${figure.name}`} loading="lazy" />
        <span className="card-tile__shine" aria-hidden="true" />
        <span className="card-tile__open">Ver ficha</span>
      </button>
      <div className="card-tile__footer">
        <div>
          <span>BC-{String(figure.number).padStart(3, "0")}/016</span>
          <b>PB {getPower(figure)}</b>
        </div>
        <button
          type="button"
          className={`owned-button ${owned ? "is-owned" : ""}`}
          onClick={onToggleOwned}
          aria-pressed={owned}
        >
          <span aria-hidden="true">{owned ? "✓" : "+"}</span>
          {owned ? "Conseguida" : "La tengo"}
        </button>
      </div>
    </article>
  );
}

function CardDossier({ figure, owned, challengeDone, onToggleOwned, onToggleChallenge, onDuel }) {
  return (
    <section className="dossier" style={{ "--card-accent": figure.color }}>
      <div className="dossier__image-wrap">
        <img src={figure.image} alt={`Carta completa de ${figure.name}`} />
      </div>
      <div className="dossier__content">
        <div className="eyebrow">
          <span>Perfil BC-{String(figure.number).padStart(3, "0")}/016</span>
          <span>{figure.category}</span>
        </div>
        <h2>{figure.name}</h2>
        <p className="dossier__dates">{figure.dates} · Legendaria</p>
        <p className="dossier__field">{figure.field}</p>
        <p className="dossier__epithet">{figure.epithet}</p>
        <p className="dossier__summary">{figure.summary}</p>
        <blockquote className="dossier__question">{figure.question}</blockquote>

        <div className="dossier__stats" aria-label="Atributos de la carta">
          <StatOrb stat="obs" value={figure.obs} />
          <StatOrb stat="des" value={figure.des} />
          <StatOrb stat="imp" value={figure.imp} />
          <span className="power-total">
            <small>Poder biológico</small>
            <b>{getPower(figure)}</b>
          </span>
        </div>

        <div className="ability-card">
          <span>Habilidad especial</span>
          <h3>{figure.ability}</h3>
          <p>{figure.effect}</p>
        </div>

        <div className={`challenge-card ${challengeDone ? "is-done" : ""}`}>
          <span>Reto del álbum</span>
          <p>{figure.challenge}</p>
          <small>{figure.cue}</small>
          <button type="button" onClick={onToggleChallenge} aria-pressed={challengeDone}>
            {challengeDone ? "✓ Reto superado" : "Marcar como superado"}
          </button>
        </div>

        <div className="dossier__actions">
          <button type="button" className="button button--gold" onClick={onDuel}>
            Llevar a la arena
          </button>
          <button
            type="button"
            className={`button button--ghost ${owned ? "is-owned" : ""}`}
            onClick={onToggleOwned}
          >
            {owned ? "✓ Carta conseguida" : "+ Añadir a mi colección"}
          </button>
        </div>
      </div>
    </section>
  );
}

function FighterCard({ label, figure, selectedStat, score }) {
  return (
    <div
      className={`fighter ${figure ? "has-card" : ""}`}
      style={{ "--card-accent": figure?.color || "#6e8294" }}
    >
      <div className="fighter__label">
        <span>{label}</span>
        <b>{score} victorias</b>
      </div>
      {figure ? (
        <>
          <img src={figure.image} alt={`Carta elegida: ${figure.name}`} />
          <div className="fighter__stats">
            {Object.keys(statMeta).map((stat) => (
              <StatOrb
                key={stat}
                stat={stat}
                value={figure[stat]}
                active={selectedStat === stat}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="fighter__empty">
          <span aria-hidden="true">B</span>
          <p>Selecciona una BioCard</p>
        </div>
      )}
    </div>
  );
}

function ScorePips({ rounds, side }) {
  return (
    <span className="score-pips" aria-label={`${side === "A" ? "Jugador uno" : "Jugador dos"}: ${rounds.filter((round) => round.winner === side).length} rondas`}>
      {[0, 1, 2].map((position) => {
        const won = rounds.filter((round) => round.winner === side).length > position;
        return <i key={position} className={won ? "is-won" : ""} />;
      })}
    </span>
  );
}

function App() {
  const [view, setView] = useState("collection");
  const [owned, setOwned] = useState(() => new Set(loadStoredArray(storageKeys.owned)));
  const [wins, setWins] = useState(() => loadStoredObject(storageKeys.wins));
  const [completedChallenges, setCompletedChallenges] = useState(
    () => new Set(loadStoredArray(storageKeys.challenges)),
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [selectedId, setSelectedId] = useState("aristoteles");
  const [fighterAId, setFighterAId] = useState(null);
  const [fighterBId, setFighterBId] = useState(null);
  const [selectedStat, setSelectedStat] = useState("obs");
  const [rounds, setRounds] = useState([]);
  const [abilityA, setAbilityA] = useState(false);
  const [abilityB, setAbilityB] = useState(false);
  const [reasonA, setReasonA] = useState("");
  const [reasonB, setReasonB] = useState("");
  const [duelOutcome, setDuelOutcome] = useState(null);

  useEffect(() => {
    localStorage.setItem(storageKeys.owned, JSON.stringify([...owned]));
  }, [owned]);

  useEffect(() => {
    localStorage.setItem(storageKeys.wins, JSON.stringify(wins));
  }, [wins]);

  useEffect(() => {
    localStorage.setItem(storageKeys.challenges, JSON.stringify([...completedChallenges]));
  }, [completedChallenges]);

  const selectedFigure =
    figures.find((figure) => figure.id === selectedId) || figures[0];
  const fighterA = figures.find((figure) => figure.id === fighterAId) || null;
  const fighterB = figures.find((figure) => figure.id === fighterBId) || null;

  const filteredFigures = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es");
    return figures.filter((figure) => {
      const matchesCategory = category === "Todas" || figure.category === category;
      const matchesSearch =
        !normalizedSearch ||
        `${figure.name} ${figure.category} ${figure.ability}`
          .toLocaleLowerCase("es")
          .includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const ranking = useMemo(
    () =>
      [...figures].sort(
        (a, b) => (wins[b.id] || 0) - (wins[a.id] || 0) || getPower(b) - getPower(a),
      ),
    [wins],
  );

  const usedStats = rounds.map((round) => round.stat);
  const scoreA = rounds.filter((round) => round.winner === "A").length;
  const scoreB = rounds.filter((round) => round.winner === "B").length;
  const totalDuels = Object.values(wins).reduce((total, value) => total + Number(value || 0), 0);
  const canActivateA = fighterA?.abilityStat === selectedStat;
  const canActivateB = fighterB?.abilityStat === selectedStat;
  const validReasonA = reasonA.trim().length >= 12;
  const validReasonB = reasonB.trim().length >= 12;

  function changeView(nextView) {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleSetValue(setter, id) {
    setter((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function resetRoundControls(nextStat) {
    setSelectedStat(nextStat || "obs");
    setAbilityA(false);
    setAbilityB(false);
    setReasonA("");
    setReasonB("");
  }

  function resetDuel(keepFighters = true) {
    setRounds([]);
    setDuelOutcome(null);
    resetRoundControls("obs");
    if (!keepFighters) {
      setFighterAId(null);
      setFighterBId(null);
    }
  }

  function setFighter(side, id) {
    if (side === "A") {
      setFighterAId(id);
      if (fighterBId === id) setFighterBId(null);
    } else {
      setFighterBId(id);
      if (fighterAId === id) setFighterAId(null);
    }
    resetDuel(true);
  }

  function takeToArena(figure) {
    setFighterAId(figure.id);
    if (fighterBId === figure.id) setFighterBId(null);
    resetDuel(true);
    changeView("duel");
  }

  function chooseRandomOpponent() {
    if (!fighterA) return;
    const available = figures.filter((figure) => figure.id !== fighterA.id);
    const opponent = available[Math.floor(Math.random() * available.length)];
    setFighterBId(opponent.id);
    resetDuel(true);
  }

  function resolveRound() {
    if (!fighterA || !fighterB || usedStats.includes(selectedStat) || duelOutcome) return;

    const bonusA = abilityA && canActivateA && validReasonA ? 3 : 0;
    const bonusB = abilityB && canActivateB && validReasonB ? 3 : 0;
    const totalA = fighterA[selectedStat] + bonusA;
    const totalB = fighterB[selectedStat] + bonusB;
    const winner = totalA === totalB ? "tie" : totalA > totalB ? "A" : "B";
    const newRound = {
      number: rounds.length + 1,
      stat: selectedStat,
      winner,
      totalA,
      totalB,
      bonusA,
      bonusB,
    };
    const nextRounds = [...rounds, newRound];
    setRounds(nextRounds);

    const nextScoreA = nextRounds.filter((round) => round.winner === "A").length;
    const nextScoreB = nextRounds.filter((round) => round.winner === "B").length;
    const duelFinished =
      nextScoreA === 2 ||
      nextScoreB === 2 ||
      nextRounds.length === Object.keys(statMeta).length;

    if (duelFinished) {
      let winningSide = null;
      let reason = "Resultado por rondas";
      if (nextScoreA > nextScoreB) winningSide = "A";
      else if (nextScoreB > nextScoreA) winningSide = "B";
      else if (getPower(fighterA) > getPower(fighterB)) {
        winningSide = "A";
        reason = "Desempate por poder biológico total";
      } else if (getPower(fighterB) > getPower(fighterA)) {
        winningSide = "B";
        reason = "Desempate por poder biológico total";
      }

      const winnerCard = winningSide === "A" ? fighterA : winningSide === "B" ? fighterB : null;
      setDuelOutcome({ winningSide, winnerCard, reason });
      if (winnerCard) {
        setWins((current) => ({
          ...current,
          [winnerCard.id]: (current[winnerCard.id] || 0) + 1,
        }));
      }
      return;
    }

    const nextStat = Object.keys(statMeta).find(
      (stat) => !nextRounds.some((round) => round.stat === stat),
    );
    resetRoundControls(nextStat);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="topbar__brand" href="#inicio" aria-label="Ir al inicio">
          <Logo compact />
        </a>
        <nav aria-label="Navegación principal">
          {views.map((item) => (
            <button
              key={item.id}
              type="button"
              className={view === item.id ? "is-active" : ""}
              onClick={() => changeView(item.id)}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="topbar__progress">
          <span>{owned.size}/16</span>
          <small>coleccionadas</small>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero__grid" aria-hidden="true" />
          <div className="hero__orbit hero__orbit--one" aria-hidden="true" />
          <div className="hero__orbit hero__orbit--two" aria-hidden="true" />
          <div className="hero__content">
            <span className="hero__kicker">MIMOA PAPER · Learning Cards · Serie 01</span>
            <h1>
              La vida
              <br />
              también tiene <em>poder.</em>
            </h1>
            <p>
              Colecciona a 16 grandes figuras de la biología. Domina la observación,
              el descubrimiento y el impacto. Justifica tu habilidad y conquista la arena.
            </p>
            <div className="hero__actions">
              <button type="button" className="button button--gold" onClick={() => changeView("duel")}>
                Entrar en la arena <span aria-hidden="true">→</span>
              </button>
              <button type="button" className="button button--line" onClick={() => changeView("collection")}>
                Explorar las cartas
              </button>
            </div>
            <div className="hero__numbers">
              <span><b>16</b><small>cartas legendarias</small></span>
              <span><b>{owned.size}</b><small>en tu colección</small></span>
              <span><b>{completedChallenges.size}</b><small>retos superados</small></span>
            </div>
          </div>
          <div className="hero__cards" aria-label="Muestra de cartas de la colección">
            <img className="hero__card hero__card--left" src={figures[5].image} alt="BioCard de Charles Darwin" />
            <img className="hero__card hero__card--center" src={figures[8].image} alt="BioCard de Santiago Ramón y Cajal" />
            <img className="hero__card hero__card--right" src={figures[13].image} alt="BioCard de Jane Goodall" />
            <span className="hero__pm">PB 297<small>Poder máximo</small></span>
          </div>
        </section>

        <section className="formula-strip" aria-label="Fórmula del poder biológico">
          <div>
            <span>Poder biológico</span>
            <b>PB</b>
          </div>
          <i>=</i>
          {Object.entries(statMeta).map(([key, meta], index) => (
            <div className="formula-strip__stat" key={key} style={{ "--stat-color": meta.color }}>
              <b>{meta.short}</b>
              <span>{meta.name}</span>
              {index < 2 && <i>+</i>}
            </div>
          ))}
          <p>La cifra abre el duelo. La explicación activa la habilidad.</p>
        </section>

        {view === "collection" && (
          <section className="section collection-section">
            <div className="section-heading">
              <div>
                <span className="section-heading__number">01</span>
                <div>
                  <span className="section-heading__kicker">Descifradores de la vida</span>
                  <h2>Grandes figuras de la biología</h2>
                </div>
              </div>
              <p>
                Marca las cartas físicas que ya tienes y abre cada ficha para descubrir
                su reto, habilidad y poder biológico.
              </p>
            </div>

            <div className="collection-tools">
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <span className="sr-only">Buscar cartas</span>
                <input
                  type="search"
                  placeholder="Buscar figura, etapa o habilidad"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <div className="category-filters" aria-label="Filtrar por categoría">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={category === item ? "is-active" : ""}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <span className="collection-count">{filteredFigures.length} cartas</span>
            </div>

            {filteredFigures.length ? (
              <div className="card-grid">
                {filteredFigures.map((figure) => (
                  <CardTile
                    key={figure.id}
                    figure={figure}
                    owned={owned.has(figure.id)}
                    selected={selectedFigure.id === figure.id}
                    onOpen={() => setSelectedId(figure.id)}
                    onToggleOwned={() => toggleSetValue(setOwned, figure.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-results">
                <span>∅</span>
                <h3>No encontramos esa BioCard</h3>
                <button type="button" onClick={() => { setSearch(""); setCategory("Todas"); }}>
                  Limpiar filtros
                </button>
              </div>
            )}

            <CardDossier
              figure={selectedFigure}
              owned={owned.has(selectedFigure.id)}
              challengeDone={completedChallenges.has(selectedFigure.id)}
              onToggleOwned={() => toggleSetValue(setOwned, selectedFigure.id)}
              onToggleChallenge={() => toggleSetValue(setCompletedChallenges, selectedFigure.id)}
              onDuel={() => takeToArena(selectedFigure)}
            />
          </section>
        )}

        {view === "duel" && (
          <section className="section arena-section">
            <div className="section-heading section-heading--light">
              <div>
                <span className="section-heading__number">02</span>
                <div>
                  <span className="section-heading__kicker">El duelo de la vida</span>
                  <h2>Arena de duelo</h2>
                </div>
              </div>
              <p>
                Gana dos de tres rondas. La habilidad solo suma +3 cuando el atributo
                coincide y la explicación tiene suficiente fundamento.
              </p>
            </div>

            <div className="fighter-selectors">
              <label>
                <span>BioCard A</span>
                <select value={fighterAId || ""} onChange={(event) => setFighter("A", event.target.value || null)}>
                  <option value="">Selecciona una carta</option>
                  {figures.map((figure) => (
                    <option key={figure.id} value={figure.id}>
                      {figure.name} · PB {getPower(figure)}
                    </option>
                  ))}
                </select>
              </label>
              <span className="versus-badge">VS</span>
              <label>
                <span>BioCard B</span>
                <select value={fighterBId || ""} onChange={(event) => setFighter("B", event.target.value || null)}>
                  <option value="">Selecciona una carta</option>
                  {figures.map((figure) => (
                    <option key={figure.id} value={figure.id}>
                      {figure.name} · PB {getPower(figure)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="random-button"
                onClick={chooseRandomOpponent}
                disabled={!fighterA}
              >
                ↻ Rival aleatorio
              </button>
            </div>

            <div className="arena-board">
              <div className="arena-board__score">
                <ScorePips rounds={rounds} side="A" />
                <span>
                  Ronda {duelOutcome ? "finalizada" : Math.min(rounds.length + 1, 3)}
                  <small>{rounds.length}/3 disputadas</small>
                </span>
                <ScorePips rounds={rounds} side="B" />
              </div>

              <div className="arena-board__fighters">
                <FighterCard label="Jugador uno" figure={fighterA} selectedStat={selectedStat} score={scoreA} />
                <div className="arena-board__versus">
                  <span>×</span>
                </div>
                <FighterCard label="Jugador dos" figure={fighterB} selectedStat={selectedStat} score={scoreB} />
              </div>

              <div className="round-console">
                {!fighterA || !fighterB ? (
                  <div className="round-console__waiting">
                    <span>B</span>
                    <h3>La arena espera a sus contendientes</h3>
                    <p>Selecciona dos BioCards distintas para comenzar el duelo.</p>
                  </div>
                ) : duelOutcome ? (
                  <div className="duel-result">
                    <span className="duel-result__crown">♛</span>
                    <small>Duelo finalizado</small>
                    <h3>{duelOutcome.winnerCard ? `${duelOutcome.winnerCard.name} conquista la arena` : "Empate absoluto"}</h3>
                    <p>{duelOutcome.reason} · Marcador {scoreA}–{scoreB}</p>
                    <button type="button" className="button button--gold" onClick={() => resetDuel(true)}>
                      Repetir duelo
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="round-console__title">
                      <div>
                        <span>Elige el poder de esta ronda</span>
                        <h3>{statMeta[selectedStat].prompt}</h3>
                      </div>
                      <button type="button" onClick={() => resetDuel(true)}>Reiniciar</button>
                    </div>

                    <div className="stat-picker">
                      {Object.entries(statMeta).map(([stat, meta]) => {
                        const used = usedStats.includes(stat);
                        return (
                          <button
                            type="button"
                            key={stat}
                            className={selectedStat === stat ? "is-active" : ""}
                            style={{ "--stat-color": meta.color }}
                            disabled={used}
                            onClick={() => {
                              setSelectedStat(stat);
                              setAbilityA(false);
                              setAbilityB(false);
                              setReasonA("");
                              setReasonB("");
                            }}
                          >
                            <b>{meta.short}</b>
                            <span>{meta.name}</span>
                            {used && <small>Utilizada</small>}
                          </button>
                        );
                      })}
                    </div>

                    <div className="ability-activation">
                      {[
                        {
                          side: "A",
                          card: fighterA,
                          active: abilityA,
                          setActive: setAbilityA,
                          reason: reasonA,
                          setReason: setReasonA,
                          canActivate: canActivateA,
                          validReason: validReasonA,
                        },
                        {
                          side: "B",
                          card: fighterB,
                          active: abilityB,
                          setActive: setAbilityB,
                          reason: reasonB,
                          setReason: setReasonB,
                          canActivate: canActivateB,
                          validReason: validReasonB,
                        },
                      ].map((item) => (
                        <div className={`ability-input ${item.active ? "is-active" : ""}`} key={item.side}>
                          <div>
                            <span>Habilidad {item.side}</span>
                            <h4>{item.card.ability}</h4>
                            <p>{item.card.effect}</p>
                          </div>
                          <button
                            type="button"
                            disabled={!item.canActivate}
                            onClick={() => item.setActive((current) => !current)}
                            aria-pressed={item.active}
                          >
                            {item.canActivate
                              ? item.active
                                ? "Cancelar +3"
                                : "Justificar +3"
                              : `Requiere ${statMeta[item.card.abilityStat].short}`}
                          </button>
                          {item.active && (
                            <label>
                              <span>Explica por qué cumples la condición</span>
                              <textarea
                                value={item.reason}
                                onChange={(event) => item.setReason(event.target.value)}
                                placeholder="Escribe una justificación científica breve…"
                                rows="3"
                              />
                              <small className={item.validReason ? "is-valid" : ""}>
                                {item.validReason ? "✓ Bonificación preparada" : "Escribe al menos 12 caracteres"}
                              </small>
                            </label>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="round-preview">
                      <span>
                        {fighterA.name}
                        <b>
                          {fighterA[selectedStat]}
                          {abilityA && canActivateA && validReasonA ? " + 3" : ""}
                        </b>
                      </span>
                      <i>{statMeta[selectedStat].short}</i>
                      <span>
                        {fighterB.name}
                        <b>
                          {fighterB[selectedStat]}
                          {abilityB && canActivateB && validReasonB ? " + 3" : ""}
                        </b>
                      </span>
                    </div>

                    <button type="button" className="resolve-button" onClick={resolveRound}>
                      Resolver la ronda <span aria-hidden="true">→</span>
                    </button>
                  </>
                )}
              </div>

              {rounds.length > 0 && (
                <div className="round-history">
                  <h3>Acta del duelo</h3>
                  {rounds.map((round) => (
                    <div key={round.number}>
                      <span>R{round.number} · {statMeta[round.stat].short}</span>
                      <b>{round.totalA}</b>
                      <i>{round.winner === "tie" ? "Empate" : round.winner === "A" ? fighterA.name : fighterB.name}</i>
                      <b>{round.totalB}</b>
                      <small>
                        {round.bonusA ? "+3 A" : ""}
                        {round.bonusA && round.bonusB ? " · " : ""}
                        {round.bonusB ? "+3 B" : ""}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {view === "ranking" && (
          <section className="section ranking-section">
            <div className="section-heading">
              <div>
                <span className="section-heading__number">03</span>
                <div>
                  <span className="section-heading__kicker">Salón de la fama</span>
                  <h2>Ranking de poder</h2>
                </div>
              </div>
              <p>
                Las victorias conseguidas en tu navegador mandan. En caso de empate,
                decide el poder biológico total.
              </p>
            </div>

            <div className="ranking-layout">
              <div className="podium">
                {[ranking[1], ranking[0], ranking[2]].map((figure, index) => {
                  const place = index === 0 ? 2 : index === 1 ? 1 : 3;
                  return (
                    <article key={figure.id} className={`podium__place podium__place--${place}`}>
                      <span className="podium__number">{place}</span>
                      <img src={figure.image} alt={`Carta de ${figure.name}`} />
                      <h3>{figure.name}</h3>
                      <p>{wins[figure.id] || 0} victorias</p>
                      <b>PB {getPower(figure)}</b>
                    </article>
                  );
                })}
              </div>

              <div className="ranking-table">
                <div className="ranking-table__head">
                  <span>Pos.</span><span>BioCard</span><span>PB</span><span>Victorias</span>
                </div>
                {ranking.map((figure, index) => (
                  <div className="ranking-table__row" key={figure.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>
                      <i style={{ "--card-accent": figure.color }}>{figure.categoryCode}</i>
                      <b>{figure.name}</b>
                      <small>{figure.category}</small>
                    </span>
                    <span>{getPower(figure)}</span>
                    <span>{wins[figure.id] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="ranking-note">
              <span>Estadística local</span>
              <p>Has registrado {totalDuels} victorias en este dispositivo.</p>
            </div>
          </section>
        )}

        {view === "rules" && (
          <section className="section rules-section">
            <div className="section-heading">
              <div>
                <span className="section-heading__number">04</span>
                <div>
                  <span className="section-heading__kicker">Reglamento oficial</span>
                  <h2>Cómo jugar</h2>
                </div>
              </div>
              <p>
                BioCards une la colección física, el álbum y la app en una misma
                experiencia educativa.
              </p>
            </div>

            <div className="rules-grid">
              {[
                ["01", "Colecciona", "Marca en la app las BioCards físicas que ya tienes y completa los 16 espacios del álbum."],
                ["02", "Selecciona", "Cada jugador elige una carta. Puedes escoger un rival o dejar que la arena lo decida al azar."],
                ["03", "Desafía", "En cada ronda se compara un atributo distinto: OBS, DES o IMP. Gana la puntuación más alta."],
                ["04", "Justifica", "La habilidad suma +3 únicamente si coincide con el atributo y escribes una explicación suficiente."],
                ["05", "Vence", "El primer jugador que gana dos rondas conquista el duelo. Si hay empate, decide el PB total."],
                ["06", "Aprende", "Supera el reto de cada ficha y regístralo también en tu álbum coleccionista."],
              ].map(([number, title, text]) => (
                <article key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>

            <div className="stats-guide">
              <div>
                <span className="section-heading__kicker">Tres formas de poder</span>
                <h3>Una cifra no basta</h3>
                <p>
                  El conocimiento se demuestra. Las habilidades obligan a explicar el
                  procedimiento, detectar un patrón o conectar una aportación con su impacto.
                </p>
              </div>
              {Object.entries(statMeta).map(([stat, meta]) => (
                <article key={stat} style={{ "--stat-color": meta.color }}>
                  <StatOrb stat={stat} value="+" />
                  <div>
                    <h4>{meta.short} · {meta.name}</h4>
                    <p>{meta.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer>
        <Logo compact />
        <p>Diseño, textos y sistema de juego · Víctor Manuel Ferrer García · MIMOA PAPER</p>
        <span>Serie 01 · Descifradores de la vida · 2026</span>
      </footer>
    </div>
  );
}

export default App;
