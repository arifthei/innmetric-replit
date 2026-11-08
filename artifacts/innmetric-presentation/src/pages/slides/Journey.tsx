const base = import.meta.env.BASE_URL;

export default function Journey() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg font-body text-text">
      <div className="absolute left-0 top-0 h-full w-[0.6vw] bg-primary"></div>
      <div className="absolute left-[6vw] right-[6vw] top-[8vh] bottom-[8vh] grid grid-cols-12 gap-x-[2vw]">
        <div className="col-span-5 flex flex-col">
          <div className="text-[1.5vw] font-semibold tracking-[0.12em] text-primary">03 / 06</div>
          <h1 className="mt-[2vh] font-display text-[3.6vw] font-bold leading-[1.05] tracking-tight [text-wrap:balance]">One connected service journey</h1>
          <ul className="mt-[4vh] flex flex-col gap-[1.6vh] text-[2vw] leading-snug [text-wrap:pretty]">
            <li className="flex gap-[1.2vw] border-t border-text/15 pt-[1.6vh]"><span className="mt-[1.1vw] w-[0.8vw] h-[0.25vw] shrink-0 bg-primary"></span><span>Discover, investigate and confirm the hotel need</span></li>
            <li className="flex gap-[1.2vw] border-t border-text/15 pt-[1.6vh]"><span className="mt-[1.1vw] w-[0.8vw] h-[0.25vw] shrink-0 bg-primary"></span><span>InnMetric and the department jointly review support</span></li>
            <li className="flex gap-[1.2vw] border-t border-text/15 pt-[1.6vh]"><span className="mt-[1.1vw] w-[0.8vw] h-[0.25vw] shrink-0 bg-primary"></span><span>Department records funding; provider records delivery</span></li>
            <li className="flex gap-[1.2vw] border-t border-text/15 pt-[1.6vh]"><span className="mt-[1.1vw] w-[0.8vw] h-[0.25vw] shrink-0 bg-primary"></span><span>Department, hotel and InnMetric all confirm the final outcome</span></li>
          </ul>
        </div>
        <div className="col-span-7 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 rounded-[0.6vw] overflow-hidden bg-white/60 shadow-[0_1.5vw_4vw_-1.5vw_rgba(28,25,23,0.35)] ring-1 ring-text/15 flex flex-col">
          <div className="h-[3vh] shrink-0 bg-text flex items-center gap-[0.5vw] px-[0.9vw]">
            <div className="w-[0.6vw] h-[0.6vw] rounded-full bg-bg/40"></div>
            <div className="w-[0.6vw] h-[0.6vw] rounded-full bg-bg/40"></div>
            <div className="w-[0.6vw] h-[0.6vw] rounded-full bg-primary"></div>
          </div>
          <img src={`${base}screenshots/support.jpg`} crossOrigin="anonymous" alt="InnMetric support screen" className="w-full flex-1 min-h-0 object-cover object-left-top" />
        </div>
        </div>
      </div>
    </div>
  );
}
