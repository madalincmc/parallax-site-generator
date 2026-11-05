// The thread: one terminal window, modeled as a real object. A bezel with a recess, a back plate,
// three lamps and five plates stacked inside. Acts never move the parts directly. They call
// `pose(state, weight)`, and overlapping acts blend by weight, so handoffs can't pop.
import * as THREE from "three";
import { canvasTexture, instanced, remap, rng } from "@/stage/kit";
import type { World } from "@/stage/types";

const W = 4.4;
const H = 2.8;
const D = 0.22;
const PLATE_W = 4.12;
const PLATE_H = 2.24;
const PLATE_Y = -0.2;
const PLATE_GAP = 1.15;
const FAN_GAP = 3.4;
const PULL = 5.4;

// Canvases are square, so paint in this space and let the plate's aspect undo the scale.
const LW = 1536;
const LH = Math.round((LW * PLATE_H) / PLATE_W);

export const COLORS = { red: "#ff5f57", amber: "#febc2e", green: "#28c840", white: "#ffffff" };
export const PLATE = { prompt: 0, teams: 1, tests: 2, projects: 3, writing: 4 } as const;

/** Where a plate's center sits, relative to the thread's origin. Acts use this to frame shots. */
export const plateOffset = (i: number, explode: number, fan = 0, pull = 0) => ({
  x: explode * (i - 2) * 0.22 + fan * (i - 2) * FAN_GAP + pull * PULL,
  y: PLATE_Y + explode * (2 - i) * 0.1 - fan * Math.abs(i - 2) * 0.25,
  // A pulled plate clears the stack sideways first, then comes to the front, so nothing blocks it.
  z:
    0.085 -
    i * 0.012 +
    explode * (4 - i) * PLATE_GAP +
    remap(Math.abs(pull), 0.75, 1) * (i * PLATE_GAP * explode + 3),
});

/** The window's lamps, relative to the thread's origin. */
export const lampOffset = (i: number) => ({ x: -W / 2 + 0.3 + i * 0.22, y: H / 2 - 0.24, z: D / 2 + 0.004 });

export type TerminalPose = {
  explode?: number; // 0 closed, 1 the plates float apart along Z
  fan?: number; // 0 stacked, 1 dealt out sideways
  contact?: number; // 0 the whoami screen, 1 the contact screen
  lamps?: [number, number, number];
  pull?: number[]; // per plate, -1..1: slid out like a drawer, to the left or right
  glow?: number[]; // per plate brightness
};

const FIELDS = 3 + 3 + 5 + 5;

const roundedRect = (target: THREE.Shape | THREE.Path, w: number, h: number, r: number, cy = 0) => {
  const x = -w / 2;
  const y = cy - h / 2;
  target.moveTo(x + r, y);
  target.lineTo(x + w - r, y);
  target.quadraticCurveTo(x + w, y, x + w, y + r);
  target.lineTo(x + w, y + h - r);
  target.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  target.lineTo(x + r, y + h);
  target.quadraticCurveTo(x, y + h, x, y + h - r);
  target.lineTo(x, y + r);
  target.quadraticCurveTo(x, y, x + r, y);
  return target;
};

const monoFamily = () => {
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-body").trim();
  return `${family ? `${family}, ` : ""}ui-monospace, Consolas, monospace`;
};

function faceTexture(size: number, paint: (ctx: CanvasRenderingContext2D) => void) {
  return canvasTexture(
    size,
    (ctx, s) => {
      ctx.scale(s / LW, s / LH);
      ctx.fillStyle = "#08080a";
      ctx.fillRect(0, 0, LW, LH);
      paint(ctx);
    },
    true,
  );
}

function paintLines(lines: [string, string][]) {
  return (ctx: CanvasRenderingContext2D) => {
    ctx.font = `500 52px ${monoFamily()}`;
    ctx.textBaseline = "middle";
    lines.forEach(([text, color], i) => {
      ctx.fillStyle = color;
      ctx.fillText(text, 84, 118 + i * 100);
    });
  };
}

