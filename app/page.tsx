import { Library } from "./components/library";
import { CATS, GAMES } from "./data/games";

export default function Home() {
  return (
    <div className="fade-in">
      <section className="av-hero">
        <h1 className="flicker">ARCADE VAULT</h1>
        <div className="sub">
          INSERTA UNA MONEDA PARA JUGAR <span className="blink">_</span>
        </div>
      </section>
      <Library games={GAMES} cats={CATS} />
    </div>
  );
}
