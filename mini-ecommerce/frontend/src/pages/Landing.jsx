import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <main className="landing">
      <section className="landing-copy">
        <span className="eyebrow">A little joy, delivered</span>
        <h1>Make room for things you love.</h1>
        <p>
          Thoughtful finds for everyday living. Take a look around and discover
          something that feels just right.
        </p>
        <div className="landing-actions">
          <Link className="landing-primary" to="/login">
            Sign in to shop
          </Link>
          <Link className="landing-secondary" to="/signup">
            Create an account
          </Link>
        </div>
        <div className="landing-note">
          <span className="landing-note-mark">✦</span>
          <span>Good finds. Easy days. A shop made for you.</span>
        </div>
      </section>
      <div className="landing-art" aria-hidden="true">
        <div className="landing-art-glow" />
        <div className="landing-art-card landing-art-card-back">
          <span>YOUR EVERYDAY, ELEVATED</span>
          <strong>Little things<br />that feel like you.</strong>
        </div>
        <div className="landing-art-card landing-art-card-front">
          <span className="landing-art-sun">☼</span>
          <strong>Find your<br />new favorite.</strong>
          <span className="landing-art-caption">CURATED WITH CARE</span>
        </div>
        <span className="landing-spark landing-spark-one">✳</span>
        <span className="landing-spark landing-spark-two">✦</span>
      </div>
    </main>
  );
}
