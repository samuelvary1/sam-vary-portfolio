import GameUI from './GameUI';
import '../FieldsOfPeril/GameUI.css';

const GamePage = () => {
  return (
    <div className="game-page-background">
      <div className="title-overlay">Fields of Peril</div>
      <GameUI />
    </div>
  );
};

export default GamePage;