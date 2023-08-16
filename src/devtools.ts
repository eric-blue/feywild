import {BoxGeometry, Mesh, Scene, Vector3, MeshStandardMaterial} from 'three';

export function devTools(scene: Scene) {
  // Set up random position generator
  function getRandomPosition() {
    const x = Math.random() * 2000 - 1000; // Range: -1000 to 1000
    const y = 0.5; // Place cubes on the ground
    const z = Math.random() * 2000 - 1000;
    return new Vector3(x, y, z);
  }

  const numCubes = 10000; // Number of cubes to generate

  // Generate cubes
  for (let i = 0; i < numCubes; i++) {
    const cubeGeometry = new BoxGeometry(2, 8, 2);
    const cubeMaterial = new MeshStandardMaterial({color: 0xfff000}); // Random color
    const cube = new Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;
    cube.receiveShadow = true;

    const randomPosition = getRandomPosition();
    cube.position.copy(randomPosition);

    scene.add(cube);
  }
}