function paintTeams(ctx: CanvasRenderingContext2D) {
  const r = rng(11);
  const root = { x: LW / 2, y: 130 };
  const leads = [0.2, 0.5, 0.8].map((k) => ({ x: LW * k, y: 400 }));
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#7a5c16";
  const nodes: { x: number; y: number; size: number; fill: string }[] = [{ ...root, size: 34, fill: COLORS.amber }];
  for (const lead of leads) {
    ctx.beginPath();
    ctx.moveTo(root.x, root.y);
    ctx.bezierCurveTo(root.x, 280, lead.x, 260, lead.x, lead.y);
    ctx.stroke();
    nodes.push({ ...lead, size: 24, fill: COLORS.amber });
    const count = 3 + Math.floor(r() * 2);
    for (let i = 0; i < count; i++) {
      const leaf = { x: lead.x + (i - (count - 1) / 2) * 92, y: 660 + r() * 40 };
      ctx.beginPath();
      ctx.moveTo(lead.x, lead.y);
      ctx.bezierCurveTo(lead.x, 540, leaf.x, 520, leaf.x, leaf.y);
      ctx.stroke();
      nodes.push({ ...leaf, size: 15, fill: "#d9d9d9" });
    }
  }
  for (const node of nodes) {
    ctx.fillStyle = node.fill;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintTests(ctx: CanvasRenderingContext2D) {
  const r = rng(23);
  for (let row = 0; row < 11; row++) {
    const y = 74 + row * 64;
    for (let col = 0; col < 2; col++) {
      const x = 84 + col * 700;
      ctx.fillStyle = COLORS.green;
      ctx.fillRect(x, y, 34, 34);
      ctx.strokeStyle = "#08080a";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x + 7, y + 18);
      ctx.lineTo(x + 14, y + 26);
      ctx.lineTo(x + 28, y + 9);
      ctx.stroke();
      ctx.fillStyle = "#4b4b4f";
      ctx.fillRect(x + 56, y + 9, 200 + r() * 340, 16);
    }
  }
}

function drawMiniWindow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, seed: number) {
  const r = rng(seed);
  ctx.strokeStyle = "#5a5a60";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);
  [COLORS.red, COLORS.amber, COLORS.green].forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + 28 + i * 28, y + 28, 9, 0, Math.PI * 2);
    ctx.fill();
  });
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i === 0 ? COLORS.red : "#3d3d42";
    ctx.fillRect(x + 22, y + 66 + i * 30, (w - 44) * (0.35 + r() * 0.6), 13);
  }
}

function paintProjects(ctx: CanvasRenderingContext2D) {
  const w = 420;
  const h = 310;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      drawMiniWindow(ctx, 84 + col * (w + 54), 80 + row * (h + 54), w, h, 40 + row * 3 + col);
    }
  }
}

function paintWriting(ctx: CanvasRenderingContext2D) {
  const r = rng(61);
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-heading").trim();
  ctx.fillStyle = "#ffffff";
  ctx.font = `400 104px ${family ? `${family}, ` : ""}Georgia, serif`;
  ctx.textBaseline = "middle";
  ctx.fillText("Notes & writing", 84, 118);
  ctx.fillStyle = COLORS.red;
  ctx.fillRect(84, 190, 220, 10);
  let y = 248;
  for (let block = 0; block < 3; block++) {
    const lines = 3 + Math.floor(r() * 2);
    for (let i = 0; i < lines; i++) {
      ctx.fillStyle = "#57575c";
      ctx.fillRect(84, y, i === lines - 1 ? 420 + r() * 400 : LW - 168 - r() * 90, 18);
      y += 40;
    }
    y += 30;
  }
}

