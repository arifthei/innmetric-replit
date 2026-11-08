const base = import.meta.env.BASE_URL;

export default function Funds() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg font-body text-text">
      <div className="absolute left-0 top-0 h-full w-[0.6vw] bg-primary"></div>
      <div className="absolute left-[6vw] right-[6vw] top-[8vh] bottom-[8vh] grid grid-cols-12 gap-x-[2vw]">
        <div className="col-span-7 flex flex-col">
          <div className="text-[1.5vw] font-semibold tracking-[0.12em] text-primary">04 / 06</div>
          <h1 className="mt-[2vh] font-display text-[3.6vw] font-bold leading-[1.05] tracking-tight">Savings are not spendable cash</h1>
          <div className="mt-[3vh] text-[1.5vw] font-semibold tracking-[0.12em] text-primary">ILLUSTRATIVE SEQUENCE</div>
          <ul className="mt-[1.6vh] flex flex-col gap-[1.4vh] text-[2vw] leading-snug [text-wrap:pretty]">
            <li className="flex gap-[1.2vw] border-t border-text/15 pt-[1.6vh]"><span className="mt-[1.1vw] w-[0.8vw] h-[0.25vw] shrink-0 bg-primary"></span><span>Synthetic costs: AED 5,000 baseline minus AED 4,000 observed equals AED 1,000 candidate savings</span></li>
            <li className="flex gap-[1.2vw] border-t border-text/15 pt-[1.6vh]"><span className="mt-[1.1vw] w-[0.8vw] h-[0.25vw] shrink-0 bg-primary"></span><span>Savings verification and collection approval are separate joint reviews</span></li>
            <li className="flex gap-[1.2vw] border-t border-text/15 pt-[1.6vh]"><span className="mt-[1.1vw] w-[0.8vw] h-[0.25vw] shrink-0 bg-primary"></span><span>AED 1,000 receipt minus AED 200 support payment leaves AED 800</span></li>
            <li className="flex gap-[1.2vw] border-t border-text/15 pt-[1.6vh]"><span className="mt-[1.1vw] w-[0.8vw] h-[0.25vw] shrink-0 bg-primary"></span><span>Hotel B pays AED 300 separately, outside department cash</span></li>
            <li className="flex gap-[1.2vw] border-t border-text/15 pt-[1.6vh]"><span className="mt-[1.1vw] w-[0.8vw] h-[0.25vw] shrink-0 bg-primary"></span><span>InnMetric cannot execute pool payments</span></li>
          </ul>
        </div>
        <div className="col-span-5 flex flex-col min-h-0">
          <div className="text-[1.5vw] font-semibold tracking-[0.12em] text-text/60">CAPTURED SCREEN</div>
          <div className="mt-[1.6vh] flex-1 min-h-0 flex flex-col border-[0.25vw] border-dashed border-text/35 p-[0.8vw] rounded-[0.8vw]">
            <div className="flex-1 min-h-0 rounded-[0.6vw] overflow-hidden bg-white/60 shadow-[0_1.5vw_4vw_-1.5vw_rgba(28,25,23,0.35)] ring-1 ring-text/15 flex flex-col">
          <div className="h-[3vh] shrink-0 bg-text flex items-center gap-[0.5vw] px-[0.9vw]">
            <div className="w-[0.6vw] h-[0.6vw] rounded-full bg-bg/40"></div>
            <div className="w-[0.6vw] h-[0.6vw] rounded-full bg-bg/40"></div>
            <div className="w-[0.6vw] h-[0.6vw] rounded-full bg-primary"></div>
          </div>
          <img src={`${base}screenshots/funds.jpg`} crossOrigin="anonymous" alt="InnMetric funds screen" className="w-full flex-1 min-h-0 object-cover object-left-top" />
        </div>
          </div>
          <p className="mt-[1.6vh] text-[1.5vw] text-text/70 leading-snug">Captured before funding · illustrative sequence shown separately</p>
        </div>
      </div>
    </div>
  );
}
