import PitchSlide from '../../components/PitchSlide';

export default function Solution() {
  return (
    <PitchSlide number={2} pillar="Why this solution">
      <section className="pitch-solution">
        <h1>Hotel savings can fund local work</h1>
        <ol className="pitch-steps">
          <li>
            <h2>Find the problem</h2>
            <p>AI flags booking problems. InnMetric checks them and makes the fixes the hotel approves.</p>
          </li>
          <li>
            <h2>Verify the saving</h2>
            <p>After the fix, InnMetric and the Tourism Department review the hotel’s net savings.</p>
          </li>
          <li>
            <h2>Pay for the work</h2>
            <p>The department would pool agreed contributions and pay approved local providers for work like repairs or staff training.</p>
          </li>
        </ol>
        <p className="pitch-commercial">InnMetric would sell subscriptions and specialist services outside the fund.</p>
      </section>
    </PitchSlide>
  );
}