function buildTerminal(isPhone: boolean) {
  const size = isPhone ? 1024 : 1536;
  const root = new THREE.Group();
  const textures: THREE.Texture[] = [];
  const track = <T extends THREE.Texture>(texture: T) => {
    textures.push(texture);
    return texture;
  };

  // Anodized metal: brushed roughness keeps it from reading as plastic.
  const brushed = track(
    canvasTexture(256, (ctx, s) => {
      const r = rng(5);
      ctx.fillStyle = "#8a8a8a";
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 900; i++) {
        const shade = 122 + r() * 36;
        ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
        ctx.fillRect(r() * s, r() * s, 40 + r() * 160, 1);
      }
    }),
  );
  brushed.repeat.set(3, 9);
  const metal = new THREE.MeshStandardMaterial({ color: "#4a4a52", metalness: 1, roughness: 0.8, roughnessMap: brushed, envMapIntensity: 1.5 });

  const outer = roundedRect(new THREE.Shape(), W, H, 0.16) as THREE.Shape;
  outer.holes.push(roundedRect(new THREE.Path(), PLATE_W + 0.02, PLATE_H + 0.02, 0.05, PLATE_Y) as THREE.Path);
  const bevel = { bevelEnabled: true, bevelThickness: 0.016, bevelSize: 0.016, bevelSegments: 3, curveSegments: 10 };
  const bezelGeometry = new THREE.ExtrudeGeometry(outer, { depth: D, ...bevel });
  bezelGeometry.translate(0, 0, -D / 2);
  root.add(new THREE.Mesh(bezelGeometry, metal));

  const backShape = roundedRect(new THREE.Shape(), W, H, 0.16) as THREE.Shape;
  const back = new THREE.Mesh(new THREE.ExtrudeGeometry(backShape, { depth: 0.03, ...bevel }), metal);
  back.position.z = -D / 2 - 0.02;
  root.add(back);

  // Title bar text.
  const titleTexture = track(
    canvasTexture(
      1024,
      (ctx, s) => {
        ctx.scale(1, s / 128);
        ctx.font = `500 54px ${monoFamily()}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#bdbdc2";
        ctx.fillText("~/portfolio — zsh", 512, 66);
      },
      true,
    ),
  );
  const title = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 0.3),
    new THREE.MeshBasicMaterial({ map: titleTexture, transparent: true, toneMapped: false, depthWrite: false }),
  );
  title.position.set(0, H / 2 - 0.24, D / 2 + 0.006);
  root.add(title);

  // Three lamps: a dark collar, a lit dome and a soft glow.
  const collar = instanced(
    new THREE.CylinderGeometry(0.086, 0.086, 0.02, 28).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: "#0c0c0e", metalness: 1, roughness: 0.3 }),
    3,
    (dummy, i) => {
      const lamp = lampOffset(i);
      dummy.position.set(lamp.x, lamp.y, lamp.z);
    },
  );
  root.add(collar);
  const dome = new THREE.SphereGeometry(0.068, 24, 14);
  dome.scale(1, 1, 0.42);
  const glowTexture = track(
    canvasTexture(
      128,
      (ctx, s) => {
        const gradient = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        gradient.addColorStop(0, "rgba(255,255,255,0.9)");
        gradient.addColorStop(0.18, "rgba(255,255,255,0.3)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, s, s);
      },
      true,
    ),
  );
  const glowPlane = new THREE.PlaneGeometry(0.95, 0.95);
  const lampColors = [COLORS.red, COLORS.amber, COLORS.green].map((c) => new THREE.Color(c));
  const lamps = lampColors.map((color, i) => {
    const lamp = lampOffset(i);
    const body = new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ color, toneMapped: false }));
    body.position.set(lamp.x, lamp.y, lamp.z + 0.01);
    const glow = new THREE.Mesh(
      glowPlane,
      new THREE.MeshBasicMaterial({
        color,
        map: glowTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    );
    glow.position.set(lamp.x, lamp.y, lamp.z + 0.03);
    root.add(body, glow);
    return { body, glow, color };
  });

  // The five plates.
  const plateShape = roundedRect(new THREE.Shape(), PLATE_W, PLATE_H, 0.05) as THREE.Shape;
  const plateGeometry = new THREE.ExtrudeGeometry(plateShape, {
    depth: 0.018,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 2,
    curveSegments: 6,
  });
  plateGeometry.translate(0, 0, -0.024);
  const plateMetal = new THREE.MeshStandardMaterial({ color: "#3a3a40", metalness: 1, roughness: 0.42 });
  const faceGeometry = new THREE.PlaneGeometry(PLATE_W - 0.08, PLATE_H - 0.08);

  const whoami: [string, string][] = [
    ["$ whoami", COLORS.green],
    ["Madalin Cotetiu", "#ffffff"],
    ["", ""],
    ["$ cat about.txt", COLORS.green],
    ["I lead teams and build things on the side.", "#ffffff"],
    ["", ""],
    ["$", COLORS.green],
  ];
  const reply: [string, string][] = [
    ["$ ./contact", COLORS.green],
    ["Questions, feedback on a project,", "#ffffff"],
    ["or want to talk about engineering,", "#ffffff"],
    ["testing or AI?", "#ffffff"],
    ["Email or LinkedIn works best.", COLORS.amber],
    ["", ""],
    ["$", COLORS.green],
  ];
  const paints = [paintLines(whoami), paintTeams, paintTests, paintProjects, paintWriting];
  const plates = paints.map((paint) => {
    const group = new THREE.Group();
    group.add(new THREE.Mesh(plateGeometry, plateMetal));
    const face = new THREE.Mesh(
      faceGeometry,
      new THREE.MeshBasicMaterial({ map: track(faceTexture(size, paint)), toneMapped: false }),
    );
    face.position.z = 0.002;
    group.add(face);
    root.add(group);
    return { group, material: face.material as THREE.MeshBasicMaterial };
  });

  // Extras on the front plate: the contact screen, the cursor and a streak of glass.
  const contactFace = new THREE.Mesh(
    faceGeometry,
    new THREE.MeshBasicMaterial({
      map: track(faceTexture(size, paintLines(reply))),
      transparent: true,
      opacity: 0,
      toneMapped: false,
      depthWrite: false,
    }),
  );
  contactFace.position.z = 0.004;
  plates[0].group.add(contactFace);
  const cursor = new THREE.Mesh(
    new THREE.PlaneGeometry(0.075, 0.13),
    new THREE.MeshBasicMaterial({ color: COLORS.green, toneMapped: false, depthWrite: false, transparent: true }),
  );
  cursor.position.set(
    -(PLATE_W - 0.08) / 2 + ((84 + 62) / LW) * (PLATE_W - 0.08),
    (PLATE_H - 0.08) / 2 - ((118 + 6 * 100) / LH) * (PLATE_H - 0.08),
    0.006,
  );
  plates[0].group.add(cursor);
  const sheenTexture = track(
    canvasTexture(
      256,
      (ctx, s) => {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, s, s);
        ctx.translate(s * 0.62, 0);
        ctx.rotate(0.45);
        const gradient = ctx.createLinearGradient(-90, 0, 90, 0);
        gradient.addColorStop(0, "rgba(255,255,255,0)");
        gradient.addColorStop(0.5, "rgba(255,255,255,1)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(-90, -s, 180, s * 3);
      },
      true,
    ),
  );
  const sheen = new THREE.Mesh(
    faceGeometry,
    new THREE.MeshBasicMaterial({
      map: sheenTexture,
      transparent: true,
      opacity: 0.075,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  sheen.position.z = 0.012;
  plates[0].group.add(sheen);

  // Blending: acts add their poses, weighted, and the running average is applied after each.
  const sum = new Float32Array(FIELDS);
  const values = new Float32Array(FIELDS);
  let total = 0;
  let time = 0;
  const contactMaterial = contactFace.material as THREE.MeshBasicMaterial;
  const cursorMaterial = cursor.material as THREE.MeshBasicMaterial;
  const sheenMaterial = sheen.material as THREE.MeshBasicMaterial;

  const apply = () => {
    for (let i = 0; i < FIELDS; i++) values[i] = sum[i] / Math.max(total, 1e-5);
    const [explode, fan, contact] = values;
    lamps.forEach((lamp, i) => {
      const level = values[3 + i];
      (lamp.body.material as THREE.MeshBasicMaterial).color.copy(lamp.color).multiplyScalar(0.18 + level * 0.82);
      (lamp.glow.material as THREE.MeshBasicMaterial).opacity = level * 0.85;
    });
    plates.forEach((plate, i) => {
      const pull = values[6 + i];
      const glow = values[11 + i];
      const at = plateOffset(i, explode, fan, pull);
      plate.group.position.set(at.x, at.y, at.z);
      plate.group.rotation.y = -fan * (i - 2) * 0.2 - pull * 0.22;
      plate.material.color.setScalar(glow);
    });
    const front = values[11];
    contactMaterial.opacity = contact;
    contactMaterial.color.setScalar(front);
    cursorMaterial.opacity = Math.sin(time * 5) > -0.2 ? front : 0;
    sheenMaterial.opacity = 0.075 * front;
  };

  return Object.assign(root, {
    /** Called once a frame, by the world, before any act poses it. */
    begin(t: number) {
      sum.fill(0);
      total = 0;
      time = t;
    },
    /** Called from an act's `update`, with its `weight`. */
    pose(state: TerminalPose, weight: number) {
      const { explode = 0, fan = 0, contact = 0, lamps: lit = [1, 1, 1], pull, glow } = state;
      sum[0] += explode * weight;
      sum[1] += fan * weight;
      sum[2] += contact * weight;
      for (let i = 0; i < 3; i++) sum[3 + i] += lit[i] * weight;
      for (let i = 0; i < 5; i++) {
        sum[6 + i] += (pull?.[i] ?? 0) * weight;
        sum[11 + i] += (glow?.[i] ?? 1) * weight;
      }
      total += weight;
      apply();
    },
    /** How bright a lamp is right now, for the light it throws on the floor. */
    lampLevel: (i: number) => values[3 + i],
    dispose() {
      textures.forEach((texture) => texture.dispose());
    },
  });
}

export type Terminal = ReturnType<typeof buildTerminal>;
export { buildTerminal };

/** The terminal from inside an act. */
export const terminalOf = (world: World) => world.thread as Terminal;
