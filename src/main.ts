import './style.css';
// import viteLogo from '/vite.svg'
import {init} from './init';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <canvas id="game"></canvas>
  </div>
`;

init(document.querySelector<HTMLCanvasElement>('#game')!);
