const base = import.meta.env.BASE_URL;

export default function Cover() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg font-body text-text">
      <div className="absolute right-0 top-0 h-full w-[46vw] bg-primary"></div>
      <div className="absolute left-[6vw] top-[8vh] bottom-[8vh] w-[44vw] flex flex-col justify-between">
        <div className="text-[1.6vw] font-semibold tracking-[0.12em] text-primary">INNMETRIC</div>
        <div>
          <h1 className="font-display text-[5.4vw] font-bold leading-[1.0] tracking-tight [text-wrap:balance]">InnMetric: From evidence to accountable service</h1>
          <p className="mt-[3vh] text-[2.1vw] leading-snug text-text/80 [text-wrap:pretty]">AI-assisted hotel discovery, human review and department-administered support</p>
        </div>
        <div className="flex flex-col gap-[1vh] text-[2vw] border-t border-text/20 pt-[2vh]">
          <div>Proposed Tourism Department programme</div>
          <div>Separate InnMetric commercial services</div>
          <div className="text-primary font-semibold">Working demonstration using synthetic data</div>
        </div>
      </div>
      <div className="absolute left-[54vw] right-[4vw] top-[14vh] bottom-[14vh] flex">
        <div className="flex-1 min-h-0 rounded-[0.6vw] overflow-hidden bg-white/60 shadow-[0_1.5vw_4vw_-1.5vw_rgba(28,25,23,0.35)] ring-1 ring-text/15 flex flex-col">
          <div className="h-[3vh] shrink-0 bg-text flex items-center gap-[0.5vw] px-[0.9vw]">
            <div className="w-[0.6vw] h-[0.6vw] rounded-full bg-bg/40"></div>
            <div className="w-[0.6vw] h-[0.6vw] rounded-full bg-bg/40"></div>
            <div className="w-[0.6vw] h-[0.6vw] rounded-full bg-primary"></div>
          </div>
          <img src={`${base}screenshots/overview.jpg`} crossOrigin="anonymous" alt="InnMetric overview screen" className="w-full flex-1 min-h-0 object-cover object-left-top" />
        </div>
      </div>
    </div>
  );
}
