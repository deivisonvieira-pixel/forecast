// Main app
const { useState: useSA, useEffect: useEA } = React;

function App() {
  const [scene, setScene] = useSA('landing'); // landing | step1 | step2 | results | schedule
  const [data, setData] = useSA(loadData);
  const [modalOpen, setModalOpen] = useSA(false);
  const [emailSent, setEmailSent] = useSA(false);

  // Persist on every change
  useEA(() => { saveData(data); }, [data]);

  const goTo = (newScene, scrollTop = true) => {
    setScene(newScene);
    if (scrollTop) window.scrollTo(0, 0);
  };

  const handleStart = () => {
    clearData();
    setData({ ...DEFAULT_DATA });
    setEmailSent(false);
    goTo('step1');
  };

  const handleBack1 = () => {
    if (window.confirm('Tem certeza que deseja voltar?')) goTo('landing');
  };

  const handleNext1 = () => {
    saveData(data);
    goTo('step2');
  };

  const handleBack2 = () => goTo('step1');

  const handleSubmitStep2 = () => {
    saveData(data);
    setModalOpen(true);
  };

  const handleModalSubmit = async () => {
    saveData(data);
    setModalOpen(false);
    goTo('results');
    // Envia e-mail com dados do lead + cálculo logo ao acessar resultados
    if (!emailSent) {
      const c = calc(data);
      try {
        const r = await enviarLead(data, c);
        if (r.ok) {
          setEmailSent(true);
          console.log('[App] Lead enviado com sucesso.');
        } else {
          console.warn('[App] Envio retornou erro:', r.error || 'simulado');
        }
      } catch (e) {
        console.error('[App] Exceção ao enviar lead:', e);
      }
    }
  };

  const handleGoSchedule = () => goTo('schedule');
  const handleScheduleBack = () => goTo('results');
  const handleScheduleConfirmed = () => {};

  const handleReset = () => {
    if (window.confirm('Tem certeza? Isso vai limpar todos os dados.')) {
      clearData();
      setData({ ...DEFAULT_DATA });
      setEmailSent(false);
      goTo('landing');
    }
  };

  const totalCalc = calc(data);

  return (
    <div className="app">
      <Topbar
        scene={scene}
        totalDailyLoss={totalCalc.diario}
        onReset={handleReset}
      />

      <main className="stage" data-screen-label={`Cena ${scene}`}>
        <section
          className={`scene ${scene === 'landing' ? 'active' : ''}`}
          data-screen-label="01 Landing"
        >
          {scene === 'landing' && <Landing onStart={handleStart} />}
        </section>

        <section
          className={`scene ${scene === 'step1' ? 'active' : ''}`}
          data-screen-label="02 Passo 1 Indicações"
        >
          {scene === 'step1' && (
            <Step1 data={data} setData={setData} onBack={handleBack1} onNext={handleNext1} />
          )}
        </section>

        <section
          className={`scene ${scene === 'step2' ? 'active' : ''}`}
          data-screen-label="03 Passo 2 Expansão"
        >
          {scene === 'step2' && (
            <Step2 data={data} setData={setData} onBack={handleBack2} onSubmit={handleSubmitStep2} />
          )}
        </section>

        <section
          className={`scene ${scene === 'results' ? 'active' : ''}`}
          data-screen-label="04 Resultados"
        >
          {scene === 'results' && (
            <Results data={data} onReset={handleReset} onAgendar={handleGoSchedule} />
          )}
        </section>

        <section
          className={`scene ${scene === 'schedule' ? 'active' : ''}`}
          data-screen-label="05 Agendamento"
        >
          {scene === 'schedule' && (
            <Schedule
              data={data}
              setData={setData}
              calculo={totalCalc}
              onBack={handleScheduleBack}
              onConfirmed={handleScheduleConfirmed}
            />
          )}
        </section>
      </main>

      <footer className="footer">
        <span>© 2026 ENGAGE · CALCULADORA DE FORECAST</span>
        <span>FEITO COM OBSESSÃO EM LTV 🧲</span>
      </footer>

      <IdentifyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        data={data}
        setData={setData}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
