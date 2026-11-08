import PitchSlide from '../../components/PitchSlide';

export default function Team() {
  return (
    <PitchSlide number={4} pillar="Why us" theme="teal">
      <section className="pitch-team">
        <h1>The InnMetric team</h1>
        <div className="pitch-founders">
          <div>
            <h2>Mert Carikci</h2>
            <p>Product ownership and systems analysis</p>
          </div>
          <div>
            <h2>Tunahan Aras</h2>
            <p>Hotel distribution and integrations</p>
          </div>
        </div>
        <p className="pitch-ask">I’d like to discuss the pilot with Dubai’s tourism team and get introductions to two independent hotels.</p>
      </section>
    </PitchSlide>
  );
}
