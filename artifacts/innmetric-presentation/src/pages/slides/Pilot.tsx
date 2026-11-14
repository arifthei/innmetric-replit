import PitchSlide from '../../components/PitchSlide';

export default function Pilot() {
  return (
    <PitchSlide number={3} pillar="Why now" theme="wash">
      <section className="pitch-pilot">
        <div>
          <h1>A pilot with two hotels</h1>
          <p className="pitch-pilot-intro">In the prototype, a simulated saving at one hotel funds a repair at another. A pilot would test the process with hotel records.</p>
        </div>
        <div className="pitch-pilot-checks">
          <h2>What we’d measure</h2>
          <ul>
            <li>Can guests book direct?</li>
            <li>Did net distribution costs fall?</li>
            <li>Did the provider complete the work?</li>
          </ul>
        </div>
      </section>
    </PitchSlide>
  );
}
