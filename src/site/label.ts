// Small text labels that live in the 3D world, drawn on a canvas from code: waypoint names, summit names.
import * as THREE from "three";

export function makeLabel(top: string, bottom: string, color = "#ffcf3f") {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const g = canvas.getContext("2d")!;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = color;
  g.font = "700 30px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  g.fillText(top, 256, 38, 480);
  g.fillStyle = "#f6f7fb";
  g.font = "700 46px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  g.fillText(bottom, 256, 88, 490);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, fog: false, toneMapped: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(8, 2, 1);
  return sprite;
}
