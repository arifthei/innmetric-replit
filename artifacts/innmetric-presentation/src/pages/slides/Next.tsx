export default function Next() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-primary font-body text-bg">
      <div className="absolute left-[6vw] right-[6vw] top-[8vh] bottom-[8vh] flex flex-col">
        <div className="text-[1.5vw] font-semibold tracking-[0.12em] text-bg/70">06 / 06</div>
        <h1 className="mt-[2vh] font-display text-[5vw] font-bold leading-[1.0] tracking-tight">Demonstrate today. Validate next.</h1>
        <div className="mt-auto flex flex-col">
          <div className="grid grid-cols-12 gap-x-[2vw] border-t border-bg/25 py-[2vh]"><div className="col-span-3 text-[1.6vw] font-semibold tracking-[0.12em] text-bg/70">WORKING SOFTWARE</div><div className="col-span-9 text-[2vw] leading-snug">Working software: persisted cases, calculations, review gates and traceable records</div></div>
          <div className="grid grid-cols-12 gap-x-[2vw] border-t border-bg/25 py-[2vh]"><div className="col-span-3 text-[1.6vw] font-semibold tracking-[0.12em] text-bg/70">SIMULATED</div><div className="col-span-9 text-[2vw] leading-snug">Simulated: evidence, role identities, receipts and payments</div></div>
          <div className="grid grid-cols-12 gap-x-[2vw] border-t border-bg/25 py-[2vh]"><div className="col-span-3 text-[1.6vw] font-semibold tracking-[0.12em] text-bg/70">NOT ESTABLISHED</div><div className="col-span-9 text-[2vw] leading-snug">Not established: government affiliation, real hotel savings or live financial integrations</div></div>
          <div className="grid grid-cols-12 gap-x-[2vw] border-t border-bg/25 py-[2vh]"><div className="col-span-3 text-[1.6vw] font-semibold tracking-[0.12em] text-text">NEXT</div><div className="col-span-9 text-[2vw] leading-snug">Next: validate one authorized hotel case and one provider workflow</div></div>
          <div className="bg-text text-bg rounded-[0.6vw] px-[2vw] py-[2vh] text-[2.1vw] font-semibold">Seeking feedback on the operating model and a suitable pilot partner</div>
        </div>
      </div>
    </div>
  );
}
