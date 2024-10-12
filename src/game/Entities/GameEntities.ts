export class Unit extends Phaser.GameObjects.Sprite {
    maxHp: number;
    damage: number;
    type: string;
    hp: number;
    alive: boolean;
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number | undefined,
        type: string,
        hp: number,
        damage: number
    ) {
        super(scene, x, y, texture, frame);
        this.type = type;
        this.maxHp = this.hp = hp;
        this.damage = damage; // default damage
    }
    attack(target: Unit) {
        target.takeDamage();
        this.scene.events.emit(
            "Message",
            this.type +
                " attacks " +
                target.type +
                " for " +
                this.damage +
                " damage"
        );
    }
    takeDamage() {
        this.hp -= this.damage;
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
        }
    }
}

export class PlayerCharacter extends Unit {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number,
        type: string,
        hp: number,
        damage: number
    ) {
        super(scene, x, y, texture, frame, type, hp, damage);
        this.flipX = true;

        this.setScale(2);

        this.setScale(2);
    }
}

export class Enemy extends Unit {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number | undefined,
        type: string,
        hp: number,
        damage: number
    ) {
        super(scene, x, y, texture, frame, type, hp, damage);
    }
}

export class MenuItem extends Phaser.GameObjects.Text {
    constructor(x: number, y: number, text: string, scene: Phaser.Scene) {
        super(scene, x, y, text, {
            color: "#ffffff",
            align: "left",
            fontSize: 15,
        });
    }

    select() {
        this.setColor("#f8ff38");
    }

    deselect() {
        this.setColor("#ffffff");
    }
}

export class Menu extends Phaser.GameObjects.Container {
    menuItem: MenuItem;
    menuItems: MenuItem[] = [];
    menuItemIndex: number;
    constructor(x: number, y: number, scene: Phaser.Scene, heroes?: any) {
        // this.scene = scene
        super(scene, x, y);
    }

    addMenuItem(unit: string) {
        const menuItem = new MenuItem(
            0,
            this.menuItems.length * 20,
            unit,
            this.scene
        );
        this.menuItems.push(menuItem);
        this.add(menuItem);
    }
    moveSelectionUp() {
        this.menuItems[this.menuItemIndex]?.deselect();
        this.menuItemIndex--;
        if (this.menuItemIndex < 0)
            this.menuItemIndex = this.menuItems.length - 1;
        this.menuItems[this.menuItemIndex]?.select();
    }
    moveSelectionDown() {
        this.menuItems[this.menuItemIndex]?.deselect();
        this.menuItemIndex++;
        if (this.menuItemIndex >= this.menuItems.length) this.menuItemIndex = 0;
        this.menuItems[this.menuItemIndex]?.select();
    }
    // select the menu as a whole and an element with index from it
    select(index: number) {
        if (!index) index = 0;
        this.menuItems[this.menuItemIndex]?.deselect();
        this.menuItemIndex = index;
        this.menuItems[this.menuItemIndex]?.select();
    }
    // deselect this menu
    deselect() {
        this.menuItems[this.menuItemIndex]?.deselect();
        this.menuItemIndex = 0;
    }
    confirm() {
        // wen the player confirms his slection, do the action
    }
    clear() {
        for (let i = 0; i < this.menuItems.length; i++) {
            this.menuItems[i].destroy();
        }
        this.menuItems.length = 0;
        this.menuItemIndex = 0;
    }
    remap(units: Unit[] = []) {
        this.clear();
        for (let i = 0; i < units.length; i++) {
            let unit = units[i];
            this.addMenuItem(unit.type);
        }
    }
}

export class EnemiesMenu extends Menu {
    heroes: PlayerCharacter;
    // this:Phaser.Menu; scene: Phaser.Scene; x: number; y: number;
    constructor(x: number, y: number, scene: Phaser.Scene, heroes?: any) {
        super(x, y, scene);
        Phaser.GameObjects.Container.call(this, scene, x, y);
        this.menuItems = [];
        this.menuItemIndex = 0;
        this.heroes = heroes;
        this.x = x;
        this.y = y;
    }

    confirm() {
        this.scene.events.emit("Enemy", this.menuItemIndex);
    }
}

export class HeroesMenu extends Menu {
    constructor(x: number, y: number, scene: Phaser.Scene) {
        super(x, y, scene);
    }
}

export class ActionsMenu extends Menu {
    constructor(x: number, y: number, scene: Phaser.Scene) {
        super(x, y, scene);
        this.addMenuItem("Attack");
        this.addMenuItem("Attack");
        this.addMenuItem("Attack");
        this.addMenuItem("Attack");
    }

    confirm() {
        this.scene.events.emit("SelectEnemies");
    }
}

export class Message extends Phaser.GameObjects.Container {
    graphics: Phaser.GameObjects.Graphics;
    text: Phaser.GameObjects.Text;
    hideEvent: Phaser.Time.TimerEvent | null;
    constructor(scene: Phaser.Scene, events: any) {
        super(scene, 160, 30);

        const graphics = this.scene.add.graphics();
        this.add(graphics);
        graphics.lineStyle(1, 0xffffff, 0.8);
        graphics.fillStyle(0x031f4c, 0.3);
        graphics.strokeRect(-90, -15, 180, 30);
        graphics.fillRect(-90, -15, 180, 30);
        this.text = new Phaser.GameObjects.Text(scene, 0, 0, "", {
            color: "#ffffff",
            align: "center",
            fontSize: 13,
            wordWrap: { width: 160, useAdvancedWrap: true },
        });
        this.add(this.text);
        this.text.setOrigin(0.5);
        events.on("Message", this.showMessage, this);
        this.visible = false;
    }

    showMessage(text: string | string[]) {
        this.text.setText(text);
        this.visible = true;
        if (this.hideEvent) this.hideEvent.remove(false);
        this.hideEvent = this.scene.time.addEvent({
            delay: 2000,
            callback: this.hideMessage,
            callbackScope: this,
        });
    }

    hideMessage() {
        this.hideEvent = null;
        this.visible = false;
    }
}
