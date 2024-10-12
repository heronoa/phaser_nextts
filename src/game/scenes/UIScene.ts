import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { BattleScene } from "./BattleScene";
import {
    HeroesMenu,
    ActionsMenu,
    EnemiesMenu,
    Message,
    Menu,
} from "../Entities/GameEntities";

export class UIScene extends Scene {
    graphics: Phaser.GameObjects.Graphics;
    menus: Phaser.GameObjects.Container;
    heroesMenu: HeroesMenu;
    actionsMenu: ActionsMenu;
    enemiesMenu: EnemiesMenu;
    currentMenu: Menu | null;
    battleScene: BattleScene;
    message: Message;
    constructor() {
        super("UIScene");
    }

    remapHeroes() {
        const heroes = this?.battleScene?.heroes || [];
        this.heroesMenu.remap(heroes);
    }
    remapEnemies() {
        const enemies = this?.battleScene?.enemies || [];
        this.enemiesMenu.remap(enemies);
    }

    create() {
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(1, 0xffffff);
        this.graphics.fillStyle(0x031f4c, 1);
        this.graphics.strokeRect(2, 150, 90, 100);
        this.graphics.fillRect(2, 150, 90, 100);
        this.graphics.strokeRect(95, 150, 90, 100);
        this.graphics.fillRect(95, 150, 90, 100);
        this.graphics.strokeRect(188, 150, 130, 100);
        this.graphics.fillRect(188, 150, 130, 100);

        // basic container to hold all menus
        this.menus = this.add.container();

        this.heroesMenu = new HeroesMenu(195, 153, this);
        this.actionsMenu = new ActionsMenu(100, 153, this);
        this.enemiesMenu = new EnemiesMenu(8, 153, this);

        // the currently selected menu
        this.currentMenu = this.actionsMenu;

        // add menus to the container
        this.menus.add(this.heroesMenu);
        this.menus.add(this.actionsMenu);
        this.menus.add(this.enemiesMenu);

        this.battleScene = this.scene.get("BattleScene") as BattleScene;

        this.remapHeroes();
        this.remapEnemies();

        if (this.input.keyboard)
            this.input.keyboard.on("keydown", this.onKeyInput, this);

        this.input.on("pointerdown", this.handleClick, this);
        this.input.on("pointermove", this.handleSelection, this);

        // if (this.input.mousePointer)
        //     this.input.mousePointer.  .onMouseDown((evt: any) => console.log({ evt }));
        this.battleScene.events.on("PlayerSelect", this.onPlayerSelect, this);

        this.events.on("SelectEnemies", this.onSelectEnemies, this);

        this.events.on("Enemy", this.onEnemy, this);

        this.message = new Message(this, this.battleScene.events);
        this.add.existing(this.message);

        this.battleScene.nextTurn();

        EventBus.emit("current-scene-ready", this);
    }

    handleClick(m: any) {
        const menu = this.currentMenu;

        if (menu !== null) {
            console.log("HELLO WORLD", { x: m.x, y: m.y, menu });

            const len = menu.length;

            const w = 55;
            const h = 15 * len;

            if (
                m.x > menu.x &&
                menu.x + w &&
                m.y > menu.y &&
                m.y < menu.y + h
            ) {
                menu.confirm();
            }
        }
    }

    handleSelection(m: any) {
        const menu = this.currentMenu;
        // console.log("HELLO WORLD", { x: m.x, y: m.y, menu });

        if (!menu) return;

        const len = menu.length;
        const itemH = menu?.menuItems?.[0].height || 0

        if (m.x > menu.x && m.x < menu.x + 55) {
            if (m.y > menu.y && m.y < menu.y + itemH && len > 0) {
                console.log("HELLO WORLD 1", { x: m.x, y: m.y, menu });

                menu.select(0);
                return;
            }
            if (m.y > menu.y + itemH && m.y < menu.y + 2 * itemH && len > 1) {
                console.log("HELLO WORLD 2", { x: m.x, y: m.y, menu });

                menu.select(1);
                return;
            }
            if (m.y > menu.y + 2 * itemH && m.y < menu.y + 3 * itemH && len > 2) {
                console.log("HELLO WORLD 3", { x: m.x, y: m.y, menu });

                menu.select(2);
                return;
            }
            if (m.y > menu.y + 4 * itemH && m.y < menu.y + 5 * itemH && len > 3) {
                console.log("HELLO WORLD 4", { x: m.x, y: m.y, menu });

                menu.select(3);
                return;
            }
        }
    }

    onEnemy(index: number) {
        this.heroesMenu.deselect();
        this.actionsMenu.deselect();
        this.enemiesMenu.deselect();
        this.currentMenu = null;
        this.battleScene.receivePlayerSelection("attack", index);
    }
    onPlayerSelect(id: number) {
        this.heroesMenu.select(id);
        this.actionsMenu.select(0);
        this.currentMenu = this.actionsMenu;
    }
    onSelectEnemies() {
        this.currentMenu = this.enemiesMenu;
        this.enemiesMenu.select(0);
    }

    onKeyInput(event: KeyboardEvent) {
        if (this.currentMenu) {
            if (Phaser.Input.MOUSE_DOWN)
                if (event.code === "ArrowUp") {
                    this.currentMenu.moveSelectionUp();
                } else if (event.code === "ArrowDown") {
                    this.currentMenu.moveSelectionDown();
                } else if (
                    event.code === "ArrowRight" ||
                    event.code === "Shift"
                ) {
                } else if (
                    event.code === "Space" ||
                    event.code === "ArrowLeft"
                ) {
                    this.currentMenu.confirm();
                }
        }
    }
}
