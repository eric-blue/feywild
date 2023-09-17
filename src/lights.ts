import {DirectionalLight, Fog, Scene} from 'three';

export class Lights {
  sunlight = new DirectionalLight(0xffffff, 1.5);

  constructor(scene: Scene) {
    // this should be configurable based on locale (dark in forest, bright in village)
    scene.fog = new Fog(0x000000, 18, 45);

    this.sunlight.position.set(200, 800, -200);
    this.sunlight.target.position.set(0, 0, 0); // Point back at the center
    this.sunlight.castShadow = true; // Enable shadow casting for the light

    scene.add(this.sunlight);

    // Adjust shadow properties for the light
    const shadowMapSize = 4096; // Adjust the shadow map size based on your needs
    this.sunlight.shadow.mapSize.width = shadowMapSize;
    this.sunlight.shadow.mapSize.height = shadowMapSize;

    // Adjust the shadow camera frustum to encompass your camera
    const frustumSize = 100; // Match the size of your camera view
    this.sunlight.shadow.camera.left = -frustumSize / 2;
    this.sunlight.shadow.camera.right = frustumSize / 2;
    this.sunlight.shadow.camera.top = frustumSize / 2;
    this.sunlight.shadow.camera.bottom = -frustumSize / 2;

    this.sunlight.shadow.camera.near = 0.15; // Shadow camera near plane
    this.sunlight.shadow.camera.far = 5000; // Shadow camera far plane
  }
}
