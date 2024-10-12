import { useRef } from "react";
import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { IRefPhaserGame } from "../PhaserGame";
import { createPlayer, Player } from "./player";
import { configControls, createControls } from "./controls";
import { createSlime, createSlimeAnimation } from "./slime";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    player: Player | undefined;
    controls: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    water: Phaser.Tilemaps.TilemapLayer | null;

    constructor() {
        super("Game");
    }

    create() {
        this.camera = this.cameras.main;
        // this.camera.setBackgroundColor(0x00ff00);

        // this.background = this.add.image(512, 384, "background");
        // this.background.setAlpha(0.5);

        const map = this.make.tilemap({ key: "map" });

        const grassTileset = map.addTilesetImage("grass", "grass");
        const waterTileset = map.addTilesetImage("water", "water");

        if (grassTileset && waterTileset) {
            const ground = map.createLayer("grass", grassTileset, 0, 0);
            this.water = map.createLayer("water", waterTileset, 0, 0);

            this.water?.setCollisionByProperty({ collider: true });
        }

        this.player = createPlayer(this, { x: 200, y: 200 });

        if (this.player) {
            if (this.water) this.physics.add.collider(this.player, this.water);

            this.player.anims.play("playerIdle");
        }

        this.controls = createControls(this);
        createSlimeAnimation(this);

        createSlime(this);

        EventBus.emit("current-scene-ready", this);
    }

    update() {
        if (this.player && this.controls) {
            configControls(this.player, this.controls, this);
        }

        // if (this.bullet)
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}
