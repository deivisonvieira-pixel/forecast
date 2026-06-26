// Shared UI primitives — Engage Design System
const { useState: useStateU, useEffect: useEffectU } = React;

function Topbar({ totalDailyLoss, onReset, scene }) {
  const isDark = scene === 'landing' || scene === 'results' || scene === 'schedule';
  return (
    <header className={`topbar ${isDark ? 'on-dark' : ''}`}>
      <div className="brand">
        <img
          src={isDark ? 'assets/logo-engage-light.png' : 'assets/logo-engage-dark.png'}
          alt="Engage"
        />
      </div>
      <div className="topbar-right">
        {scene === 'results' && totalDailyLoss > 0 && (
          <div className="urg-pill">
            <span className="blink"></span>
            <span>−{fmtBRL(totalDailyLoss)}/dia</span>
          </div>
        )}
        <button
          className={`btn-link ${isDark ? 'on-dark' : ''}`}
          onClick={onReset}
          style={{fontSize:13}}
        >
          Reiniciar
        </button>
      </div>
    </header>
  );
}

function Slider({ value, min = 0, max = 100, step = 1, onChange, suffix = '%' }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="slider-row">
      <div className="slider-wrap">
        <div className="slider-track-bg">
          <div className="slider-fill" style={{ width: pct + '%' }}></div>
        </div>
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
        <div className="slider-labels">
          <span>{min}{suffix}</span>
          <span>{max}{suffix}</span>
        </div>
      </div>
      <div className="slider-display">
        {value}<span className="pct">{suffix}</span>
      </div>
    </div>
  );
}

function NumberField({ value, onChange, placeholder, hint, prefix, step = 1, min = 0, label, badge, invalid }) {
  return (
    <div className="field">
      <label>
        <span>{label}</span>
        {badge && <span className="badge">{badge}</span>}
      </label>
      <div className={prefix ? 'field-prefix' : ''}>
        {prefix && <span className="prefix">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          min={min}
          inputMode="decimal"
          className={invalid ? 'invalid' : ''}
        />
      </div>
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

function SliderField({ value, onChange, label, badge, hint, min = 0, max = 100 }) {
  return (
    <div className="field">
      <label>
        <span>{label}</span>
        {badge && <span className="badge">{badge}</span>}
      </label>
      <Slider value={value} onChange={onChange} min={min} max={max} />
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

function Progress({ step }) {
  return (
    <div className="progress">
      <div className={`step ${step === 1 ? 'active' : 'done'}`}>
        <div className="num"><span>1</span></div>
        <span>INDICAÇÕES</span>
      </div>
      <div className={`connector ${step >= 2 ? 'done' : ''}`}></div>
      <div className={`step ${step === 2 ? 'active' : ''}`}>
        <div className="num"><span>2</span></div>
        <span>EXPANSÃO</span>
      </div>
    </div>
  );
}

Object.assign(window, { Topbar, Slider, NumberField, SliderField, Progress });
