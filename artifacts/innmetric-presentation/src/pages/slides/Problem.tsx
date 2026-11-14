import PitchSlide from '../../components/PitchSlide';

export default function Problem() {
  return (
    <PitchSlide number={1} pillar="Why this problem">
      <section className="pitch-problem">
        <h1>I tapped ‘Book now’.<br /><em>It went nowhere.</em></h1>
        <div className="pitch-problem-copy">
          <p>On a hotel visit, one booking link returned an error. The other opened a different booking engine.</p>
          <p>If guests book through an agency instead, the hotel may pay a commission it could have avoided.</p>
        </div>
      </section>
    </PitchSlide>
  );
}
