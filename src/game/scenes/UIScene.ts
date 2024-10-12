import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { BattleScene } from "./BattleScene";
import {
    HeroesMenu,
    ActionsMenu,
    EnemiesMenu,
    Message,
    Menu,
    SpellMenu,
    ConfirmMenu,
    ItemMenu,
} from "../Entities/GameEntities";

export class UIScene extends Scene {
    graphics: Phaser.GameObjects.Graphics;
    menus: Phaser.GameObjects.Container;
    heroesMenu: HeroesMenu;
    actionsMenu: ActionsMenu;
    enemiesMenu: EnemiesMenu;
    spellMenu: SpellMenu;
    itemMenu: ItemMenu;
    confirmMenu: ConfirmMenu;
    currentMenu: Menu | null;
    previousMenu: Menu | null;
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

        // listen for keyboard events
        if (this.input.keyboard)
            this.input.keyboard.on("keydown", this.onKeyInput, this);

        this.input.on("pointerdown", this.handleClick, this);
        this.input.on("pointermove", this.handleSelection, this);

        //

        // if (this.input.mousePointer)
        //     this.input.mousePointer.  .onMouseDown((evt: any) => console.log({ evt }));
        // this.battleScene.events.on("PlayerSelect", this.onPlayerSelect, this);

        // this.events.on("SelectEnemies", this.onSelectEnemies, this);
        // this.events.on("SelectSpell", this.onSelectSpell, this);
        // this.events.on("SelectItem", this.onSelectItem, this);
        // this.events.on("ConfirmRun", this.onConfirmRun, this);
        // this.events.on("BackMenu", this.onConfirmBack, this);

        // this.events.on("Enemy", this.onEnemy, this);

        // this.message = new Message(this, this.battleScene.events);
        // this.add.existing(this.message);

        // this.battleScene.nextTurn();

        //

        // when its player cunit turn to move
        this.battleScene.events.on("PlayerSelect", this.onPlayerSelect, this);

        // when the action on the menu is selected
        // for now we have only one action so we dont send and action id
        this.events.on("SelectedAction", this.onSelectedAction, this);

        // an enemy is selected
        this.events.on("Enemy", this.onEnemy, this);

        // when the scene receives wake event
        this.sys.events.on("wake", this.createMenu, this);

        // the message describing the current action
        this.message = new Message(this, this.battleScene.events);
        this.add.existing(this.message);

        this.createMenu();

        EventBus.emit("current-scene-ready", this);
    }

    createMenu() {
        // map hero menu items to heroes
        this.remapHeroes();
        // map enemies menu items to enemies
        this.remapEnemies();
        // first move
        this.battleScene.nextTurn();
    }

    handleClick(m: any) {
        const menu = this.currentMenu;

        if (menu !== null) {
            // console.log("HELLO WORLD", { x: m.x, y: m.y, menu });

            const len = menu.length;

            const w = 55;
            const h = 17 * len;

            console.log({ item: menu.menuItemIndex });

            if (
                menu.menuItemIndex !== undefined &&
                menu.menuItems[menu.menuItemIndex].active
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
        const itemH = menu?.menuItems?.[0].height + 10 || 0;
        const itemW = 40;

        // console.log({ x: m.x, y: m.y, mx: menu.x, my: menu.y, itemH, itemW });

        if (m.x > menu.x + 40 && m.x < menu.x + 100 && menu.backButton) {
            if (m.y > menu.y && m.y < menu.y + 100 && menu.backButton) {
                // console.log("trigged", {
                //     x: m.x,
                //     y: m.y,
                //     mx: menu.x,
                //     my: menu.y,
                //     itemH,
                //     itemW,
                // });

                menu.select(0);
                return;
            }
        }

        if (m.x > menu.x && m.x < menu.x + itemW) {
            if (m.y > menu.y && m.y < menu.y + itemH && len > 0) {
                // console.log("HELLO WORLD 1", { x: m.x, y: m.y, menu });
                const selectionIndex = menu.backButton ? 1 : 0;

                menu.select(selectionIndex);
                return;
            }
            if (m.y > menu.y + itemH && m.y < menu.y + 2 * itemH && len > 1) {
                // console.log("HELLO WORLD 2", { x: m.x, y: m.y, menu });

                const selectionIndex = menu.backButton ? 2 : 1;

                menu.select(selectionIndex);
                return;
            }
            if (
                m.y > menu.y + 2 * itemH &&
                m.y < menu.y + 3 * itemH &&
                len > 2
            ) {
                // console.log("HELLO WORLD 3", { x: m.x, y: m.y, menu });

                const selectionIndex = menu.backButton ? 3 : 2;

                menu.select(selectionIndex);
                return;
            }
            if (
                m.y > menu.y + 4 * itemH &&
                m.y < menu.y + 5 * itemH &&
                len > 3
            ) {
                // console.log("HELLO WORLD 4", { x: m.x, y: m.y, menu });

                const selectionIndex = menu.backButton ? 4 : 3;

                menu.select(selectionIndex);
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
    onSelectedAction() {
        this.previousMenu = this.currentMenu;
        this.currentMenu = this.enemiesMenu;
        this.enemiesMenu.select(0);
    }

    onSelectSpell() {
        // const currentHeroSpells =
        //     this?.heroesMenu.heroes || [];
        // if (currentHeroSpells.length > 0) this.previousMenu = this.currentMenu;
        // this.currentMenu?.remap(currentHeroSpells, true);
        // this.currentMenu = this.spellMenu;
        // this.enemiesMenu.select(0);
    }
    onSelectItem() {
        this.previousMenu = this.currentMenu;

        this.currentMenu = this.itemMenu;
        this.enemiesMenu.select(0);
    }
    onConfirmRun() {
        this.previousMenu = this.currentMenu;

        this.currentMenu = this.confirmMenu;
        this.enemiesMenu.select(0);
    }

    onConfirmBack() {
        if (this.previousMenu !== null) this.currentMenu = this.previousMenu;
    }

    onKeyInput(event: KeyboardEvent) {
        if (this.currentMenu && this.currentMenu.selected) {
            if (event.code === "ArrowUp") {
                this.currentMenu.moveSelectionUp();
            } else if (event.code === "ArrowDown") {
                this.currentMenu.moveSelectionDown();
            } else if (event.code === "ArrowRight" || event.code === "Shift") {
            } else if (event.code === "Space" || event.code === "ArrowLeft") {
                this.currentMenu.confirm();
            }
        }
    }
}
