"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";

class DemoScene extends Phaser.Scene {
  private card?: Phaser.GameObjects.Rectangle;
  private text?: Phaser.GameObjects.Text;

  constructor() {
    super("demo");
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0xf8fafc);

    this.add.text(16, 12, "Phaser overlay (placeholder)", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
      color: "#0f172a",
      fontStyle: "bold",
    });

    this.add.text(16, 34, "Drag the card into the pocket", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "12px",
      color: "#334155",
    });

    // Pocket
    const pocket = this.add
      .rectangle(width * 0.75, height * 0.6, 140, 90, 0xe2e8f0)
      .setStrokeStyle(2, 0x64748b);
    this.add.text(pocket.x - 45, pocket.y - 8, "POCKET", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "12px",
      color: "#334155",
    });

    // Draggable “card”
    this.card = this.add
      .rectangle(width * 0.25, height * 0.6, 140, 70, 0x111827)
      .setInteractive({ cursor: "grab" });

    this.text = this.add.text(this.card.x - 48, this.card.y - 8, "SKILL CARD", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "12px",
      color: "#ffffff",
    });

    this.input.setDraggable(this.card);

    this.input.on("drag", (_p: any, obj: any, dragX: number, dragY: number) => {
      obj.x = dragX;
      obj.y = dragY;
      this.text?.setPosition(dragX - 48, dragY - 8);
    });

    this.input.on("dragend", () => {
      if (!this.card) return;

      const inPocket =
        Phaser.Geom.Rectangle.Overlaps(
          this.card.getBounds(),
          pocket.getBounds()
        );

      if (inPocket) {
        this.card.setFillStyle(0x16a34a);
        this.text?.setText("CORRECT!");
        this.text?.setPosition(this.card.x - 36, this.card.y - 8);
      } else {
        // snap back
        this.tweens.add({
          targets: [this.card, this.text],
          x: [width * 0.25, width * 0.25 - 48],
          y: [height * 0.6, height * 0.6 - 8],
          duration: 250,
          ease: "Sine.easeOut",
        });
      }
    });
  }

  resize(w: number, h: number) {
    this.scale.resize(w, h);
    this.scene.restart();
  }
}

export default function PhaserOverlayDemo() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    const width = hostRef.current.clientWidth || 600;
    const height = hostRef.current.clientHeight || 300;

    const scene = new DemoScene();

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width,
      height,
      backgroundColor: "#ffffff",
      scene,
    });

    gameRef.current = game;

    const ro = new ResizeObserver(() => {
      const w = hostRef.current?.clientWidth ?? width;
      const h = hostRef.current?.clientHeight ?? height;
      // @ts-ignore
      scene.resize(w, h);
    });

    ro.observe(hostRef.current);

    return () => {
      ro.disconnect();
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={hostRef} className="h-full w-full" />;
}
