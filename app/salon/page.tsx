import { HallOfFame } from "../components/hall-of-fame";
import { GAMES } from "../data/games";
import { seededScores, type ScoreRow } from "../data/scores";

export default function HallPage() {
  const rowsByGame: Record<string, ScoreRow[]> = {};
  for (const g of GAMES) {
    rowsByGame[g.id] = seededScores(g.id.length * 23 + 7, 12);
  }

  return <HallOfFame games={GAMES} rowsByGame={rowsByGame} />;
}
